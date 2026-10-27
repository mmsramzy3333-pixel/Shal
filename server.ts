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
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

const supabaseServer = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Shal Agency Supabase OS',
    timestamp: new Date().toISOString(),
  });
});

// Admin Route: Add new team member (RESTRICTED STRICTLY TO OWNER)
app.post('/api/admin/create-member', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing bearer token' });
    }

    const token = authHeader.split(' ')[1];
    const { data: userData, error: userError } = await supabaseServer.auth.getUser(token);

    if (userError || !userData?.user) {
      return res.status(401).json({ error: 'Invalid authentication session' });
    }

    const callerId = userData.user.id;

    // Check caller's role in public.profiles to verify they are 'owner'
    const { data: callerProfile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('role')
      .eq('id', callerId)
      .maybeSingle();

    const isOwner = callerProfile?.role === 'owner';

    // If caller is not owner, reject immediately
    if (!isOwner) {
      return res.status(403).json({
        error: 'Forbidden: Strictly Shal Agency Founder / Owner is authorized to provision new members.',
      });
    }

    const { name, email, password, role = 'member', employeeNumber, team = 'operations' } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Create user via Supabase admin if service key is available, or create profile
    let newUserId = '';
    const tempPassword = password || 'Shal@2026';

    const { data: newUser, error: createError } = await supabaseServer.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name, employee_number: employeeNumber, team },
    });

    if (createError) {
      // If admin API is not enabled (e.g. anon key used as fallback), respond with informative error
      return res.status(400).json({ error: createError.message });
    }

    newUserId = newUser.user.id;

    // Insert user into profiles
    const { error: insertProfileError } = await supabaseServer.from('profiles').upsert({
      id: newUserId,
      name,
      email,
      role,
      employee_number: employeeNumber,
      team,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertProfileError) {
      return res.status(500).json({ error: insertProfileError.message });
    }

    // Log administrative action in audit_logs
    await supabaseServer.from('audit_logs').insert({
      timestamp: new Date().toISOString(),
      actor_id: callerId,
      actor_email: userData.user.email,
      action_type: 'user.created',
      target_resource_id: newUserId,
      target_resource_type: 'profile',
      new_data: { name, email, role, employeeNumber, team },
    });

    return res.status(201).json({
      success: true,
      userId: newUserId,
      message: 'Team member created and provisioned successfully.',
    });
  } catch (err: any) {
    console.error('Error creating member:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
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
