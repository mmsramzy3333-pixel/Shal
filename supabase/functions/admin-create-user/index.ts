// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This Edge Function provisions real Supabase Auth accounts and application profiles.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.118.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is required' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Authenticate caller using their Bearer token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing or invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user: callerUser }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !callerUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid authentication session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Admin Supabase client with Service Role Key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 3. Verify caller's role from trusted database source (public.profiles)
    const { data: callerProfile, error: profileQueryError } = await supabaseAdmin
      .from('profiles')
      .select('role, email')
      .eq('id', callerUser.id)
      .maybeSingle();

    if (profileQueryError || !callerProfile) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Caller profile could not be verified' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isAuthorized = callerProfile.role === 'owner' || callerProfile.role === 'admin';
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Only Agency Owners or Administrators may provision users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Parse and validate request payload
    const body = await req.json();
    const { name, email, password, role = 'member', employeeNumber, team = 'operations' } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return new Response(
        JSON.stringify({ error: 'Bad Request: Full name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Bad Request: Valid email address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const validRoles = ['owner', 'admin', 'member'];

    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: `Bad Request: Role must be one of: ${validRoles.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Privilege escalation check: only owner can create another owner or admin
    if ((role === 'owner' || role === 'admin') && callerProfile.role !== 'owner') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Only the Agency Owner can provision administrative or owner roles' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userPassword = password && typeof password === 'string' && password.trim().length >= 6
      ? password.trim()
      : 'Shal@2026';

    // 5. Create real Auth user using documented Admin API
    const { data: newAuthData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        name: cleanName,
        employee_number: employeeNumber || null,
        team: team || 'operations',
        role,
      },
    });

    if (createAuthError || !newAuthData?.user) {
      return new Response(
        JSON.stringify({ error: createAuthError?.message || 'Failed to create Supabase Auth user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newUserId = newAuthData.user.id;

    // 6. Explicit upsert into public.profiles with canonical Auth UUID
    const { error: profileUpsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUserId,
        name: cleanName,
        email: cleanEmail,
        role,
        employee_number: employeeNumber || null,
        team,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (profileUpsertError) {
      // Rollback Auth user to prevent orphaned auth record
      await supabaseAdmin.auth.admin.deleteUser(newUserId).catch(() => {});
      return new Response(
        JSON.stringify({ error: `Profile creation failed: ${profileUpsertError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Record immutable audit log
    await supabaseAdmin.from('audit_logs').insert({
      timestamp: new Date().toISOString(),
      actor_id: callerUser.id,
      actor_email: callerProfile.email || callerUser.email,
      action_type: 'user.created',
      target_resource_id: newUserId,
      target_resource_type: 'profile',
      new_data: {
        name: cleanName,
        email: cleanEmail,
        role,
        team,
        employeeNumber,
      },
    }).catch(() => {});

    // 8. Return structured success response (NO plaintext password in response)
    return new Response(
      JSON.stringify({
        success: true,
        message: 'User provisioned successfully',
        user: {
          id: newUserId,
          name: cleanName,
          email: cleanEmail,
          role,
          team,
          employeeNumber,
          status: 'active',
        },
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
