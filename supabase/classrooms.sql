-- ============================================================================
-- AccrualSense — Virtual Classrooms schema (ADDITIVE — run AFTER schema.sql)
--
-- Run ONCE in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Idempotent (safe to re-run).
--
-- What it adds:
--   • profiles.role now also allows 'teacher'. Dr. Desai (admin) promotes other
--     teachers from the /admin Users tab via the set_user_role() RPC — so any
--     number of teachers can own and run their own classrooms.
--   • public.classrooms        — a class owned by ONE teacher (or the admin).
--   • public.classroom_members — who has joined (name/email snapshotted at join
--     time, because profiles are not cross-readable under RLS).
--   • public.classroom_posts   — the class stream. Teacher always posts;
--     students post too when the class allows it (allow_student_posts).
--   • public.classroom_comments— replies/doubts under a post (any member).
--   • RPCs: set_user_role, lookup_classroom (join preview), join_classroom.
--     Joining happens ONLY through the RPC — there is deliberately NO insert
--     policy on classroom_members, so join codes can't be brute-forced by
--     writing rows directly.
--
-- Role model: 'student' (default) | 'teacher' | 'admin'.
--   admin   = Dr. Desai: everything, everywhere + promotes/demotes teachers.
--   teacher = owns classrooms; full control INSIDE their own classes only.
--   student = joins via code; sees only classes they are a member of.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Role helpers (SECURITY DEFINER → read tables without tripping RLS
--    recursion, exactly like is_admin() in schema.sql).
-- ----------------------------------------------------------------------------

-- Teacher OR admin (admin can do everything a teacher can).
create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher', 'admin')
  );
$$;

-- ----------------------------------------------------------------------------
-- 2. Join-code generator — 6 chars from an unambiguous alphabet (no 0/O, 1/I/L).
--    (plpgsql bodies aren't validated at CREATE time, so it's fine that the
--    classrooms table is created a few statements later.)
-- ----------------------------------------------------------------------------
create or replace function public.generate_join_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.classrooms where join_code = code);
  end loop;
  return code;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3. Tables
-- ----------------------------------------------------------------------------
create table if not exists public.classrooms (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references auth.users (id) on delete cascade,
  owner_name          text,                         -- display snapshot (profiles aren't cross-readable)
  name                text not null,
  subject             text,
  description         text,
  join_code           text not null unique default public.generate_join_code(),
  allow_student_posts boolean not null default true,
  archived            boolean not null default false,
  created_at          timestamptz not null default now()
);

create index if not exists classrooms_owner_idx on public.classrooms (owner_id, created_at desc);

create table if not exists public.classroom_members (
  classroom_id  uuid not null references public.classrooms (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  member_name   text,
  member_email  text,
  joined_at     timestamptz not null default now(),
  primary key (classroom_id, user_id)
);

create index if not exists classroom_members_user_idx on public.classroom_members (user_id, joined_at desc);

create table if not exists public.classroom_posts (
  id            uuid primary key default gen_random_uuid(),
  classroom_id  uuid not null references public.classrooms (id) on delete cascade,
  author_id     uuid not null references auth.users (id) on delete cascade,
  author_name   text,
  author_role   text not null default 'student',    -- 'teacher' | 'student' (display badge)
  body          text not null,
  created_at    timestamptz not null default now()
);

create index if not exists classroom_posts_class_idx on public.classroom_posts (classroom_id, created_at desc);

create table if not exists public.classroom_comments (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references public.classroom_posts (id) on delete cascade,
  classroom_id  uuid not null references public.classrooms (id) on delete cascade,
  author_id     uuid not null references auth.users (id) on delete cascade,
  author_name   text,
  author_role   text not null default 'student',
  body          text not null,
  created_at    timestamptz not null default now()
);

create index if not exists classroom_comments_post_idx on public.classroom_comments (post_id, created_at asc);

-- ----------------------------------------------------------------------------
-- 3b. Class-scoped helpers — created AFTER the tables because `language sql`
--     bodies ARE validated at CREATE time (unlike plpgsql).
-- ----------------------------------------------------------------------------

-- Does the calling user own this classroom (or is the admin)?
create or replace function public.is_class_owner(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or exists (
    select 1 from public.classrooms
    where id = cid and owner_id = auth.uid()
  );
$$;

-- Is the calling user a member of this classroom?
create or replace function public.is_class_member(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classroom_members
    where classroom_id = cid and user_id = auth.uid()
  );
$$;

-- ----------------------------------------------------------------------------
-- 4. RPCs
-- ----------------------------------------------------------------------------

-- Admin promotes/demotes teachers from the UI. profiles has column-level UPDATE
-- locked down (only last_seen_at — see schema.sql), so role changes MUST go
-- through this definer function. Guards: caller must be admin; only
-- student⇄teacher transitions; admin rows are untouchable from the UI.
create or replace function public.set_user_role(target_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only the admin can change roles.';
  end if;
  if new_role not in ('student', 'teacher') then
    raise exception 'Role must be student or teacher.';
  end if;
  if exists (select 1 from public.profiles where id = target_id and role = 'admin') then
    raise exception 'The admin role cannot be changed from the app.';
  end if;
  update public.profiles set role = new_role where id = target_id;
end;
$$;

-- Join preview: what a student sees BEFORE confirming ("You are joining
-- <class> by <teacher> — N members"). Signed-in users only.
create or replace function public.lookup_classroom(code text)
returns table (
  id uuid,
  name text,
  subject text,
  description text,
  owner_name text,
  member_count bigint,
  archived boolean,
  already_joined boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id, c.name, c.subject, c.description, c.owner_name,
    (select count(*) from public.classroom_members m where m.classroom_id = c.id),
    c.archived,
    exists (
      select 1 from public.classroom_members m
      where m.classroom_id = c.id and m.user_id = auth.uid()
    )
  from public.classrooms c
  where auth.uid() is not null
    and upper(trim(code)) = c.join_code;
$$;

-- The ONLY way to join: validates the code, snapshots the joiner's name/email
-- from their own profile, inserts the membership. Idempotent (re-join is a no-op).
create or replace function public.join_classroom(code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  cls public.classrooms%rowtype;
  me  public.profiles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Sign in to join a classroom.';
  end if;

  select * into cls from public.classrooms where join_code = upper(trim(code));
  if not found then
    raise exception 'That class code is not valid.';
  end if;
  if cls.archived then
    raise exception 'This classroom has been archived by the teacher.';
  end if;

  select * into me from public.profiles where id = auth.uid();

  insert into public.classroom_members (classroom_id, user_id, member_name, member_email)
  values (cls.id, auth.uid(), me.full_name, me.email)
  on conflict (classroom_id, user_id) do nothing;

  return cls.id;
end;
$$;

-- ----------------------------------------------------------------------------
-- 5. Row-Level Security
-- ----------------------------------------------------------------------------
alter table public.classrooms         enable row level security;
alter table public.classroom_members  enable row level security;
alter table public.classroom_posts    enable row level security;
alter table public.classroom_comments enable row level security;

-- classrooms: visible to its owner, its members, and the admin. The join_code
-- is only exposed to people already inside — outsiders go through the RPCs.
drop policy if exists "classrooms: read own/member/admin" on public.classrooms;
create policy "classrooms: read own/member/admin" on public.classrooms
  for select using (
    owner_id = auth.uid() or public.is_class_member(id) or public.is_admin()
  );

drop policy if exists "classrooms: teacher creates own" on public.classrooms;
create policy "classrooms: teacher creates own" on public.classrooms
  for insert with check ( public.is_teacher() and owner_id = auth.uid() );

drop policy if exists "classrooms: owner updates" on public.classrooms;
create policy "classrooms: owner updates" on public.classrooms
  for update using ( owner_id = auth.uid() or public.is_admin() )
  with check ( owner_id = auth.uid() or public.is_admin() );

drop policy if exists "classrooms: owner deletes" on public.classrooms;
create policy "classrooms: owner deletes" on public.classrooms
  for delete using ( owner_id = auth.uid() or public.is_admin() );

-- classroom_members: the roster is visible to fellow members + the owner.
-- NO insert policy — joining is exclusively via join_classroom() (definer).
drop policy if exists "members: read own class" on public.classroom_members;
create policy "members: read own class" on public.classroom_members
  for select using (
    public.is_class_member(classroom_id) or public.is_class_owner(classroom_id)
  );

--   Leave (self) or remove (owner/admin).
drop policy if exists "members: leave or owner removes" on public.classroom_members;
create policy "members: leave or owner removes" on public.classroom_members
  for delete using (
    user_id = auth.uid() or public.is_class_owner(classroom_id)
  );

-- classroom_posts: members read; the owner always posts; students post only
-- when the class allows it. Authors edit their own; author/owner delete.
drop policy if exists "posts: members read" on public.classroom_posts;
create policy "posts: members read" on public.classroom_posts
  for select using (
    public.is_class_member(classroom_id) or public.is_class_owner(classroom_id)
  );

drop policy if exists "posts: owner or allowed member writes" on public.classroom_posts;
create policy "posts: owner or allowed member writes" on public.classroom_posts
  for insert with check (
    author_id = auth.uid() and (
      public.is_class_owner(classroom_id)
      or (
        public.is_class_member(classroom_id)
        and exists (
          select 1 from public.classrooms c
          where c.id = classroom_id and c.allow_student_posts and not c.archived
        )
      )
    )
  );

drop policy if exists "posts: author edits" on public.classroom_posts;
create policy "posts: author edits" on public.classroom_posts
  for update using ( author_id = auth.uid() )
  with check ( author_id = auth.uid() );

drop policy if exists "posts: author or owner deletes" on public.classroom_posts;
create policy "posts: author or owner deletes" on public.classroom_posts
  for delete using (
    author_id = auth.uid() or public.is_class_owner(classroom_id)
  );

-- classroom_comments: any member (or the owner) comments; author/owner delete.
drop policy if exists "comments: members read" on public.classroom_comments;
create policy "comments: members read" on public.classroom_comments
  for select using (
    public.is_class_member(classroom_id) or public.is_class_owner(classroom_id)
  );

drop policy if exists "comments: members write" on public.classroom_comments;
create policy "comments: members write" on public.classroom_comments
  for insert with check (
    author_id = auth.uid() and (
      public.is_class_member(classroom_id) or public.is_class_owner(classroom_id)
    )
  );

drop policy if exists "comments: author or owner deletes" on public.classroom_comments;
create policy "comments: author or owner deletes" on public.classroom_comments
  for delete using (
    author_id = auth.uid() or public.is_class_owner(classroom_id)
  );

-- ============================================================================
-- Done. Promote a teacher from /admin → Users → "Make teacher" (or via SQL:
--   select public.set_user_role('<profile-uuid>', 'teacher');
-- run as the admin — or just: update public.profiles set role='teacher' ...).
-- ============================================================================
