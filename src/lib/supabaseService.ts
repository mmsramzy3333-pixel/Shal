import {
  supabase,
  DbProfile,
  DbTeam,
  DbTask,
  DbAuditLog,
  AppRole,
  mapRoleToSupabaseRole,
} from './supabase';
import { User, Task, ActivityLogItem } from '../types';

/**
 * Validates and retrieves the current authenticated Supabase session.
 * Throws or returns null if no valid session is active.
 */
export async function getCurrentUserSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) {
    return null;
  }
  return session;
}

/**
 * Requires an active authenticated user session.
 * Throws an explicit error if the user is unauthenticated.
 */
export async function requireUserSession() {
  const session = await getCurrentUserSession();
  if (!session) {
    throw new Error('Unauthenticated: An active Supabase user session is required for this operation.');
  }
  return session;
}

// ==============================================================================
// 1. PROFILES CRUD OPERATIONS (Authenticated)
// ==============================================================================

/**
 * Fetches all user profiles from Supabase PostgreSQL (utilizing user session & RLS)
 */
export async function getProfiles(): Promise<DbProfile[]> {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      console.warn('[Supabase Profiles] No active session found when requesting profiles list.');
    }

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
 * RLS enforces that only users with the 'owner' role can insert records.
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

// Backward-compatible aliases
export const getSupabaseProfiles = getProfiles;
export const upsertSupabaseProfile = upsertProfile;
export const updateSupabaseProfile = updateProfile;
export const updateSupabaseUserRole = updateProfileRole;
export const deleteSupabaseProfile = deleteProfile;
export const getSupabaseTeams = getTeams;

// ==============================================================================
// 2. TASKS CRUD OPERATIONS (Authenticated)
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
  taskData: Omit<DbTask, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; data?: DbTask; error?: string }> {
  try {
    const session = await requireUserSession();

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...taskData,
        created_by: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
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
    await requireUserSession();

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
 * Deletes a task from Supabase PostgreSQL.
 * Automatically fires database trigger `trg_task_deleted`
 * which writes an atomic deletion record to `public.audit_logs`.
 */
export async function deleteTask(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireUserSession();

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

// Backward-compatible aliases
export const getSupabaseTasks = getTasks;
export const deleteSupabaseTask = deleteTask;

// ==============================================================================
// 3. AUDIT LOGS OPERATIONS (Authenticated & Realtime)
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

export const getSupabaseAuditLogs = getAuditLogs;

/**
 * Subscribes to real-time additions on public.audit_logs.
 * Broadcasts events as triggers write them atomically.
 */
export function subscribeToAuditLogs(
  onInsert: (log: DbAuditLog) => void
) {
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
// 4. DATA MAPPING HELPERS
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
