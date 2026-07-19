-- ============================================================================
-- AccrualSense — image attachments for classroom doubts (run AFTER classrooms.sql)
--
-- Run ONCE in Supabase → SQL Editor. Idempotent (safe to re-run).
--
-- Lets students attach photos of their worked sums to a post or a comment when
-- asking a doubt. Files live in a PRIVATE Storage bucket; only members of that
-- classroom can upload or view them (reusing is_class_member/is_class_owner
-- from classrooms.sql). The row keeps just the storage paths; the client
-- fetches short-lived signed URLs to display them. Images are compressed in the
-- browser before upload, so they stay small on the free tier.
--
-- Path convention (enforced by the client): <classroom_id>/<uuid>.jpg — the
-- FIRST folder in the object path IS the classroom id, which the policies below
-- use to check membership.
-- ============================================================================

-- 1. Attachment columns — an array of storage paths per post / comment.
alter table public.classroom_posts
  add column if not exists image_paths text[] not null default '{}';
alter table public.classroom_comments
  add column if not exists image_paths text[] not null default '{}';

-- 2. Private bucket (not public — access is via signed URLs gated by the
--    policies below). 5 MB per-object cap is plenty for a compressed photo.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'doubt-images', 'doubt-images', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 3. Storage RLS — objects in this bucket are readable/writable only by members
--    of the classroom named in the object's first path folder. `is_class_member`
--    and `is_class_owner` are the SECURITY DEFINER helpers from classrooms.sql.
--    NULLIF(...,'') + a valid-uuid guard keeps a stray non-uuid path from erroring.

create or replace function public.doubt_image_class(objname text)
returns uuid
language sql
stable
as $$
  select case
    when (storage.foldername(objname))[1] ~ '^[0-9a-f-]{36}$'
    then ((storage.foldername(objname))[1])::uuid
    else null
  end;
$$;

drop policy if exists "doubt-images: members read"   on storage.objects;
drop policy if exists "doubt-images: members upload"  on storage.objects;
drop policy if exists "doubt-images: owner or class-owner deletes" on storage.objects;

create policy "doubt-images: members read" on storage.objects
  for select using (
    bucket_id = 'doubt-images'
    and (
      public.is_class_member(public.doubt_image_class(name))
      or public.is_class_owner(public.doubt_image_class(name))
    )
  );

create policy "doubt-images: members upload" on storage.objects
  for insert with check (
    bucket_id = 'doubt-images'
    and owner = auth.uid()
    and (
      public.is_class_member(public.doubt_image_class(name))
      or public.is_class_owner(public.doubt_image_class(name))
    )
  );

create policy "doubt-images: owner or class-owner deletes" on storage.objects
  for delete using (
    bucket_id = 'doubt-images'
    and (
      owner = auth.uid()
      or public.is_class_owner(public.doubt_image_class(name))
    )
  );

-- ============================================================================
-- Done. The app uploads compressed images to doubt-images/<class_id>/<uuid>.jpg
-- and stores the paths on the post/comment. Nothing else to configure.
-- ============================================================================
