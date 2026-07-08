/* Doubts data layer — the shared queue backed by Supabase.

   DORMANT UNTIL KEYED: every function guards on `supabase` being non-null. When
   auth is off the Ask page falls back to its old localStorage Doubt Box, so
   nothing here runs. When keyed, students post doubts, Dr. Desai answers them,
   and answered ones surface publicly. RLS (supabase/schema.sql) is the real gate;
   these helpers just shape the queries. */
import { supabase } from './supabaseClient'

export type DoubtStatus = 'pending' | 'answered'

export type Doubt = {
  id: string
  student_id: string
  student_name: string | null
  student_email: string | null
  category: string | null
  question: string
  answer: string | null
  status: DoubtStatus
  created_at: string
  answered_at: string | null
}

export type NewDoubt = {
  studentId: string
  studentName?: string | null
  studentEmail?: string | null
  category?: string | null
  question: string
}

type Result<T> = { data: T; error: string | null }

/** Post a new doubt (signed-in student). student_id must be the caller (RLS). */
export async function postDoubt(d: NewDoubt): Promise<Result<Doubt | null>> {
  if (!supabase) return { data: null, error: 'Doubts are not switched on yet.' }
  const { data, error } = await supabase
    .from('doubts')
    .insert({
      student_id: d.studentId,
      student_name: d.studentName?.trim() || null,
      student_email: d.studentEmail ?? null,
      category: d.category ?? null,
      question: d.question.trim(),
      status: 'pending',
    })
    .select()
    .single()
  return { data: (data as Doubt) ?? null, error: error?.message ?? null }
}

/** Publicly-readable answered doubts, newest answer first (the FAQ feed). */
export async function listAnsweredDoubts(limit = 100): Promise<Result<Doubt[]>> {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('doubts')
    .select('*')
    .eq('status', 'answered')
    .order('answered_at', { ascending: false })
    .limit(limit)
  return { data: (data as Doubt[]) ?? [], error: error?.message ?? null }
}

/** The signed-in student's own doubts (pending + answered), newest first. */
export async function listMyDoubts(studentId: string): Promise<Result<Doubt[]>> {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('doubts')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  return { data: (data as Doubt[]) ?? [], error: error?.message ?? null }
}

/** Admin: every doubt, optionally filtered by status. */
export async function listAllDoubts(status?: DoubtStatus): Promise<Result<Doubt[]>> {
  if (!supabase) return { data: [], error: null }
  let query = supabase.from('doubts').select('*')
  if (status) query = query.eq('status', status)
  const { data, error } = await query.order('created_at', { ascending: false })
  return { data: (data as Doubt[]) ?? [], error: error?.message ?? null }
}

/** Admin: answer a doubt → marks it answered and public. */
export async function answerDoubt(id: string, answer: string): Promise<Result<Doubt | null>> {
  if (!supabase) return { data: null, error: 'Not switched on.' }
  const { data, error } = await supabase
    .from('doubts')
    .update({ answer: answer.trim(), status: 'answered', answered_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  return { data: (data as Doubt) ?? null, error: error?.message ?? null }
}

/** Admin (or the owning student, if still pending) deletes a doubt. */
export async function deleteDoubt(id: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Not switched on.' }
  const { error } = await supabase.from('doubts').delete().eq('id', id)
  return { error: error?.message ?? null }
}
