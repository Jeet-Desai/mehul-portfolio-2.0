-- ============================================================================
-- AccrualSense — cloud-synced learning progress (ADDITIVE — run after schema.sql)
--
-- Run ONCE in Supabase → SQL Editor. Idempotent (safe to re-run).
--
-- One row per user holding a JSON snapshot of their progress aggregates
-- (streak, activity heat, quiz stats, calculator usage, lab attempts, …). The
-- app stays LOCAL-FIRST: localStorage is the working copy; this table is a
-- durable backup that lets progress survive a cache clear and follow a student
-- across devices. The client merges local + cloud on login (field-wise max, so
-- re-syncing never inflates counts). No raw event log is stored — only the
-- small rolled-up aggregates — so this stays privacy-friendly.
-- ============================================================================

create table if not exists public.progress (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.progress enable row level security;

-- A user reads, writes and updates ONLY their own progress row. No public read;
-- no cross-user access. (A future teacher dashboard would read class members'
-- progress through a SECURITY DEFINER view, not by widening this policy.)
drop policy if exists "progress: own row read"   on public.progress;
drop policy if exists "progress: own row insert" on public.progress;
drop policy if exists "progress: own row update" on public.progress;

create policy "progress: own row read" on public.progress
  for select using ( auth.uid() = user_id );

create policy "progress: own row insert" on public.progress
  for insert with check ( auth.uid() = user_id );

create policy "progress: own row update" on public.progress
  for update using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );

-- ============================================================================
-- Done. Nothing else to configure — the app upserts here once a user is signed
-- in. When auth is dormant, progress simply stays in localStorage as before.
-- ============================================================================
