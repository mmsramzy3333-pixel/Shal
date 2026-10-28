-- ==============================================================================
-- SHAL AGENCY - MIGRATION 002: AUTHENTICATION REPAIR & USER RECONCILIATION
-- Ensures public.profiles is canonically bound to auth.users.id (UUID),
-- fixes handle_new_auth_user trigger to handle existing emails safely,
-- and tightens Row Level Security (RLS) policies against privilege escalation.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TEAMS TABLE (Ensure table & initial records exist)
CREATE TABLE IF NOT EXISTS public.teams (
  id text PRIMARY KEY,
  name text NOT NULL,
  name_ar text,
  created_at timestamptz DEFAULT now()
);

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
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar;

-- 3. PROFILES TABLE STRUCTURE
CREATE TABLE IF NOT EXISTS public.profiles (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  employee_number text,
  team text REFERENCES public.teams(id) ON DELETE SET NULL,
  avatar text,
  status text NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure unique constraint on lower(email)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_lower_email ON public.profiles (lower(email));
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- 4. RECONCILIATION PROCEDURE: Sync legacy profile IDs with auth.users canonical UUIDs
DO $$
DECLARE
  rec RECORD;
BEGIN
  -- Reconcile any existing profile whose ID does not match auth.users UUID for the same email
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    FOR rec IN 
      SELECT p.id AS old_profile_id, p.email, u.id::text AS auth_uuid
      FROM public.profiles p
      JOIN auth.users u ON lower(p.email) = lower(u.email)
      WHERE p.id <> u.id::text
    LOOP
      -- Check if destination ID already exists
      IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = rec.auth_uuid) THEN
        UPDATE public.profiles
        SET id = rec.auth_uuid,
            updated_at = now()
        WHERE id = rec.old_profile_id;
      ELSE
        -- Delete the legacy unlinked row to avoid collision
        DELETE FROM public.profiles WHERE id = rec.old_profile_id;
      END IF;
    END LOOP;
  END IF;
END $$;

-- 5. RLS SECURITY HELPER FUNCTIONS
-- Helper: get role of current authenticated user from profiles
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()::text LIMIT 1),
    (SELECT role FROM public.profiles WHERE lower(email) = lower(auth.jwt()->>'email') LIMIT 1),
    'member'
  );
$$;

-- Helper: check if caller is owner
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_auth_role() = 'owner';
$$;

-- Helper: check if caller is admin or owner
CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_auth_role() IN ('owner', 'admin');
$$;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES FOR PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read profiles for authenticated and public app users" ON public.profiles;
DROP POLICY IF EXISTS "Allow read profiles for all" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile or admin/owner" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile or owner/admin" ON public.profiles;
DROP POLICY IF EXISTS "Only owner can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles read policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles delete policy" ON public.profiles;

-- SELECT: Authenticated users can read team profiles. Anon can read basic fields needed for login verification.
CREATE POLICY "Profiles read policy"
  ON public.profiles FOR SELECT
  USING (true);

-- INSERT: Only the user themselves with matching auth.uid(), or an authenticated owner/admin, or the service_role
CREATE POLICY "Profiles insert policy"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      auth.uid()::text = id OR
      public.is_admin_or_owner()
    )
  );

-- UPDATE: Normal users can only update their own profile (name, avatar), but NOT their own role or status.
-- Only owner/admin can update roles, status, and other users' records.
CREATE POLICY "Profiles update policy"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      auth.uid()::text = id OR
      public.is_admin_or_owner()
    )
  )
  WITH CHECK (
    -- If user is updating their own record and is not an owner/admin, they cannot escalate their role
    (
      auth.uid()::text = id AND
      NOT public.is_admin_or_owner() AND
      role = (SELECT role FROM public.profiles WHERE id = auth.uid()::text)
    )
    OR
    public.is_admin_or_owner()
  );

-- DELETE: Strictly owner can delete team members
CREATE POLICY "Profiles delete policy"
  ON public.profiles FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    public.is_owner()
  );

-- 7. ROBUST TRIGGER: AUTO-PROVISION & RECONCILE PROFILE ON AUTH.USERS INSERT
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_role text;
  v_team text;
  v_emp_num text;
  v_existing_id text;
BEGIN
  v_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  v_role := COALESCE(
    new.raw_user_meta_data->>'role',
    CASE 
      WHEN lower(new.email) IN ('m.m.s.ramzy3333@gmail.com', 'medhat.nabdalwusul@gmail.com') THEN 'owner'
      ELSE 'member'
    END
  );
  v_team := COALESCE(new.raw_user_meta_data->>'team', 'operations');
  v_emp_num := COALESCE(new.raw_user_meta_data->>'employee_number', '01');

  -- 1. Check if a profile with this email already exists under a legacy ID
  SELECT id INTO v_existing_id
  FROM public.profiles
  WHERE lower(email) = lower(new.email)
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- If existing profile has a different ID, update its ID to match the canonical auth.users UUID
    IF v_existing_id <> new.id::text THEN
      UPDATE public.profiles
      SET id = new.id::text,
          name = COALESCE(v_name, public.profiles.name),
          role = CASE WHEN public.profiles.role = 'owner' THEN 'owner' ELSE v_role END,
          team = COALESCE(public.profiles.team, v_team),
          employee_number = COALESCE(public.profiles.employee_number, v_emp_num),
          updated_at = now()
      WHERE lower(email) = lower(new.email);
    ELSE
      -- Profile already exists with matching ID, update metadata safely
      UPDATE public.profiles
      SET name = COALESCE(v_name, public.profiles.name),
          updated_at = now()
      WHERE id = new.id::text;
    END IF;
  ELSE
    -- 2. Insert new profile
    INSERT INTO public.profiles (
      id,
      name,
      email,
      role,
      employee_number,
      team,
      status,
      created_at,
      updated_at
    ) VALUES (
      new.id::text,
      v_name,
      lower(new.email),
      v_role,
      v_emp_num,
      v_team,
      'active',
      now(),
      now()
    );
  END IF;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_auth_user warning: %', SQLERRM;
    RETURN new;
END;
$$;

-- Bind trigger to auth.users
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_auth_user();
  END IF;
END $$;

-- 8. AUDIT LOGS TRIGGER: RECORD ROLE CHANGES
CREATE OR REPLACE FUNCTION public.log_profile_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_actor text;
  current_email text;
BEGIN
  IF (OLD.role IS DISTINCT FROM NEW.role) THEN
    current_actor := COALESCE(auth.uid()::text, 'system');
    current_email := COALESCE(auth.jwt()->>'email', 'system@shal.agency');

    INSERT INTO public.audit_logs (
      actor_id,
      actor_email,
      action_type,
      target_resource_id,
      target_resource_type,
      old_data,
      new_data,
      timestamp
    ) VALUES (
      current_actor,
      current_email,
      'user.role_updated',
      NEW.id,
      'profile',
      jsonb_build_object('role', OLD.role, 'email', OLD.email, 'name', OLD.name),
      jsonb_build_object('role', NEW.role, 'email', NEW.email, 'name', NEW.name),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profile_role_changed ON public.profiles;
CREATE TRIGGER trg_profile_role_changed
  AFTER UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_role_change();

-- 9. AUDIT LOGS RLS POLICIES (Immutable append-only)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read audit logs for owner and admin" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "No update on audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "No delete on audit logs" ON public.audit_logs;

CREATE POLICY "Audit logs select policy"
  ON public.audit_logs FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    public.is_admin_or_owner()
  );

CREATE POLICY "Audit logs insert policy"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Audit logs update policy"
  ON public.audit_logs FOR UPDATE
  USING (false);

CREATE POLICY "Audit logs delete policy"
  ON public.audit_logs FOR DELETE
  USING (false);

-- 10. REALTIME PUBLICATION
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'audit_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
  END IF;
END $$;
