import { useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { LogIn, Mail, CheckCircle2, Info, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import Logo from '../components/Logo'

type LocState = { from?: string }

export default function Login() {
  const { enabled, user, signInWithGoogle, signInWithEmail } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const from = (location.state as LocState | null)?.from ?? '/learn'

  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Already signed in → bounce to where they were headed.
  if (enabled && user) return <Navigate to={from} replace />

  const onGoogle = async () => {
    setBusy(true)
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error)
      setBusy(false)
    }
    // On success the browser redirects to Google, so no further handling here.
  }

  const onEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setBusy(true)
    setError(null)
    const { error } = await signInWithEmail(email.trim())
    setBusy(false)
    if (error) setError(error)
    else setSent(true)
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="cl-card p-8 hover:translate-y-0">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-5 font-display text-2xl font-extrabold">Sign in to AccrualSense</h1>
          <p className="mt-1 text-sm text-slate-500">
            Free for every commerce student. Log in to use the calculators, quizzes and AI tutor.
          </p>
        </div>

        {!enabled ? (
          <div className="flex items-start gap-2 rounded-xl bg-sun-50 p-4 text-sm text-sun-700 dark:bg-sun-500/10 dark:text-sun-300">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Login isn’t switched on yet. Once the site owner adds the Supabase keys, Google and email sign-in will work
              here. In the meantime, every page is open — head back to the{' '}
              <button onClick={() => navigate('/learn')} className="font-semibold underline">Learn Hub</button>.
            </span>
          </div>
        ) : sent ? (
          <div className="flex items-start gap-2 rounded-xl bg-mint-50 p-4 text-sm text-mint-700 dark:bg-mint-500/10 dark:text-mint-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Check your inbox — we’ve emailed a magic sign-in link to <strong>{email}</strong>. Click it to finish
              logging in.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={onGoogle}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleMark />}
              Continue with Google
            </button>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" /> or <span className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={onEmail} className="space-y-3">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email address</span>
                <div className="mt-1.5 flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
                  <span className="grid place-items-center bg-slate-50 px-3 text-slate-400"><Mail className="h-4 w-4" /></span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                  />
                </div>
              </label>
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-700 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                Email me a magic link
              </button>
            </form>

            {error && <p className="text-sm text-rose-500">{error}</p>}

            <p className="text-center text-xs text-slate-400">
              No password needed — we email you a one-time sign-in link.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  )
}
