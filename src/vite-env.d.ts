/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL — set to switch login on (see docs/AUTH.md). */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase public anon key — set to switch login on. */
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Email of the admin (Dr. Desai) — shows the /admin surface to that account.
      Must match the profile marked role='admin' in Supabase. See docs/ADMIN.md. */
  readonly VITE_ADMIN_EMAIL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
