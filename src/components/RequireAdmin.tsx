/* Route guard for the admin surface (/admin).
   - Auth dormant (no keys)      → home (feature doesn't exist).
   - Auth enabled, not signed in → /login, remembering the target.
   - Signed in, role loading     → spinner (don't bounce a real admin mid-fetch).
   - Signed in, not an admin     → bounce home.
   - Signed in AND admin         → render.
   Server-side RLS still gates the actual data; this is just the UX gate so
   non-admins never see the page. Admin = profiles.role 'admin' (see admin.ts). */
import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { useMyRole } from '../lib/role'
import { useIsAdmin } from '../lib/admin'

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { enabled, user, loading } = useAuth()
  const { roleLoading } = useMyRole()
  const isAdmin = useIsAdmin()
  const location = useLocation()

  if (!enabled) return <Navigate to="/" replace />

  if (loading || (user && roleLoading)) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (!isAdmin) return <Navigate to="/" replace />

  return <>{children}</>
}
