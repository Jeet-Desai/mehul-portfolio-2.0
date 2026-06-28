# Login / Authentication (Supabase)

AccrualSense ships with **Google + email login built but dormant** — exactly like the
AI tutor. Until you add the two Supabase keys, the whole site stays open and the
login page politely says it isn't switched on. Add the keys and the **interactive
tools** (calculators, Practice, AI tutor) require login; the browse pages
(Home, About, Contact, Resources, Formulas, Notices, Career, Research, the Learn Hub
index) stay public so Google can still index them.

## What requires login (once enabled)

| Public (always open)                                   | Requires login (when enabled)            |
| ------------------------------------------------------ | ---------------------------------------- |
| Home, About, Contact                                   | Any calculator (`/learn/c/:slug`)        |
| Resources, Formulas, Notices, Career, Research         | Practice & Quizzes (`/practice`)         |
| Learn Hub index (`/learn`)                             | AI doubt-tutor (`/ask`)                  |

## Switch it on (one-time, ~5 minutes)

1. **Create a free Supabase project** → <https://supabase.com> → *New project*.
2. **Copy the API keys**: Project → *Settings → API*. You need:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY` (this is a *public* client key — safe to ship)
3. **Enable the providers**: Supabase → *Authentication → Providers*
   - **Email** is on by default (we use a passwordless *magic link* — no passwords to store).
   - **Google**: toggle on, then paste a Google OAuth **Client ID + Secret**. Create those at
     <https://console.cloud.google.com> → *APIs & Services → Credentials → OAuth client ID (Web)*.
     - Authorised redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. **Set the redirect URLs**: Supabase → *Authentication → URL Configuration*
   - *Site URL*: your deployed origin, e.g. `https://accrualsense.vercel.app`
   - *Redirect URLs*: add the same origin (and `http://localhost:5173` for local dev).
5. **Add the env vars** in Vercel → *Project → Settings → Environment Variables* (Production + Preview):
   ```
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
   ```
   For local dev, copy `.env.example` to `.env` and fill the same two values.
6. **Redeploy.** Login is now live. (These are `VITE_`-prefixed, so they are read at **build time** —
   a redeploy is required after changing them.)

## How it works

- `src/lib/supabaseClient.ts` — creates the client; `authEnabled` is true only when both env vars exist.
- `src/lib/auth.tsx` — `<AuthProvider>` + `useAuth()` (user, session, `signInWithGoogle`, `signInWithEmail`, `signOut`).
- `src/components/RequireAuth.tsx` — wraps the gated routes. **No-op when dormant**, redirect-to-`/login` when enabled.
- `src/pages/Login.tsx` — Google button + passwordless email magic link.
- The navbar shows **Log in / Sign out** only when auth is enabled.

## Security notes

- The anon key is **public by design**. Real protection comes from Supabase **Row Level Security** —
  enable RLS on any table you later add and write policies; never ship the *service-role* key.
- Auth state is stored in `localStorage` by the Supabase SDK and refreshed automatically.
- Gating here is **client-side UX**, not a data wall: it controls who *sees* the tool pages. The tools are
  100% client-side and hold no private data, so this is the appropriate level. If you later add
  per-user data, guard it server-side with RLS as above.
