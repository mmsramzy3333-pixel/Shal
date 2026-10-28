import { createClient } from '@supabase/supabase-js';

function cleanSupabaseUrl(url?: string): string {
  if (!url) return 'https://tnrtoyibqblajkcsglhb.supabase.co';
  let cleaned = url.trim();
  cleaned = cleaned.replace(/\/+$/, '');
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned || 'https://tnrtoyibqblajkcsglhb.supabase.co';
}

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const SUPABASE_URL = cleanSupabaseUrl(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DTz901w6j9xCg8RHQeBnjg_kSeZF_Pw';
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_SERVICE_KEY) {
      return res.status(500).json({
        error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is required in environment variables.',
      });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token' });
    }

    const token = authHeader.split(' ')[1].trim();

    // Verify caller session using Anon Client
    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid authentication session' });
    }

    const callerId = userData.user.id;

    // Privileged Supabase Admin Client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Check caller's role in public.profiles (trusted source)
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, email')
      .eq('id', callerId)
      .maybeSingle();

    if (profileError || !callerProfile) {
      return res.status(403).json({ error: 'Forbidden: Caller profile verification failed' });
    }

    const isAuthorized = callerProfile.role === 'owner' || callerProfile.role === 'admin';
    if (!isAuthorized) {
      return res.status(403).json({
        error: 'Forbidden: Strictly Shal Agency Owner or Administrator is authorized to provision accounts.',
      });
    }

    const { name, email, password, role = 'member', employeeNumber, team = 'operations' } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const validRoles = ['owner', 'admin', 'member'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Allowed roles: ${validRoles.join(', ')}` });
    }

    // Role escalation protection: only owner can create another owner or admin
    if ((role === 'owner' || role === 'admin') && callerProfile.role !== 'owner') {
      return res.status(403).json({
        error: 'Forbidden: Only the Agency Owner can provision administrative or owner roles.',
      });
    }

    const userPassword = password && typeof password === 'string' && password.trim().length >= 6
      ? password.trim()
      : 'Shal@2026';

    // 1. Create real Supabase Auth user via Admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: userPassword,
      email_confirm: true,
      user_metadata: {
        name: cleanName,
        employee_number: employeeNumber || null,
        team,
        role,
      },
    });

    if (createError || !newUser?.user) {
      return res.status(400).json({ error: createError?.message || 'Failed to create Auth account' });
    }

    const newUserId = newUser.user.id;

    // 2. Upsert profile linked by canonical Auth user UUID
    const { error: insertProfileError } = await supabaseAdmin
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

    if (insertProfileError) {
      // Rollback Auth user on profile creation failure
      await supabaseAdmin.auth.admin.deleteUser(newUserId).catch(() => {});
      return res.status(500).json({ error: `Profile creation failed: ${insertProfileError.message}` });
    }

    // 3. Log into audit_logs
    await supabaseAdmin.from('audit_logs').insert({
      timestamp: new Date().toISOString(),
      actor_id: callerId,
      actor_email: callerProfile.email || userData.user.email,
      action_type: 'user.created',
      target_resource_id: newUserId,
      target_resource_type: 'profile',
      new_data: { name: cleanName, email: cleanEmail, role, employeeNumber, team },
    }).catch(() => {});

    return res.status(201).json({
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
    });
  } catch (err: any) {
    console.error('Error creating member:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
