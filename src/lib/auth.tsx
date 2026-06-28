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
  signInWithEmail: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/** where to land after a successful sign-in */
const redirectTo = () =>
  typeof window !== 'undefined' ? `${window.location.origin}/learn` : undefined

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  // Only "loading" when auth is actually enabled; otherwise resolve at once.
  const [loading, setLoading] = useState(authEnabled)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    if (!supabase) return { error: 'Login is not enabled yet.' }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectTo() },
    })
    return { error: error?.message ?? null }
  }

  const signInWithEmail = async (email: string) => {
    if (!supabase) return { error: 'Login is not enabled yet.' }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo() },
    })
    return { error: error?.message ?? null }
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
        signInWithEmail,
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
