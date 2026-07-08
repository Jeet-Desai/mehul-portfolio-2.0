/* Admin identity — who is Dr. Desai (the one person who answers doubts and sees
   the user list).

   The env var VITE_ADMIN_EMAIL drives the UI (whether to show the Admin link and
   render the /admin page). The REAL gate is server-side: Supabase RLS only lets a
   profile whose role='admin' read the user list / answer doubts (see
   supabase/schema.sql). So even if someone spoofed the client check, they could
   not read a single row. Keep the env value and the role='admin' row in sync. */
import { useAuth } from './auth'

// Hardcoded admin (Dr. Desai). The account itself + its password live in Supabase
// Auth; this is only the marker the UI uses to show the /admin surface. The real
// data gate is the profiles.role='admin' row + RLS (see supabase/schema.sql).
const adminEmail = 'mehuldesaiadmin@as.com'

/** True only when an admin email is configured (drives whether admin UI exists). */
export const adminConfigured = Boolean(adminEmail)

export function isAdminEmail(email?: string | null): boolean {
  return !!adminEmail && !!email && email.trim().toLowerCase() === adminEmail
}

/** UI-level admin check: auth switched on + configured admin email matches. */
export function useIsAdmin(): boolean {
  const { user, enabled } = useAuth()
  return enabled && isAdminEmail(user?.email)
}
