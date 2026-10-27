-- ==============================================================================
-- SHAL AGENCY - COMPLETE RBAC & AUDIT LOGGING SCHEMA FOR SUPABASE
-- Project URL: https://tnrtoyibqblajkcsglhb.supabase.co
-- Description: Sets up 3-tier RBAC (owner, admin, member), Row Level Security,
--              atomic triggers for role updates and task deletions, and append-only
--              audit logging in public.audit_logs.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean Existing Schema (Safe & Idempotent)
DROP TRIGGER IF EXISTS trg_profile_role_changed ON public.profiles;
DROP TRIGGER IF EXISTS trg_task_deleted ON public.tasks;
DROP TRIGGER IF EXISTS trg_profile_created ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.log_role_change();
DROP FUNCTION IF EXISTS public.log_task_deletion();
DROP FUNCTION IF EXISTS public.log_profile_creation();
DROP FUNCTION IF EXISTS public.handle_new_auth_user();
DROP FUNCTION IF EXISTS public.current_app_role();
DROP FUNCTION IF EXISTS public.is_owner();
DROP FUNCTION IF EXISTS public.is_admin_or_owner();

-- 3. Create Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
  id text PRIMARY KEY,
  name text NOT NULL,
  name_ar text,
  created_at timestamptz DEFAULT now()
);

-- 4. Create Profiles Table (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  employee_number text,
  team text REFERENCES public.teams(id) ON DELETE SET NULL,
  avatar text,
  status text NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  team_type text,
  client_id text,
  project_id text,
  assigned_to text[] DEFAULT '{}',
  created_by text,
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Create Audit Logs Table (Append-Only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  actor_id text NOT NULL,
  actor_email text,
  action_type text NOT NULL,
  target_resource_id text NOT NULL,
  target_resource_type text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text
);

-- Create Performance Indexes for Audit Logs and Queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_resource_type, target_resource_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks USING GIN (assigned_to);

-- ==============================================================================
-- 7. RBAC Helper Functions (SECURITY DEFINER for Secure Evaluation)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS text AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid();
  RETURN COALESCE(v_role, 'member');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean AS $$
BEGIN
  RETURN (public.current_app_role() = 'owner');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS boolean AS $$
BEGIN
  RETURN (public.current_app_role() IN ('owner', 'admin'));
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 8. Row Level Security (RLS) Configuration
-- ==============================================================================

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 8.1 Teams Policies
DROP POLICY IF EXISTS "Allow authenticated users to read teams" ON public.teams;
CREATE POLICY "Allow authenticated users to read teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow owners to manage teams" ON public.teams;
CREATE POLICY "Allow owners to manage teams"
  ON public.teams FOR ALL
  TO authenticated
  USING (public.is_owner())
  WITH CHECK (public.is_owner());

-- 8.2 Profiles Policies
-- Read: Any authenticated user in the agency can view active profiles
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.profiles;
CREATE POLICY "Allow authenticated users to read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Insert: Only Owner can create new user profiles (or via auth trigger/admin route)
DROP POLICY IF EXISTS "Allow only owner to insert profiles" ON public.profiles;
CREATE POLICY "Allow only owner to insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_owner());

-- Update: Owner can update everything. Admin can update non-owner profiles (without elevating to owner).
-- Members can only update their own non-role metadata.
DROP POLICY IF EXISTS "Allow owner to update any profile" ON public.profiles;
CREATE POLICY "Allow owner to update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Allow admin to update non-owner profiles" ON public.profiles;
CREATE POLICY "Allow admin to update non-owner profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    public.is_admin_or_owner() 
    AND role <> 'owner'
  )
  WITH CHECK (
    public.is_admin_or_owner() 
    AND role <> 'owner'
  );

DROP POLICY IF EXISTS "Allow member to update own profile" ON public.profiles;
CREATE POLICY "Allow member to update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Delete: Strictly restricted to Owner
DROP POLICY IF EXISTS "Allow only owner to delete profiles" ON public.profiles;
CREATE POLICY "Allow only owner to delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_owner());

-- 8.3 Tasks Policies
DROP POLICY IF EXISTS "Allow authenticated to view tasks" ON public.tasks;
CREATE POLICY "Allow authenticated to view tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated to insert tasks" ON public.tasks;
CREATE POLICY "Allow authenticated to insert tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow task updates" ON public.tasks;
CREATE POLICY "Allow task updates"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    public.is_admin_or_owner() 
    OR created_by = auth.uid()::text 
    OR auth.uid()::text = ANY(assigned_to)
  );

DROP POLICY IF EXISTS "Allow only admin or owner to delete tasks" ON public.tasks;
CREATE POLICY "Allow only admin or owner to delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (public.is_admin_or_owner());

-- 8.4 Audit Logs Policies (APPEND-ONLY)
-- View: Only Owner and Admin can inspect audit logs
DROP POLICY IF EXISTS "Allow owner and admin to view audit logs" ON public.audit_logs;
CREATE POLICY "Allow owner and admin to view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin_or_owner());

-- Direct INSERT, UPDATE, DELETE denied for standard clients:
-- Audit logs are written EXCLUSIVELY via database triggers and SECURITY DEFINER functions!
DROP POLICY IF EXISTS "Deny direct client insert to audit logs" ON public.audit_logs;
CREATE POLICY "Deny direct client insert to audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS "Deny client updates to audit logs" ON public.audit_logs;
CREATE POLICY "Deny client updates to audit logs"
  ON public.audit_logs FOR UPDATE
  TO authenticated
  USING (false);

DROP POLICY IF EXISTS "Deny client deletes to audit logs" ON public.audit_logs;
CREATE POLICY "Deny client deletes to audit logs"
  ON public.audit_logs FOR DELETE
  TO authenticated
  USING (false);

-- ==============================================================================
-- 9. Atomic Database Triggers for Audit Logging & User Sync
-- ==============================================================================

-- 9.1 Role Change Trigger
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger AS $$
DECLARE
  v_actor_email text;
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    SELECT email INTO v_actor_email FROM auth.users WHERE id = auth.uid();
    
    INSERT INTO public.audit_logs (
      timestamp,
      actor_id,
      actor_email,
      action_type,
      target_resource_id,
      target_resource_type,
      old_data,
      new_data
    ) VALUES (
      now(),
      COALESCE(auth.uid()::text, 'system'),
      v_actor_email,
      'user.role_updated',
      NEW.id::text,
      'profile',
      jsonb_build_object('role', OLD.role, 'email', OLD.email, 'name', OLD.name),
      jsonb_build_object('role', NEW.role, 'email', NEW.email, 'name', NEW.name)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_profile_role_changed
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

-- 9.2 Task Deletion Trigger
CREATE OR REPLACE FUNCTION public.log_task_deletion()
RETURNS trigger AS $$
DECLARE
  v_actor_email text;
BEGIN
  SELECT email INTO v_actor_email FROM auth.users WHERE id = auth.uid();

  INSERT INTO public.audit_logs (
    timestamp,
    actor_id,
    actor_email,
    action_type,
    target_resource_id,
    target_resource_type,
    old_data
  ) VALUES (
    now(),
    COALESCE(auth.uid()::text, 'system'),
    v_actor_email,
    'task.deleted',
    OLD.id::text,
    'task',
    jsonb_build_object(
      'title', OLD.title,
      'status', OLD.status,
      'priority', OLD.priority,
      'created_by', OLD.created_by,
      'assigned_to', OLD.assigned_to
    )
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_task_deleted
  AFTER DELETE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.log_task_deletion();

-- 9.3 Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.log_profile_creation()
RETURNS trigger AS $$
DECLARE
  v_actor_email text;
BEGIN
  SELECT email INTO v_actor_email FROM auth.users WHERE id = auth.uid();

  INSERT INTO public.audit_logs (
    timestamp,
    actor_id,
    actor_email,
    action_type,
    target_resource_id,
    target_resource_type,
    new_data
  ) VALUES (
    now(),
    COALESCE(auth.uid()::text, 'system'),
    v_actor_email,
    'user.created',
    NEW.id::text,
    'profile',
    jsonb_build_object('role', NEW.role, 'email', NEW.email, 'name', NEW.name, 'team', NEW.team)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_creation();

-- 9.4 Auto-create Profile Trigger on auth.users Sign-up
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, employee_number, team, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'member'),
    COALESCE(new.raw_user_meta_data->>'employee_number', '01'),
    COALESCE(new.raw_user_meta_data->>'team', 'operations'),
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, public.profiles.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ==============================================================================
-- 10. Enable Supabase Realtime for audit_logs
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'audit_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
  END IF;
END $$;

-- 11. Initial Data Seeding for Shal Teams
INSERT INTO public.teams (id, name, name_ar) VALUES
  ('management', 'Management & Leadership', 'الإدارة العليا والتنفيذية'),
  ('operations', 'Operations & Workflow', 'إدارة العمليات والتشغيل'),
  ('marketing', 'Marketing & Growth', 'التسويق والنمو'),
  ('sales', 'Sales & Partnerships', 'المبيعات وتطوير الأعمال'),
  ('content', 'Content & Creative Copy', 'صناعة المحتوى والكتابة الإبداعية'),
  ('social', 'Social Media Management', 'إدارة منصات التواصل الاجتماعي'),
  ('uiux', 'UI / UX Design', 'تصميم واجهات وتجربة المستخدم'),
  ('seo', 'Search Engine Optimization', 'تحسين محركات البحث'),
  ('developer', 'Software & Web Development', 'التطوير البرمجي والحلول التقنية'),
  ('media_buying', 'Media Buying & Paid Ads', 'الحملات الإعلانية الممولة')
ON CONFLICT (id) DO NOTHING;
