/* Auth context — wraps the app and exposes the current user + sign-in/out.
   When auth is dormant (no Supabase keys) it resolves immediately with no user
   and the guards let everyone through. See supabaseClient.ts. */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, authEnabled } from './supabaseClient'

type AuthContextValue = {
  user: User | null
  session: Session | null
  /** still determining the session on first load */
  loading: boolean
  /** whether the auth feature is switched on (keys present) */
  enabled: boolean
  signInWithGoogle: () => Promise<{ error: string | null }>
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>
  /** returns needsConfirmation = true when email confirmation is on (no session yet) */
  signUpWithPassword: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/** Where the OAuth / email round-trip returns to. We target the site ORIGIN
    (not a sub-path): Supabase only honours a redirect that matches its Site URL
    / allow-list, and a bare origin matches those entries even without a path
    wildcard. If it doesn't match, Supabase silently falls back to the Site URL —
    which is how a local build ends up on the production domain. The page the
    user actually wanted is restored client-side afterwards via the `as:next`
    hand-off (Login.tsx → Layout.tsx), so the landing path here doesn't matter. */
const redirectTo = () =>
  typeof window !== 'undefined' ? window.location.origin : undefined

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  // Only "loading" when auth is actually enabled; otherwise resolve at once.
  const [loading, setLoading] = useState(authEnabled)

  useEffect(() => {
    if (!supabase) return
    let active = true

    // Are we mid sign-in? (PKCE ?code, or a stray implicit #access_token/#error)
    const loc = typeof window !== 'undefined' ? window.location : null
    const returningFromOAuth =
      !!loc && (/[?&]code=/.test(loc.search) || loc.hash.includes('access_token') || loc.hash.includes('error'))

    // Belt-and-suspenders: strip any auth artefact left in the address bar once
    // the session is established (the SDK normally does this; we guarantee it).
    const stripAuthArtefacts = () => {
      if (typeof window === 'undefined') return
      const { pathname, hash, search } = window.location
      if (hash.includes('access_token') || hash.includes('error') || /[?&]code=/.test(search)) {
        window.history.replaceState({}, document.title, pathname)
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      // Keep `loading` true through a PKCE exchange that hasn't finished yet —
      // getSession() can resolve with a null session a beat before
      // onAuthStateChange delivers the real one. Flipping to "not loading" here
      // would let the app paint the landing page for a frame mid-login.
      if (data.session || !returningFromOAuth) setLoading(false)
      stripAuthArtefacts()
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!active) return
      setSession(s)
      // Session arrived (or the user signed out) → auth is settled.
      if (s || event === 'SIGNED_OUT') setLoading(false)
      if (s) stripAuthArtefacts()
    })

    // Safety net: never hang on the loader if the exchange never resolves.
    const fallback = setTimeout(() => {
      if (active) setLoading(false)
    }, 8000)

    return () => {
      active = false
      clearTimeout(fallback)
      sub.subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    if (!supabase) return { error: 'Login is not enabled yet.' }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo(),
        // Always show Google's account chooser (instead of silently reusing the
        // one already signed in to the browser).
        queryParams: { prompt: 'select_account' },
      },
    })
    return { error: error?.message ?? null }
  }

  const signInWithPassword = async (email: string, password: string) => {
    if (!supabase) return { error: 'Login is not enabled yet.' }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    // Update the context immediately so a redirect right after sign-in doesn't
    // race the async onAuthStateChange (which would bounce the user back to /login).
    if (data?.session) setSession(data.session)
    return { error: error?.message ?? null }
  }

  const signUpWithPassword = async (email: string, password: string) => {
    if (!supabase) return { error: 'Login is not enabled yet.', needsConfirmation: false }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo() },
    })
    // When "Confirm email" is OFF a session is returned (auto signed-in). Set it
    // immediately so the user is logged straight in — no second login prompt.
    // When confirmation is ON, a user exists but no session — email must be confirmed.
    if (data?.session) setSession(data.session)
    const needsConfirmation = !error && !data.session && !!data.user
    return { error: error?.message ?? null, needsConfirmation }
  }

  const signOut = async () => {
    await supabase?.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        enabled: authEnabled,
        signInWithGoogle,
        signInWithPassword,
        signUpWithPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
