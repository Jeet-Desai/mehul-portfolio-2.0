/* Route guard for the admin surface (/admin).
   - Auth dormant, or no admin email configured → 404 (feature doesn't exist).
   - Auth enabled, not signed in                → /login, remembering the target.
   - Signed in but not the admin                → bounce home.
   - Signed in AND the admin                    → render.
   Server-side RLS still gates the actual data (see supabase/schema.sql); this is
   just the UX gate so non-admins never see the page. */
import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { adminConfigured, isAdminEmail } from '../lib/admin'

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { enabled, user, loading } = useAuth()
  const location = useLocation()

  // Feature only exists when auth is on and an admin email is set.
  if (!enabled || !adminConfigured) return <Navigate to="/" replace />

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (!isAdminEmail(user.email)) return <Navigate to="/" replace />

  return <>{children}</>
}
