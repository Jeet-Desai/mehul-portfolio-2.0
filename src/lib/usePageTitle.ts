import { useEffect } from 'react'
import { site } from '../data/site'

/**
 * Per-route <title> + meta description — the SPA equivalent of page SEO.
 * Call once per page: usePageTitle('Break-even / CVP Calculator', 'Find the…').
 * Restores nothing on unmount — the next page sets its own.
 */
export function usePageTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${site.brand}` : `${site.brand} — by Dr Mehulkumar Desai`
    if (description) {
      const el = document.querySelector('meta[name="description"]')
      if (el) el.setAttribute('content', description)
    }
  }, [title, description])
}
