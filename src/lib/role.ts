/* Role awareness — is the signed-in user a student, a teacher, or an admin?

   The UI reads the role from the caller's OWN profiles row (readable under RLS).
   This only drives what the interface shows; the real gates are server-side:
   is_teacher() / is_class_owner() / is_admin() in supabase/classrooms.sql.
   Admins promote teachers from /admin → Users → "Make teacher". */
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from './auth'
import { isAdminEmail } from './admin'

export type Role = 'student' | 'teacher' | 'admin'

// One fetch per user per page-load; role changes are rare (re-login refreshes).
const cache = new Map<string, Role>()

/** roleLoading is DERIVED (not stored): it must be true on the very first
    render after the user appears, or guards like RequireAdmin would bounce a
    real admin in the one-frame gap before the fetch effect runs. */
export function useMyRole(): { role: Role | null; roleLoading: boolean } {
  const { user, enabled } = useAuth()
  const userId = user?.id ?? null
  const [, bump] = useState(0)

  const cached = userId ? cache.get(userId) : undefined

  useEffect(() => {
    if (!enabled || !userId || !supabase || cache.has(userId)) return
    let active = true
    supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        const role: Role =
          (data?.role as Role | undefined) ?? (isAdminEmail(user?.email) ? 'admin' : 'student')
        cache.set(userId, role)
        if (active) bump((n) => n + 1)
      })
    return () => {
      active = false
    }
  }, [enabled, userId, user?.email])

  if (!enabled || !userId) return { role: null, roleLoading: false }
  return { role: cached ?? null, roleLoading: cached === undefined }
}

/** Teacher OR admin — the people who can create and run classrooms. */
export function useIsTeacher(): boolean {
  const { role } = useMyRole()
  return role === 'teacher' || role === 'admin'
}
