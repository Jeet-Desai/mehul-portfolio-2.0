-- ============================================================================
-- AccrualSense — Supabase schema for the admin surface (profiles + doubts)
--
-- Run this ONCE in your Supabase project: Dashboard → SQL Editor → New query →
-- paste this whole file → Run. It is idempotent (safe to re-run).
--
-- What it creates:
--   • public.profiles — one row per registered user (auto-filled on sign-up),
--     so the admin can see who has an account / last signed in. The Supabase
--     `auth.users` table is NOT readable from the browser; this mirror table is.
--   • public.doubts   — the shared doubt queue. Students post; Dr. Desai (admin)
--     answers; answered ones become publicly readable ("Answered doubts").
--   • is_admin()      — the single source of truth for "is this user the admin".
--   • Row-Level Security policies that enforce all of the above server-side.
--
-- AFTER running this, make Dr. Desai an admin (he must have signed up once first):
--   update public.profiles set role = 'admin' where email = 'REPLACE_WITH_HIS_EMAIL';
-- Use the SAME email in the VITE_ADMIN_EMAIL env var (that only drives the UI;
-- this row is what actually grants data access). See docs/ADMIN.md.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. profiles ----------------------------------------------------------------
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text,
  full_name     text,
  avatar_url    text,
  role          text not null default 'student',   -- 'student' | 'admin'
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now()
);

-- Keep an index for the admin's "recently active" sort.
create index if not exists profiles_last_seen_idx on public.profiles (last_seen_at desc);
create index if not exists profiles_created_idx   on public.profiles (created_at desc);

-- ----------------------------------------------------------------------------
-- 2. is_admin() — SECURITY DEFINER so it can read profiles.role WITHOUT being
--    subject to the profiles RLS policy (which would otherwise recurse when a
--    policy calls this function while evaluating access to profiles itself).
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- 3. Auto-create a profile row whenever a new auth user signs up.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for anyone who signed up BEFORE this schema was applied.
insert into public.profiles (id, email, full_name, avatar_url, created_at)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  u.raw_user_meta_data ->> 'avatar_url',
  u.created_at
from auth.users u
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 4. doubts ------------------------------------------------------------------
-- ----------------------------------------------------------------------------
create table if not exists public.doubts (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references auth.users (id) on delete cascade,
  student_name  text,
  student_email text,
  category      text,
  question      text not null,
  answer        text,
  status        text not null default 'pending',    -- 'pending' | 'answered'
  created_at    timestamptz not null default now(),
  answered_at   timestamptz
);

create index if not exists doubts_status_idx  on public.doubts (status, created_at desc);
create index if not exists doubts_student_idx on public.doubts (student_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 5. Row-Level Security ------------------------------------------------------
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.doubts   enable row level security;

-- profiles: a user reads/updates only their own row; the admin reads all.
drop policy if exists "profiles: read own or admin"   on public.profiles;
drop policy if exists "profiles: update own"          on public.profiles;

create policy "profiles: read own or admin" on public.profiles
  for select using ( auth.uid() = id or public.is_admin() );

create policy "profiles: update own" on public.profiles
  for update using ( auth.uid() = id ) with check ( auth.uid() = id );

-- CRITICAL: RLS cannot restrict WHICH columns an update touches, so the policy
-- above alone would let a student set their own role='admin'. Lock it down with
-- COLUMN-LEVEL privileges: authenticated users may update ONLY last_seen_at.
-- Any attempt to write `role` (or any other column) is denied at the privilege
-- layer. The admin still changes roles from the SQL editor (postgres role, which
-- is not subject to these grants). anon gets no write at all.
revoke update on public.profiles from authenticated;
grant  update (last_seen_at) on public.profiles to authenticated;

-- doubts:
--   • Anyone (even signed-out) can read ANSWERED doubts → the public FAQ feed.
--   • A student can read their OWN doubts (to see pending/answered status).
--   • The admin reads everything.
drop policy if exists "doubts: read answered/own/admin" on public.doubts;
create policy "doubts: read answered/own/admin" on public.doubts
  for select using (
    status = 'answered' or auth.uid() = student_id or public.is_admin()
  );

--   • A signed-in student inserts a doubt as themselves (student_id must be them),
--     always in the 'pending' state.
drop policy if exists "doubts: student inserts own" on public.doubts;
create policy "doubts: student inserts own" on public.doubts
  for insert with check (
    auth.uid() = student_id and status = 'pending'
  );

--   • Only the admin answers (updates) or deletes doubts.
drop policy if exists "doubts: admin updates" on public.doubts;
create policy "doubts: admin updates" on public.doubts
  for update using ( public.is_admin() ) with check ( public.is_admin() );

drop policy if exists "doubts: admin deletes" on public.doubts;
create policy "doubts: admin deletes" on public.doubts
  for delete using ( public.is_admin() );

-- Students may also delete their OWN still-pending doubt (optional; comment out
-- to disallow). Keeps the "remove my post" affordance on the Ask page.
drop policy if exists "doubts: student deletes own pending" on public.doubts;
create policy "doubts: student deletes own pending" on public.doubts
  for delete using ( auth.uid() = student_id and status = 'pending' );

-- ============================================================================
-- Done. Next: mark the admin (see the update statement near the top), set
-- VITE_ADMIN_EMAIL to the same address, and redeploy. See docs/ADMIN.md.
-- ============================================================================
