import {
  supabase,
  DbProfile,
  DbTeam,
  DbTask,
  DbAuditLog,
  AppRole,
  mapRoleToSupabaseRole,
  mapSupabaseRoleToRoleId,
} from './supabaseClient';
import { User, Task, ActivityLogItem } from '../types';

// ==============================================================================
// 1. SESSION & AUTHENTICATION (Supabase Auth Client)
// ==============================================================================

/**
 * Validates and retrieves the current authenticated Supabase session.
 * Returns null if no active session is found.
 */
export async function getCurrentUserSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      return null;
    }
    return session;
  } catch (err) {
    console.warn('[Supabase getSession notice]:', err);
    return null;
  }
}

/**
 * Retrieves the currently authenticated Supabase Auth user.
 */
export async function getCurrentAuthUser() {
  const session = await getCurrentUserSession();
  return session?.user || null;
}

/**
 * Enforces an active authenticated user session.
 * Throws an explicit error if the user is unauthenticated.
 */
export async function requireUserSession() {
  const session = await getCurrentUserSession();
  if (!session) {
    throw new Error('غير مصرح: يتطلب تنفيذ هذه العملية وجود جلسة مستخدم نشطة في Supabase.');
  }
  return session;
}

/**
 * Authenticates user credentials with Supabase Auth strictly using signInWithPassword.
 * Never bypasses authentication or falls back to simulated password checks.
 */
export async function signInWithEmail(email: string, password: string): Promise<{
  success: boolean;
  user?: any;
  session?: any;
  profile?: DbProfile | null;
  error?: string;
}> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      return {
        success: false,
        error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.',
      };
    }

    // Call official Supabase Auth signInWithPassword
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPass,
    });

    if (error || !data.user || !data.session) {
      // Safe diagnostic log without credentials
      console.warn('[Supabase Auth Failed]:', {
        status: (error as any)?.status,
        name: error?.name,
        code: (error as any)?.code,
      });

      return {
        success: false,
        error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التأكد من صحة البيانات والمحاولة مجدداً.',
      };
    }

    // Fetch matching profile from public.profiles
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileErr) {
      console.warn('[Supabase Profile query notice]:', profileErr.message);
    }

    // Verify account is active
    if (profile && profile.status === 'inactive') {
      await signOutUser();
      return {
        success: false,
        error: 'تم تعطيل هذا الحساب من قِبل إدارة الوكالة. يرجى مراجعة الإدارة لتفعيل الحساب.',
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      profile: profile || null,
    };
  } catch (err: any) {
    console.warn('[Supabase Auth Exception]:', err?.message || 'Network exception');
    return {
      success: false,
      error: 'تعذر الاتصال بخدمة المصادقة في الوقت الحالي. يرجى التحقق من اتصالك بالإنترنت.',
    };
  }
}

/**
 * Signs up a new user in Supabase Auth and provisions their profile
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string,
  role: AppRole = 'member'
) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPass,
      options: {
        data: {
          name: name || cleanEmail.split('@')[0],
          role: role,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      await upsertProfile({
        id: data.user.id,
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        role,
        status: 'active',
      });
    }

    return { success: true, user: data.user, session: data.session };
  } catch (err: any) {
    return { success: false, error: err?.message || 'فشل إنشاء الحساب في Supabase' };
  }
}

/**
 * Privileged Admin API: Creates a real Auth user and linked public.profile record
 * via the server endpoint or Edge Function using the server-only service role key.
 */
export async function adminCreateUserAccount(params: {
  name: string;
  email: string;
  password?: string;
  role: AppRole;
  employeeNumber?: string;
  team?: string;
}): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    if (!session?.access_token) {
      return {
        success: false,
        error: 'غير مصرح: يجب تسجيل الدخول بحساب مدير مصرح لتنفيذ هذا الإجراء.',
      };
    }

    // Call server admin route
    const response = await fetch('/api/admin/create-member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || `فشل إنشاء الحساب (رمز الاستجابة: ${response.status})`,
      };
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    console.error('[Admin create member exception]:', err);
    return {
      success: false,
      error: err.message || 'فشل الاتصال بخادم إدارة الحسابات.',
    };
  }
}

/**
 * Signs out the current user session from Supabase
 */
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('[Supabase signOut notice]:', error.message);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Subscribes to Supabase Auth state changes
 */
export function onAuthStateChange(callback: (session: any) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Admin function to reset a team member's password in Supabase Auth.
 * Uses privileged backend endpoint with server-side service role.
 */
export async function adminResetUserPassword(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    if (!session?.access_token) {
      return {
        success: false,
        error: 'غير مصرح: يجب تسجيل الدخول بحساب مسؤول لتعديل كلمة المرور.',
      };
    }

    // Call server admin reset endpoint
    const response = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId, newPassword }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'فشلت عملية إعادة تعيين كلمة المرور عبر الخادم.',
      };
    }

    // Also touch updated_at in profiles table
    await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', userId);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'فشلت عملية إعادة تعيين كلمة المرور' };
  }
}

// ==============================================================================
// 2. PROFILES CRUD OPERATIONS (Authenticated)
// ==============================================================================

/**
 * Fetches all user profiles from Supabase PostgreSQL (utilizing user session & RLS)
 */
export async function getProfiles(): Promise<DbProfile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[Supabase Profiles fetch notice]:', error.message);
      return [];
    }
    return (data as DbProfile[]) || [];
  } catch (err: any) {
    console.warn('[Supabase Profiles fetch exception]:', err?.message || err);
    return [];
  }
}

/**
 * Fetches a single user profile by ID
 */
export async function getProfileById(userId: string): Promise<DbProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error(`[Supabase Profile fetch error for ${userId}]:`, error.message);
    return null;
  }
  return data as DbProfile | null;
}

/**
 * Creates or provisions a new user profile record.
 */
export async function createProfile(
  profileData: Omit<DbProfile, 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: DbProfile; error?: string }> {
  try {
    await requireUserSession();

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as DbProfile };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates an existing user profile (respects RLS ownership & admin boundaries)
 */
export async function updateProfile(
  userId: string,
  updates: Partial<DbProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireUserSession();

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Upserts a user profile record in Supabase (insert or update on id)
 */
export async function upsertProfile(
  profileData: Partial<DbProfile> & { id: string }
): Promise<{ success: boolean; data?: DbProfile; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: (data as DbProfile) || undefined };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates a user's RBAC role in PostgreSQL.
 * Automatically fires the database trigger `trg_profile_role_changed`
 * which writes an atomic log entry to `public.audit_logs`.
 */
export async function updateProfileRole(
  userId: string,
  newRole: AppRole
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireUserSession();

    const { error } = await supabase
      .from('profiles')
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('[Supabase Role Update error]:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a user profile (RLS strictly restricts to 'owner')
 */
export async function deleteProfile(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireUserSession();

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Backward-compatible profile aliases
export const getSupabaseProfiles = getProfiles;
export const upsertSupabaseProfile = upsertProfile;
export const updateSupabaseProfile = updateProfile;
export const updateSupabaseUserRole = updateProfileRole;
export const deleteSupabaseProfile = deleteProfile;

// ==============================================================================
// 3. TEAMS CRUD OPERATIONS
// ==============================================================================

/**
 * Fetches all teams from Supabase PostgreSQL
 */
export async function getTeams(): Promise<DbTeam[]> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('[Supabase Teams fetch notice]:', error.message);
      return [];
    }
    return (data as DbTeam[]) || [];
  } catch (err: any) {
    console.warn('[Supabase Teams fetch exception]:', err?.message || err);
    return [];
  }
}

/**
 * Creates a new team in Supabase
 */
export async function createTeam(
  teamData: DbTeam
): Promise<{ success: boolean; data?: DbTeam; error?: string }> {
  try {
    await requireUserSession();

    const { data, error } = await supabase
      .from('teams')
      .insert({
        ...teamData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as DbTeam };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates a team record
 */
export async function updateTeam(
  teamId: string,
  updates: Partial<DbTeam>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireUserSession();

    const { error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a team
 */
export async function deleteTeam(teamId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireUserSession();

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export const getSupabaseTeams = getTeams;

// ==============================================================================
// 4. TASKS CRUD OPERATIONS (Authenticated)
// ==============================================================================

/**
 * Fetches all tasks from Supabase PostgreSQL (utilizing user session & RLS)
 */
export async function getTasks(): Promise<DbTask[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase Tasks fetch notice]:', error.message);
      return [];
    }
    return (data as DbTask[]) || [];
  } catch (err: any) {
    console.warn('[Supabase Tasks fetch exception]:', err?.message || err);
    return [];
  }
}

/**
 * Fetches a single task by ID
 */
export async function getTaskById(taskId: string): Promise<DbTask | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .maybeSingle();

  if (error) {
    return null;
  }
  return data as DbTask | null;
}

/**
 * Creates a new task in Supabase PostgreSQL using current user session
 */
export async function createTask(
  taskData: Omit<DbTask, 'created_at' | 'updated_at'> & { id?: string }
): Promise<{ success: boolean; data?: DbTask; error?: string }> {
  try {
    const session = await getCurrentUserSession();
    const createdBy = session?.user?.id || taskData.created_by || 'system';

    const insertPayload: any = {
      ...taskData,
      created_by: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (taskData.id) {
      insertPayload.id = taskData.id;
    }

    const { data, error } = await supabase
      .from('tasks')
      .upsert(insertPayload)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as DbTask };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates a task in Supabase PostgreSQL
 */
export async function updateTask(
  taskId: string,
  updates: Partial<DbTask>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates status of a task
 */
export async function updateTaskStatus(
  taskId: string,
  status: string
): Promise<{ success: boolean; error?: string }> {
  return updateTask(taskId, { status });
}

/**
 * Deletes a task from Supabase PostgreSQL.
 * Automatically fires database trigger `trg_task_deleted`
 * which writes an atomic deletion record to `public.audit_logs`.
 */
export async function deleteTask(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Play a subtle, pleasant Web Audio chime for real-time notifications
 * Safely handles browser autoplay policies without erroring.
 */
export function playNotificationSound(type: 'assignment' | 'deadline' | 'generic' = 'generic') {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'assignment') {
      // Pleasant double ascending chime (E5 -> B5) for new task assignment
      gain.gain.setValueAtTime(0.04, now);
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(987.77, now + 0.12); // B5
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
      osc.start(now);
      osc.stop(now + 0.38);
    } else if (type === 'deadline') {
      // Urgent soft double pulse (A5 -> F#5) for approaching deadlines
      gain.gain.setValueAtTime(0.05, now);
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(739.99, now + 0.14); // F#5
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      osc.start(now);
      osc.stop(now + 0.42);
    } else {
      // Soft single pop/ping
      gain.gain.setValueAtTime(0.03, now);
      osc.frequency.setValueAtTime(523.25, now); // C5
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  } catch {
    // Graceful fallback if audio is disallowed or blocked by policy
  }
}

export interface RealtimeNotificationPayload {
  id?: string;
  eventType: 'task_assigned' | 'deadline_warning' | 'task_updated' | 'task_created';
  taskId: string;
  taskTitle: string;
  assignedTo: string[];
  dueDate?: string;
  priority?: string;
  senderName?: string;
  message?: string;
  timestamp: string;
}

/**
 * Broadcasts a real-time notification across all active browser sessions
 * using Supabase Realtime broadcast channel.
 */
export async function broadcastRealtimeNotification(payload: RealtimeNotificationPayload): Promise<void> {
  try {
    const channel = supabase.channel('agency_realtime_notifications');
    await channel.subscribe();
    await channel.send({
      type: 'broadcast',
      event: 'notification_event',
      payload,
    });
  } catch (err) {
    console.warn('[Supabase Realtime broadcast notification error]:', err);
  }
}

/**
 * Subscribes to the broadcast channel for instant multi-user notifications
 */
export function subscribeToNotificationBroadcast(
  onNotification: (payload: RealtimeNotificationPayload) => void
) {
  const channel = supabase
    .channel('agency_realtime_notifications')
    .on('broadcast', { event: 'notification_event' }, (event) => {
      if (event && event.payload) {
        onNotification(event.payload as RealtimeNotificationPayload);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribes to real-time changes on the tasks table via PostgreSQL CDC
 */
export function subscribeToTasksRealtime(
  onTaskChange: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: DbTask | null;
    old: Partial<DbTask> | null;
  }) => void
) {
  const channel = supabase
    .channel('tasks_changes_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
      },
      (payload) => {
        onTaskChange({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: (payload.new as DbTask) || null,
          old: (payload.old as Partial<DbTask>) || null,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export const getSupabaseTasks = getTasks;
export const deleteSupabaseTask = deleteTask;

// ==============================================================================
// 5. AUDIT LOGS OPERATIONS (Authenticated & Realtime)
// ==============================================================================

/**
 * Fetches real immutable audit logs from Supabase PostgreSQL.
 * RLS ensures only 'owner' and 'admin' can query this table.
 */
export async function getAuditLogs(limitCount = 100): Promise<DbAuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limitCount);

    if (error) {
      console.warn('[Supabase Audit Logs query]:', error.message);
      return [];
    }
    return (data as DbAuditLog[]) || [];
  } catch (err) {
    console.warn('[Supabase Audit Logs exception]:', err);
    return [];
  }
}

/**
 * Directly records an audit log event into public.audit_logs
 */
export async function recordSupabaseAuditLog(
  logData: Omit<DbAuditLog, 'id' | 'timestamp'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('audit_logs').insert({
      ...logData,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase Audit Log insert notice]:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export const getSupabaseAuditLogs = getAuditLogs;

/**
 * Subscribes to real-time additions on public.audit_logs.
 * Broadcasts events as database triggers fire atomically.
 */
export function subscribeToAuditLogs(onInsert: (log: DbAuditLog) => void) {
  const channel = supabase
    .channel('audit_logs_channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'audit_logs',
      },
      (payload) => {
        if (payload.new) {
          onInsert(payload.new as DbAuditLog);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export const subscribeToAuditLogsRealtime = subscribeToAuditLogs;

// ==============================================================================
// 6. DATA MAPPING HELPERS
// ==============================================================================

/**
 * Converts a database profile record to the application User model
 */
export function profileToUser(profile: DbProfile): User {
  let roleId = 'role-founder';
  if (profile.role === 'admin') {
    roleId = 'role-operations-manager';
  } else if (profile.role === 'member') {
    switch (profile.team) {
      case 'marketing':
        roleId = 'role-marketing-manager';
        break;
      case 'sales':
        roleId = 'role-sales-manager';
        break;
      case 'content':
        roleId = 'role-content-creator';
        break;
      case 'social':
        roleId = 'role-social-media';
        break;
      case 'uiux':
        roleId = 'role-ui-ux';
        break;
      case 'seo':
        roleId = 'role-seo';
        break;
      case 'developer':
        roleId = 'role-developer';
        break;
      case 'media_buying':
        roleId = 'role-media-buyer';
        break;
      default:
        roleId = 'role-account-manager';
        break;
    }
  }

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    roleIds: [roleId],
    employeeNumber: profile.employee_number || undefined,
    team: (profile.team as any) || 'operations',
    avatar: profile.avatar || '',
    status: profile.status,
    createdAt: profile.created_at || new Date().toISOString(),
  };
}

/**
 * Converts an application User to a Supabase DbProfile record
 */
export function userToProfile(user: User): DbProfile {
  const primaryRole = user.roleIds[0] || 'role-marketing-manager';
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: mapRoleToSupabaseRole(primaryRole),
    employee_number: user.employeeNumber || null,
    team: user.team,
    avatar: user.avatar,
    status: user.status,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Maps a DbAuditLog to ActivityLogItem for the UI
 */
export function auditLogToActivityItem(log: DbAuditLog): ActivityLogItem {
  let actionAr = 'حدث أمني في النظام';
  let entityType: ActivityLogItem['entityType'] = 'user';

  switch (log.action_type) {
    case 'user.role_updated':
      actionAr = `تعديل صلاحيات ودور مستخدم إلى: ${log.new_data?.role || 'غير محدد'}`;
      entityType = 'role';
      break;
    case 'task.deleted':
      actionAr = `حذف مهمة نهائيًا: ${log.old_data?.title || log.target_resource_id}`;
      entityType = 'task';
      break;
    case 'user.created':
      actionAr = `إضافة عضو جديد للنظام (${log.new_data?.name || log.target_resource_id})`;
      entityType = 'member';
      break;
    case 'user.status_updated':
      actionAr = `تحديث حالة حساب المستخدم`;
      entityType = 'user';
      break;
    default:
      actionAr = log.action_type;
      break;
  }

  return {
    id: log.id,
    userId: log.actor_id,
    userName: log.actor_email || (log.actor_id === 'system' ? 'النظام التلقائي' : log.actor_id),
    action: log.action_type,
    actionAr,
    entityType,
    entityName: log.target_resource_id,
    details: log.new_data ? JSON.stringify(log.new_data) : (log.old_data ? JSON.stringify(log.old_data) : undefined),
    createdAt: log.timestamp,
  };
}
