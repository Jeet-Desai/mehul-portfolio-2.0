/* Classrooms data layer — virtual classrooms backed by Supabase.

   A teacher (profiles.role 'teacher' or 'admin') owns classrooms; students join
   with a 6-char code (or the /classrooms/join/<code> link). RLS in
   supabase/classrooms.sql is the real gate — these helpers just shape queries.
   Joining goes through the join_classroom() RPC only, so codes can't be
   enumerated by reading tables. Names/emails are snapshotted onto rows at write
   time because profiles are not cross-readable under RLS. */
import { supabase } from './supabaseClient'

export type Classroom = {
  id: string
  owner_id: string
  owner_name: string | null
  name: string
  subject: string | null
  description: string | null
  join_code: string
  allow_student_posts: boolean
  archived: boolean
  created_at: string
}

export type ClassMember = {
  classroom_id: string
  user_id: string
  member_name: string | null
  member_email: string | null
  joined_at: string
}

export type AuthorRole = 'teacher' | 'student'

export type ClassPost = {
  id: string
  classroom_id: string
  author_id: string
  author_name: string | null
  author_role: AuthorRole
  body: string
  image_paths: string[]
  created_at: string
}

export type ClassComment = {
  id: string
  post_id: string
  classroom_id: string
  author_id: string
  author_name: string | null
  author_role: AuthorRole
  body: string
  image_paths: string[]
  created_at: string
}

/** What lookup_classroom() returns for the join-preview screen. */
export type ClassPreview = {
  id: string
  name: string
  subject: string | null
  description: string | null
  owner_name: string | null
  member_count: number
  archived: boolean
  already_joined: boolean
}

type Result<T> = { data: T; error: string | null }

const OFF = 'Classrooms are not switched on yet.'

/* ------------------------------------------------------------- classrooms -- */

/** Classes the caller TEACHES (owns), newest first. */
export async function listOwnedClassrooms(ownerId: string): Promise<Result<Classroom[]>> {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })
  return { data: (data as Classroom[]) ?? [], error: error?.message ?? null }
}

/** Classes the caller has JOINED (via the membership rows), newest join first. */
export async function listJoinedClassrooms(userId: string): Promise<Result<Classroom[]>> {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('classroom_members')
    .select('joined_at, classroom:classrooms(*)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
  const rows = (data ?? []) as unknown as { classroom: Classroom | null }[]
  return {
    data: rows.map((r) => r.classroom).filter((c): c is Classroom => !!c),
    error: error?.message ?? null,
  }
}

export async function getClassroom(id: string): Promise<Result<Classroom | null>> {
  if (!supabase) return { data: null, error: OFF }
  const { data, error } = await supabase.from('classrooms').select('*').eq('id', id).maybeSingle()
  return { data: (data as Classroom) ?? null, error: error?.message ?? null }
}

export type NewClassroom = {
  ownerId: string
  ownerName?: string | null
  name: string
  subject?: string | null
  description?: string | null
  allowStudentPosts?: boolean
}

/** Teacher creates a class — the join_code is generated server-side. */
export async function createClassroom(c: NewClassroom): Promise<Result<Classroom | null>> {
  if (!supabase) return { data: null, error: OFF }
  const { data, error } = await supabase
    .from('classrooms')
    .insert({
      owner_id: c.ownerId,
      owner_name: c.ownerName?.trim() || null,
      name: c.name.trim(),
      subject: c.subject?.trim() || null,
      description: c.description?.trim() || null,
      allow_student_posts: c.allowStudentPosts ?? true,
    })
    .select()
    .single()
  return { data: (data as Classroom) ?? null, error: error?.message ?? null }
}

export async function updateClassroom(
  id: string,
  patch: Partial<Pick<Classroom, 'name' | 'subject' | 'description' | 'allow_student_posts' | 'archived'>>,
): Promise<Result<Classroom | null>> {
  if (!supabase) return { data: null, error: OFF }
  const { data, error } = await supabase
    .from('classrooms')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  return { data: (data as Classroom) ?? null, error: error?.message ?? null }
}

/** Owner deletes the class — members/posts/comments cascade away server-side. */
export async function deleteClassroom(id: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: OFF }
  const { error } = await supabase.from('classrooms').delete().eq('id', id)
  return { error: error?.message ?? null }
}

/* ---------------------------------------------------------------- joining -- */

/** Preview a class by code BEFORE joining (RPC — works for non-members). */
export async function lookupClassroom(code: string): Promise<Result<ClassPreview | null>> {
  if (!supabase) return { data: null, error: OFF }
  const { data, error } = await supabase.rpc('lookup_classroom', { code: code.trim() })
  const row = (Array.isArray(data) ? data[0] : data) as
    | (Omit<ClassPreview, 'member_count'> & { member_count: number | string })
    | undefined
  return {
    data: row ? { ...row, member_count: Number(row.member_count) } : null,
    error: error?.message ?? null,
  }
}

/** Join by code (RPC — the only write path into classroom_members). */
export async function joinClassroom(code: string): Promise<Result<string | null>> {
  if (!supabase) return { data: null, error: OFF }
  const { data, error } = await supabase.rpc('join_classroom', { code: code.trim() })
  return { data: (data as string) ?? null, error: error?.message ?? null }
}

/* ----------------------------------------------------------------- roster -- */

export async function listMembers(classroomId: string): Promise<Result<ClassMember[]>> {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('classroom_members')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('joined_at', { ascending: true })
  return { data: (data as ClassMember[]) ?? [], error: error?.message ?? null }
}

/** Member counts for a set of classes (one query — used by the hub cards). */
export async function countMembers(classroomIds: string[]): Promise<Record<string, number>> {
  if (!supabase || classroomIds.length === 0) return {}
  const { data } = await supabase
    .from('classroom_members')
    .select('classroom_id')
    .in('classroom_id', classroomIds)
  const counts: Record<string, number> = {}
  for (const row of (data ?? []) as { classroom_id: string }[]) {
    counts[row.classroom_id] = (counts[row.classroom_id] ?? 0) + 1
  }
  return counts
}

/** Leave a class yourself, or (as the owner) remove a member. Same delete. */
export async function removeMember(
  classroomId: string,
  userId: string,
): Promise<{ error: string | null }> {
  if (!supabase) return { error: OFF }
  const { error } = await supabase
    .from('classroom_members')
    .delete()
    .eq('classroom_id', classroomId)
    .eq('user_id', userId)
  return { error: error?.message ?? null }
}

/* ------------------------------------------------------- stream (posts) ---- */

export async function listPosts(classroomId: string): Promise<Result<ClassPost[]>> {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('classroom_posts')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('created_at', { ascending: false })
  return { data: (data as ClassPost[]) ?? [], error: error?.message ?? null }
}

export type NewPost = {
  classroomId: string
  authorId: string
  authorName?: string | null
  authorRole: AuthorRole
  body: string
  imagePaths?: string[]
}

export async function createPost(p: NewPost): Promise<Result<ClassPost | null>> {
  if (!supabase) return { data: null, error: OFF }
  const { data, error } = await supabase
    .from('classroom_posts')
    .insert({
      classroom_id: p.classroomId,
      author_id: p.authorId,
      author_name: p.authorName?.trim() || null,
      author_role: p.authorRole,
      body: p.body.trim(),
      image_paths: p.imagePaths ?? [],
    })
    .select()
    .single()
  return { data: (data as ClassPost) ?? null, error: error?.message ?? null }
}

export async function deletePost(id: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: OFF }
  const { error } = await supabase.from('classroom_posts').delete().eq('id', id)
  return { error: error?.message ?? null }
}

/* --------------------------------------------------------------- comments -- */

/** All comments for the class in one query — grouped per post client-side. */
export async function listComments(classroomId: string): Promise<Result<ClassComment[]>> {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('classroom_comments')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('created_at', { ascending: true })
  return { data: (data as ClassComment[]) ?? [], error: error?.message ?? null }
}

export type NewComment = {
  postId: string
  classroomId: string
  authorId: string
  authorName?: string | null
  authorRole: AuthorRole
  body: string
  imagePaths?: string[]
}

export async function createComment(c: NewComment): Promise<Result<ClassComment | null>> {
  if (!supabase) return { data: null, error: OFF }
  const { data, error } = await supabase
    .from('classroom_comments')
    .insert({
      post_id: c.postId,
      classroom_id: c.classroomId,
      author_id: c.authorId,
      author_name: c.authorName?.trim() || null,
      author_role: c.authorRole,
      body: c.body.trim(),
      image_paths: c.imagePaths ?? [],
    })
    .select()
    .single()
  return { data: (data as ClassComment) ?? null, error: error?.message ?? null }
}

/* ------------------------------------------------------- doubt image files -- */

/** Upload compressed images to doubt-images/<classroomId>/<uuid>.jpg.
    Returns the storage paths to save on the post/comment. Best-effort per file:
    a failed upload is skipped so a partial batch still posts. */
export async function uploadDoubtImages(
  classroomId: string,
  blobs: Blob[],
): Promise<{ paths: string[]; error: string | null }> {
  if (!supabase) return { paths: [], error: OFF }
  const paths: string[] = []
  let firstError: string | null = null
  for (const blob of blobs) {
    const path = `${classroomId}/${crypto.randomUUID()}.jpg`
    const { error } = await supabase.storage
      .from('doubt-images')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false })
    if (error) firstError = firstError ?? error.message
    else paths.push(path)
  }
  return { paths, error: paths.length === 0 ? firstError : null }
}

/** Batch short-lived signed URLs for display (private bucket). Maps path→url. */
export async function signedImageUrls(paths: string[]): Promise<Record<string, string>> {
  if (!supabase || paths.length === 0) return {}
  const { data } = await supabase.storage.from('doubt-images').createSignedUrls(paths, 3600)
  const map: Record<string, string> = {}
  for (const row of data ?? []) if (row.path && row.signedUrl) map[row.path] = row.signedUrl
  return map
}

export async function deleteComment(id: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: OFF }
  const { error } = await supabase.from('classroom_comments').delete().eq('id', id)
  return { error: error?.message ?? null }
}

/* ------------------------------------------------------------ role change -- */

/** Admin only (guarded server-side): promote a student to teacher or back. */
export async function setUserRole(
  targetId: string,
  newRole: 'student' | 'teacher',
): Promise<{ error: string | null }> {
  if (!supabase) return { error: OFF }
  const { error } = await supabase.rpc('set_user_role', { target_id: targetId, new_role: newRole })
  return { error: error?.message ?? null }
}

/** The join link a teacher shares (WhatsApp-friendly, mirrors Problem Lab links). */
export function joinLink(code: string): string {
  return `${window.location.origin}/classrooms/join/${code}`
}
