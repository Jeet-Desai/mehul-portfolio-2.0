/* Profiles data layer — the user list the admin dashboard reads.

   `auth.users` is not reachable from the browser, so we mirror the essentials
   into public.profiles (auto-filled by a trigger on sign-up; see
   supabase/schema.sql). RLS lets a user see only their own row, and the admin
   see all — so listProfiles() returns the whole list ONLY for Dr. Desai. */
import { supabase } from './supabaseClient'

export type Profile = {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  role: string
  created_at: string
  last_seen_at: string
}

/** Bump the caller's last_seen_at (fire-and-forget; called on app load). */
export async function touchLastSeen(userId: string): Promise<void> {
  if (!supabase) return
  try {
    await supabase
      .from('profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', userId)
  } catch {
    /* non-critical — ignore */
  }
}

/** Admin: the full user list, most recently active first. */
export async function listProfiles(): Promise<{ data: Profile[]; error: string | null }> {
  if (!supabase) return { data: [], error: null }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('last_seen_at', { ascending: false })
  return { data: (data as Profile[]) ?? [], error: error?.message ?? null }
}

export type UserStats = {
  total: number
  newThisWeek: number
  activeToday: number
  admins: number
}

/** Derive dashboard counters from a profile list (client-side, no extra query). */
export function computeStats(profiles: Profile[], now: number): UserStats {
  const dayMs = 24 * 60 * 60 * 1000
  const weekAgo = now - 7 * dayMs
  const dayAgo = now - dayMs
  let newThisWeek = 0
  let activeToday = 0
  let admins = 0
  for (const p of profiles) {
    if (new Date(p.created_at).getTime() >= weekAgo) newThisWeek++
    if (new Date(p.last_seen_at).getTime() >= dayAgo) activeToday++
    if (p.role === 'admin') admins++
  }
  return { total: profiles.length, newThisWeek, activeToday, admins }
}
