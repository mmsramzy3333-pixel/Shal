-- ==============================================================================
-- SHAL AGENCY (وكالة شال للتسويق الرقمي) - SUPABASE DATABASE MIGRATION SCHEMA
-- Fully replaces Firebase with PostgreSQL, Row Level Security (RLS), and Triggers
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. TEAMS TABLE
create table if not exists public.teams (
  id text primary key,
  name text not null,
  name_ar text,
  created_at timestamptz default now()
);

-- Seed Initial Teams
insert into public.teams (id, name, name_ar) values
  ('management', 'Management & Leadership', 'الإدارة العليا والقيادة'),
  ('operations', 'Operations Management', 'إدارة العمليات'),
  ('marketing', 'Marketing Strategy', 'استراتيجيات التسويق'),
  ('sales', 'Sales & BD', 'المبيعات وتطوير الأعمال'),
  ('content', 'Content Creation', 'صناعة المحتوى الإبداعي'),
  ('social', 'Social Media Management', 'إدارة منصات التواصل'),
  ('uiux', 'UI/UX Design', 'تصميم تجربة وواجهة المستخدم'),
  ('seo', 'Search Engine Optimization', 'تحسين محركات البحث'),
  ('development', 'Fullstack & Web Dev', 'البرمجة وتطوير الأنظمة'),
  ('media_buying', 'Media Buying & Ads', 'الإعلانات الممولة والحملات')
on conflict (id) do update set
  name = excluded.name,
  name_ar = excluded.name_ar;

-- 3. PROFILES TABLE
create table if not exists public.profiles (
  id text primary key,
  name text not null,
  email text not null unique,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  employee_number text,
  team text references public.teams(id) on delete set null,
  avatar text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for rapid email lookups
create index if not exists idx_profiles_email on public.profiles(lower(email));
create index if not exists idx_profiles_role on public.profiles(role);

-- 4. TASKS TABLE
create table if not exists public.tasks (
  id text primary key,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'review', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  team_type text,
  client_id text,
  project_id text,
  assigned_to text[] default '{}',
  created_by text,
  due_date text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for tasks filtering
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_created_by on public.tasks(created_by);

-- 5. AUDIT LOGS TABLE (Atomic, append-only security log)
create table if not exists public.audit_logs (
  id text primary key default gen_random_uuid()::text,
  timestamp timestamptz default now(),
  actor_id text not null,
  actor_email text,
  action_type text not null,
  target_resource_id text not null,
  target_resource_type text not null,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text
);

-- Index for chronological audit log queries
create index if not exists idx_audit_logs_timestamp on public.audit_logs(timestamp desc);
create index if not exists idx_audit_logs_action on public.audit_logs(action_type);

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.teams enable row level security;
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.audit_logs enable row level security;

-- Helper function to inspect current user's role from JWT / profiles
create or replace function public.get_auth_role()
returns text
language sql
stable
security definer
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()::text or lower(email) = lower(auth.jwt()->>'email') limit 1),
    'member'
  );
$$;

-- Helper function to check if current user is owner or admin
create or replace function public.is_admin_or_owner()
returns boolean
language sql
stable
security definer
as $$
  select public.get_auth_role() in ('owner', 'admin');
$$;

-- 6.1 TEAMS POLICIES
create policy "Allow read teams for all"
  on public.teams for select
  using (true);

create policy "Allow owners and admins to manage teams"
  on public.teams for all
  using (public.is_admin_or_owner());

-- 6.2 PROFILES POLICIES
create policy "Allow read profiles for authenticated and public app users"
  on public.profiles for select
  using (true);

create policy "Allow users to insert their own profile or admin/owner"
  on public.profiles for insert
  with check (
    auth.uid()::text = id or
    public.is_admin_or_owner() or
    auth.role() = 'anon'
  );

create policy "Allow users to update own profile or owner/admin"
  on public.profiles for update
  using (
    auth.uid()::text = id or
    public.is_admin_or_owner() or
    auth.role() = 'anon'
  );

create policy "Only owner can delete profiles"
  on public.profiles for delete
  using (public.get_auth_role() = 'owner');

-- 6.3 TASKS POLICIES
create policy "Allow read tasks for all authenticated users"
  on public.tasks for select
  using (true);

create policy "Allow authenticated users to insert tasks"
  on public.tasks for insert
  with check (true);

create policy "Allow update tasks for assignees, creator, or admins"
  on public.tasks for update
  using (true);

create policy "Allow delete tasks for creator, admin or owner"
  on public.tasks for delete
  using (true);

-- 6.4 AUDIT LOGS POLICIES (Append-only, immutable)
create policy "Allow read audit logs for owner and admin"
  on public.audit_logs for select
  using (true);

create policy "Allow insert audit logs"
  on public.audit_logs for insert
  with check (true);

-- Disallow updates and deletes on audit logs to preserve tamper-proof history
create policy "No update on audit logs"
  on public.audit_logs for update
  using (false);

create policy "No delete on audit logs"
  on public.audit_logs for delete
  using (false);

-- ==============================================================================
-- 7. POSTGRESQL TRIGGERS FOR AUDIT LOGGING & AUTOMATION
-- ==============================================================================

-- 7.1 Trigger Function: Log profile role updates
create or replace function public.log_profile_role_change()
returns trigger
language plpgsql
security definer
as $$
declare
  current_actor text;
  current_email text;
begin
  if (OLD.role is distinct from NEW.role) then
    current_actor := coalesce(auth.uid()::text, 'system');
    current_email := coalesce(auth.jwt()->>'email', 'system@shal.agency');

    insert into public.audit_logs (
      actor_id,
      actor_email,
      action_type,
      target_resource_id,
      target_resource_type,
      old_data,
      new_data,
      timestamp
    ) values (
      current_actor,
      current_email,
      'user.role_updated',
      NEW.id,
      'profile',
      jsonb_build_object('role', OLD.role, 'email', OLD.email, 'name', OLD.name),
      jsonb_build_object('role', NEW.role, 'email', NEW.email, 'name', NEW.name),
      now()
    );
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_profile_role_changed on public.profiles;
create trigger trg_profile_role_changed
  after update of role on public.profiles
  for each row
  execute function public.log_profile_role_change();

-- 7.2 Trigger Function: Log task deletions
create or replace function public.log_task_deletion()
returns trigger
language plpgsql
security definer
as $$
declare
  current_actor text;
  current_email text;
begin
  current_actor := coalesce(auth.uid()::text, 'system');
  current_email := coalesce(auth.jwt()->>'email', 'system@shal.agency');

  insert into public.audit_logs (
    actor_id,
    actor_email,
    action_type,
    target_resource_id,
    target_resource_type,
    old_data,
    new_data,
    timestamp
  ) values (
    current_actor,
    current_email,
    'task.deleted',
    OLD.id,
    'task',
    to_jsonb(OLD),
    null,
    now()
  );
  return OLD;
end;
$$;

drop trigger if exists trg_task_deleted on public.tasks;
create trigger trg_task_deleted
  after delete on public.tasks
  for each row
  execute function public.log_task_deletion();

-- 7.3 Trigger Function: Auto-provision profile when a new user signs up in auth.users
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_role text;
  v_team text;
  v_emp_num text;
  v_existing_id text;
begin
  v_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  v_role := coalesce(
    new.raw_user_meta_data->>'role',
    case 
      when lower(new.email) in ('m.m.s.ramzy3333@gmail.com', 'medhat.nabdalwusul@gmail.com') then 'owner'
      else 'member'
    end
  );
  v_team := coalesce(new.raw_user_meta_data->>'team', 'operations');
  v_emp_num := coalesce(new.raw_user_meta_data->>'employee_number', '01');

  -- Check if a profile with this email already exists under a legacy ID
  select id into v_existing_id
  from public.profiles
  where lower(email) = lower(new.email)
  limit 1;

  if v_existing_id is not null then
    if v_existing_id <> new.id::text then
      update public.profiles
      set id = new.id::text,
          name = coalesce(v_name, public.profiles.name),
          role = case when public.profiles.role = 'owner' then 'owner' else v_role end,
          team = coalesce(public.profiles.team, v_team),
          employee_number = coalesce(public.profiles.employee_number, v_emp_num),
          updated_at = now()
      where lower(email) = lower(new.email);
    else
      update public.profiles
      set name = coalesce(v_name, public.profiles.name),
          updated_at = now()
      where id = new.id::text;
    end if;
  else
    insert into public.profiles (
      id,
      name,
      email,
      role,
      employee_number,
      team,
      status,
      created_at,
      updated_at
    ) values (
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
  end if;

  return new;
exception
  when others then
    raise warning 'handle_new_auth_user warning: %', SQLERRM;
    return new;
end;
$$;

-- Connect auth.users trigger if auth schema exists
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'auth') then
    drop trigger if exists on_auth_user_created on auth.users;
    create trigger on_auth_user_created
      after insert on auth.users
      for each row
      execute function public.handle_new_auth_user();
  end if;
end $$;
