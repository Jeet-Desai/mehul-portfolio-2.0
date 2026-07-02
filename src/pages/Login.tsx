import { useState } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { LogIn, Mail, Lock, CheckCircle2, Info, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/auth'
import Logo from '../components/Logo'
import { usePageTitle } from '../lib/usePageTitle'

type LocState = { from?: string }
type Mode = 'signin' | 'signup'

export default function Login() {
  usePageTitle('Sign in')
  const { enabled, user, signInWithGoogle, signInWithPassword, signUpWithPassword } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const from = (location.state as LocState | null)?.from ?? '/learn'

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState(false)
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setBusy(true)
    setError(null)
    if (mode === 'signup') {
      const { error, needsConfirmation } = await signUpWithPassword(email.trim(), password)
      setBusy(false)
      if (error) setError(error)
      else if (needsConfirmation) setConfirm(true)
      else navigate(from, { replace: true }) // confirmation off → signed in
    } else {
      const { error } = await signInWithPassword(email.trim(), password)
      setBusy(false)
      if (error) setError(error)
      else navigate(from, { replace: true })
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="cl-card p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-5 text-[26px]">
            {mode === 'signup' ? 'Create your account' : 'Sign in to AccrualSense'}
          </h1>
          <p className="mt-1.5 text-[13px] text-slate-600">
            Free for everyone. Log in to use the calculators, quizzes and AI tutor.
          </p>
        </div>

        {!enabled ? (
          <div className="flex items-start gap-2.5 rounded-[10px] border border-slate-200 bg-slate-100 p-4 text-sm leading-relaxed text-slate-600">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>
              Login isn’t switched on yet. Once the site owner adds the Supabase keys, Google and email sign-in will work
              here. In the meantime, every page is open — head back to the{' '}
              <button onClick={() => navigate('/learn')} className="font-semibold underline">Learn Hub</button>.
            </span>
          </div>
        ) : confirm ? (
          <div className="flex items-start gap-2.5 rounded-[10px] border border-brand-200 bg-brand-50 p-4 text-sm leading-relaxed text-slate-600">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <span>
              Almost there — we’ve emailed a confirmation link to <strong>{email}</strong>. Click it to verify your
              account, then come back and sign in.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <form onSubmit={onSubmit} className="space-y-3">
              <label className="block">
                <span className="text-[12.5px] font-semibold text-slate-600">Email address</span>
                <div className="mt-1.5 flex items-stretch overflow-hidden rounded-[9px] border border-slate-200 bg-slate-50 transition focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100">
                  <span className="grid place-items-center pl-3 text-slate-400"><Mail className="h-4 w-4" /></span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-[12.5px] font-semibold text-slate-600">Password</span>
                <div className="mt-1.5 flex items-stretch overflow-hidden rounded-[9px] border border-slate-200 bg-slate-50 transition focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100">
                  <span className="grid place-items-center pl-3 text-slate-400"><Lock className="h-4 w-4" /></span>
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                    className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={busy}
                className="btn-accent w-full px-4 py-3 text-sm disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                {mode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            </form>

            {error && <p className="text-sm text-rose-500">{error}</p>}

            <p className="text-center text-[12px] text-slate-400">
              {mode === 'signup' ? 'Already have an account?' : 'New here?'}{' '}
              <button
                onClick={() => {
                  setMode(mode === 'signup' ? 'signin' : 'signup')
                  setError(null)
                }}
                className="font-semibold text-brand-600 hover:underline"
              >
                {mode === 'signup' ? 'Sign in' : 'Create an account'}
              </button>
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" /> or continue with <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              onClick={onGoogle}
              disabled={busy}
              className="btn-outline w-full px-4 py-3 text-sm disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleMark />}
              Continue with Google
            </button>
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
