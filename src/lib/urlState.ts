/* ----------------------------------------------------------------------------
   Shareable calculator state — inputs serialize into the URL query string so a
   solved sum is one WhatsApp message ("/learn/c/break-even?fc=50000&sp=100…").

   `useCalcState(key, initial)` is a drop-in replacement for
   `useState(initial)` inside a calculator:
   - initializes from the URL param if present (validated as a plain string),
   - writes changes back with history.replaceState (debounced, no rerenders,
     no history spam),
   - values equal to the initial are REMOVED from the URL (clean links).

   Keys are short (fc, sp, vc…) and only need to be unique within one
   calculator, since each calculator lives on its own route.
---------------------------------------------------------------------------- */
import { useEffect, useMemo, useRef, useState } from 'react'

function readParam(key: string): string | null {
  if (typeof window === 'undefined') return null
  const v = new URLSearchParams(window.location.search).get(key)
  // guard: inputs are short numeric-ish strings; ignore absurd payloads
  if (v === null || v.length > 64) return null
  return v
}

/** Debounced URL writer shared by all fields (one replaceState per burst). */
const pending = new Map<string, { value: string; initial: string }>()
let flushTimer: ReturnType<typeof setTimeout> | null = null
function queueWrite(key: string, value: string, initial: string) {
  pending.set(key, { value, initial })
  if (flushTimer) clearTimeout(flushTimer)
  flushTimer = setTimeout(() => {
    const url = new URL(window.location.href)
    for (const [k, { value: v, initial: init }] of pending) {
      if (v === init || v === '') url.searchParams.delete(k)
      else url.searchParams.set(k, v)
    }
    pending.clear()
    window.history.replaceState(window.history.state, '', url)
  }, 250)
}

/** useState that mirrors itself into the URL — makes any calculator shareable. */
export function useCalcState(key: string, initial: string): [string, (v: string) => void] {
  const [value, setValue] = useState<string>(() => readParam(key) ?? initial)
  const initialRef = useRef(initial)

  const set = useMemo(
    () => (v: string) => {
      setValue(v)
      queueWrite(key, v, initialRef.current)
    },
    [key],
  )

  // on unmount, drop this calculator's params so they don't leak to the next route
  useEffect(() => {
    return () => {
      pending.delete(key)
    }
  }, [key])

  return [value, set]
}

/** Share helpers for the "Share this calculation" button. */
export function shareUrl(): string {
  return window.location.href
}

export async function shareCalculation(title: string): Promise<'shared' | 'copied' | 'failed'> {
  const url = shareUrl()
  const text = `${title} — see the full working on AccrualSense`
  try {
    if (navigator.share) {
      await navigator.share({ title: text, url })
      return 'shared'
    }
  } catch {
    /* user cancelled the sheet — fall through to copy */
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}
