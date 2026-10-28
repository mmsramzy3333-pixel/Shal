import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

function cleanSupabaseUrl(url?: string): string {
  if (!url) return 'https://tnrtoyibqblajkcsglhb.supabase.co';
  let cleaned = url.trim();
  cleaned = cleaned.replace(/\/+$/, '');
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned || 'https://tnrtoyibqblajkcsglhb.supabase.co';
}

const SUPABASE_URL = cleanSupabaseUrl(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DTz901w6j9xCg8RHQeBnjg_kSeZF_Pw';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client only if service role key is available
const supabaseAdmin = SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Shal Agency Supabase OS',
    adminApiConfigured: Boolean(supabaseAdmin),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Admin Route: Add new team member (Privileged Account Creation)
 * Authenticates caller, verifies owner/admin role from public.profiles,
 * provisions real Supabase Auth account with temp password,
 * and upserts matching public.profiles record with the canonical Auth UUID.
 */
app.post('/api/admin/create-member', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({
        error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is required to provision team accounts.',
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

    // Check caller's role in public.profiles (trusted source)
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, email')
      .eq('id', callerId)
      .maybeSingle();

    if (profileError || !callerProfile) {
      return res.status(403).json({ error: 'Forbidden: Caller profile could not be verified' });
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
});

/**
 * Admin Route: Reset employee password (Privileged Password Reset)
 */
app.post('/api/admin/reset-password', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({
        error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is required to reset passwords.',
      });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token' });
    }

    const token = authHeader.split(' ')[1].trim();

    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid authentication session' });
    }

    const callerId = userData.user.id;

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
});

/**
 * Admin Route: Reconcile existing legacy profile rows with auth.users
 */
app.post('/api/admin/reconcile-users', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY required' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1].trim();
    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .maybeSingle();

    if (callerProfile?.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden: Owner only' });
    }

    // Fetch all auth users
    const { data: authUsersData, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
    if (authUsersError) {
      return res.status(500).json({ error: authUsersError.message });
    }

    let reconciledCount = 0;
    for (const u of authUsersData.users) {
      if (!u.email) continue;
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', u.email.toLowerCase())
        .maybeSingle();

      if (existingProfile && existingProfile.id !== u.id) {
        // Re-link profile with canonical auth UUID
        await supabaseAdmin.from('profiles').delete().eq('id', existingProfile.id);
        await supabaseAdmin.from('profiles').insert({
          ...existingProfile,
          id: u.id,
          updated_at: new Date().toISOString(),
        });
        reconciledCount++;
      } else if (!existingProfile) {
        await supabaseAdmin.from('profiles').insert({
          id: u.id,
          name: u.user_metadata?.name || u.email.split('@')[0],
          email: u.email.toLowerCase(),
          role: u.user_metadata?.role || 'member',
          status: 'active',
          created_at: u.created_at,
          updated_at: new Date().toISOString(),
        });
        reconciledCount++;
      }
    }

    return res.status(200).json({ success: true, reconciledCount });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Shal Agency Application running on port ${PORT}`);
  });
}

startServer();
