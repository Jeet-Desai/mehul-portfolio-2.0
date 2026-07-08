import { useEffect } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'
import { useAuth } from '../lib/auth'

/* After an OAuth sign-in the browser lands back on the site ORIGIN (see the
   redirect note in auth.tsx). Login stashed the page the user actually wanted in
   `as:next`; we forward there as soon as the session is live. Doing it during
   render (a <Navigate>, masked by a loader while the session resolves) means the
   home page never paints — no flash of the landing page before the redirect. */
function readNext(): string | null {
  try {
    return localStorage.getItem('as:next')
  } catch {
    return null
  }
}
function clearNext() {
  try {
    localStorage.removeItem('as:next')
  } catch {
    /* ignore */
  }
}

export default function Layout() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const next = readNext()

  // Once the session has resolved (success or not), the hand-off is spent — drop
  // it so it can't fire again on a later visit. (Read-only during render; the
  // write happens here, after commit.)
  useEffect(() => {
    if (next && !loading) clearNext()
  }, [next, loading])

  if (next) {
    // still resolving the returning session → show a loader, not the home page
    if (loading) {
      return (
        <div className="grid min-h-screen place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
        </div>
      )
    }
    // session live → forward to the intended in-app page (guard open-redirects)
    if (user && next.startsWith('/') && !next.startsWith('//')) {
      const here = location.pathname + location.search
      if (here !== next) return <Navigate to={next} replace />
    }
    // otherwise (sign-in didn't complete, or already there) fall through to render
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* faint ledger rules behind the whole page — the Ledger house background */}
      <div aria-hidden className="ledger-lines pointer-events-none fixed inset-0 z-0" />
      <Navbar />
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
