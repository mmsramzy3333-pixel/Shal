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

    // 1. Authenticate caller
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

    // 2. Admin client with Service Role Key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 3. Verify caller's role
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
        JSON.stringify({ error: 'Forbidden: Only Agency Owners or Administrators may reset employee passwords' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Validate body
    const body = await req.json();
    const { userId, newPassword } = body;

    if (!userId || typeof userId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Bad Request: Target user ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
      return new Response(
        JSON.stringify({ error: 'Bad Request: New password must be at least 6 characters long' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Update user password in Supabase Auth via Admin API
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword.trim() }
    );

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message || 'Failed to update user password' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Record audit log
    await supabaseAdmin.from('audit_logs').insert({
      timestamp: new Date().toISOString(),
      actor_id: callerUser.id,
      actor_email: callerProfile.email || callerUser.email,
      action_type: 'user.password_reset',
      target_resource_id: userId,
      target_resource_type: 'auth.user',
      new_data: { reset_by: callerProfile.role },
    }).catch(() => {});

    return new Response(
      JSON.stringify({ success: true, message: 'Password updated successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
