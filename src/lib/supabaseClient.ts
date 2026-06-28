/* Supabase client — the single source of truth for auth.

   DORMANT UNTIL KEYED (mirrors the AI tutor): authentication is enabled only when
   both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present at build time.
   Until then `authEnabled` is false, `supabase` is null, and the route guards are
   no-ops — the site behaves exactly as it does today. Add the two env vars (in
   Vercel / .env) and redeploy to switch login on. See docs/AUTH.md.

   The anon key is a PUBLIC client key (safe to ship); row-level security on the
   Supabase side is what protects data. No secret ever lives in the bundle. */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True only when both env vars are configured — gates the whole auth feature. */
export const authEnabled = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = authEnabled
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // PKCE flow: the redirect returns a short-lived, single-use `?code=…`
        // (not a full access token in the URL hash). The SDK exchanges it for a
        // session and strips it from the address bar — no token left in the URL.
        flowType: 'pkce',
      },
    })
  : null
