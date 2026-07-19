/* Admin identity — who can open the /admin surface (answer doubts, see users,
   promote teachers).

   The UI gate is the caller's own profiles.role === 'admin' (read via
   useMyRole, which every signed-in user can fetch for themselves). The REAL
   gate is server-side: Supabase RLS + the admin-guarded RPCs only act for a
   profile whose role='admin' (see supabase/schema.sql / classrooms.sql). So
   even if someone spoofed the client check, they could not read or change a
   single row. Admins are minted in SQL:
     update public.profiles set role = 'admin' where email = '...'; */
import { useAuth } from './auth'
import { useMyRole } from './role'

// Dr. Desai's known admin account — an instant fast-path so his admin UI shows
// without waiting for the role fetch, and the fallback if that fetch fails.
const adminEmail = 'mehuldesaiadmin@as.com'

export function isAdminEmail(email?: string | null): boolean {
  return !!adminEmail && !!email && email.trim().toLowerCase() === adminEmail
}

/** UI-level admin check: DB role 'admin' (any admin account) or the known
    admin email. Pair with useMyRole().roleLoading where a wrong flash matters. */
export function useIsAdmin(): boolean {
  const { user, enabled } = useAuth()
  const { role } = useMyRole()
  return enabled && (role === 'admin' || isAdminEmail(user?.email))
}
