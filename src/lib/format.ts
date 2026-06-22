/* Number / currency helpers — India-first (₹, lakh-crore grouping). */

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

const num = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })

export const formatINR = (n: number): string => (Number.isFinite(n) ? inr.format(n) : '—')

export const formatNum = (n: number, frac = 2): string =>
  Number.isFinite(n)
    ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: frac }).format(n)
    : '—'

export const formatPct = (n: number, frac = 2): string =>
  Number.isFinite(n) ? `${num.format(round(n, frac))}%` : '—'

export const round = (n: number, d = 2): number => {
  const f = 10 ** d
  return Math.round((n + Number.EPSILON) * f) / f
}

/** Parse a user-typed string into a number; blank/invalid → 0. */
export const toNum = (s: string): number => {
  const n = parseFloat(s.replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}
