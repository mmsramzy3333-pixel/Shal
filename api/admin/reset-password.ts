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
        error: 'Forbidden: Strictly Shal Agency Owner or Administrator is authorized to reset passwords.',
      });
    }

    const { userId, newPassword } = req.body;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Target user ID is required' });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Call Admin API to update password in auth.users
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword.trim() }
    );

    if (updateError) {
      return res.status(400).json({ error: updateError.message || 'Failed to update user password' });
    }

    // Record in audit_logs
    await supabaseAdmin.from('audit_logs').insert({
      timestamp: new Date().toISOString(),
      actor_id: callerId,
      actor_email: callerProfile.email || userData.user.email,
      action_type: 'user.password_reset',
      target_resource_id: userId,
      target_resource_type: 'auth.user',
      new_data: { reset_by: callerProfile.role },
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (err: any) {
    console.error('Error resetting password:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
