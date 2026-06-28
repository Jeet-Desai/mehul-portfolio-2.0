/* Route guard for the interactive tools (calculators, practice, AI tutor).
   - Auth dormant (no keys)  → render normally; the whole site is open.
   - Auth enabled, no user    → redirect to /login, remembering where we came from.
   - Auth enabled, signed in  → render the protected page. */
import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../lib/auth'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { enabled, user, loading } = useAuth()
  const location = useLocation()

  if (!enabled) return <>{children}</>

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }

  return <>{children}</>
}
