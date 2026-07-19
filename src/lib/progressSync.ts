/* Progress cloud-sync — mirrors the localStorage progress aggregates to the
   Supabase `progress` table so a student's streak/stats survive a cache clear
   and follow them across devices.

   Local-first: localStorage stays the working copy; this is a durable backup.
   - On sign-in, syncProgress() pulls the cloud row, merges it into local
     (field-wise max — see mergeSnapshots), applies the result, and pushes the
     merged snapshot back so both sides converge.
   - After that, a debounced listener pushes local changes up as the student
     works.
   DORMANT when auth is off (no supabase) — every function is a guarded no-op,
   so the site behaves exactly as the pure-localStorage version did. */
import { supabase } from './supabaseClient'
import {
  exportProgress,
  mergeSnapshots,
  applySnapshot,
  setProgressListener,
  type ProgressSnapshot,
} from './progress'

let currentUserId: string | null = null
let pushTimer: ReturnType<typeof setTimeout> | null = null
let pushing = false

async function pushNow() {
  if (!supabase || !currentUserId) return
  pushing = true
  try {
    await supabase
      .from('progress')
      .upsert(
        { user_id: currentUserId, data: exportProgress(), updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      )
  } catch {
    /* offline / transient — the next change (or next login) will retry */
  } finally {
    pushing = false
  }
}

/** Debounced push — coalesces bursts of activity into one network write. */
function schedulePush() {
  if (!supabase || !currentUserId) return
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(pushNow, 2500)
}

/** Call once when a user signs in. Pull → merge → apply → push, then start
    listening for local changes to sync going forward. Safe to call repeatedly
    (e.g. on every mount) — it re-syncs and re-registers the single listener. */
export async function syncProgress(userId: string): Promise<void> {
  if (!supabase) return
  currentUserId = userId

  let remote: ProgressSnapshot = {}
  try {
    const { data } = await supabase.from('progress').select('data').eq('user_id', userId).maybeSingle()
    if (data?.data && typeof data.data === 'object') remote = data.data as ProgressSnapshot
  } catch {
    /* couldn't reach the cloud — keep working locally, try again next change */
  }

  const merged = mergeSnapshots(exportProgress(), remote)
  applySnapshot(merged)

  // From now on, any local progress write schedules a debounced push.
  setProgressListener(schedulePush)

  // Push the reconciled snapshot so the cloud reflects the merge immediately.
  await pushNow()
}

/** Call on sign-out — stop syncing and detach the listener. */
export function stopProgressSync() {
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = null
  currentUserId = null
  setProgressListener(null)
}

/** True while a push is in flight — lets the UI show a "syncing…" hint. */
export function isSyncing(): boolean {
  return pushing
}
