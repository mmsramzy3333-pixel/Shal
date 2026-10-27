import { createClient } from '@supabase/supabase-js';

/**
 * Normalizes Supabase URL by removing any accidental trailing slashes or /rest/v1 path suffixes.
 * PostgREST client automatically appends /rest/v1, so the base URL must point directly to the project domain.
 */
export function cleanSupabaseUrl(url?: string): string {
  if (!url) return 'https://tnrtoyibqblajkcsglhb.supabase.co';
  let cleaned = url.trim();
  cleaned = cleaned.replace(/\/+$/, '');
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned || 'https://tnrtoyibqblajkcsglhb.supabase.co';
}

const rawEnvUrl: string = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const rawEnvKey: string = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const SUPABASE_URL: string = cleanSupabaseUrl(rawEnvUrl);
export const SUPABASE_ANON_KEY: string =
  rawEnvKey.trim() || 'sb_publishable_DTz901w6j9xCg8RHQeBnjg_kSeZF_Pw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type AppRole = 'owner' | 'admin' | 'member';

export interface DbProfile {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  employee_number?: string | null;
  team?: string | null;
  avatar?: string | null;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface DbTeam {
  id: string;
  name: string;
  name_ar?: string | null;
  created_at?: string;
}

export interface DbTask {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  team_type?: string | null;
  client_id?: string | null;
  project_id?: string | null;
  assigned_to?: string[];
  created_by?: string | null;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbAuditLog {
  id: string;
  timestamp: string;
  actor_id: string;
  actor_email?: string | null;
  action_type: string;
  target_resource_id: string;
  target_resource_type: string;
  old_data?: Record<string, any> | null;
  new_data?: Record<string, any> | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

/**
 * Maps legacy role code to Supabase RBAC 3-tier model
 */
export function mapRoleToSupabaseRole(roleIdOrCode: string): AppRole {
  if (roleIdOrCode === 'role-founder' || roleIdOrCode === 'founder' || roleIdOrCode === 'owner') {
    return 'owner';
  }
  if (
    roleIdOrCode === 'role-operations-manager' ||
    roleIdOrCode === 'operations_mgr' ||
    roleIdOrCode === 'admin'
  ) {
    return 'admin';
  }
  return 'member';
}

/**
 * Maps Supabase RBAC role to Shal agency role ID
 */
export function mapSupabaseRoleToRoleId(role: AppRole): string {
  switch (role) {
    case 'owner':
      return 'role-founder';
    case 'admin':
      return 'role-operations-manager';
    default:
      return 'role-marketing-manager';
  }
}
