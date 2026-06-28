/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL — set to switch login on (see docs/AUTH.md). */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase public anon key — set to switch login on. */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
