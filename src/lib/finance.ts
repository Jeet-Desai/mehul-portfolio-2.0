import { round } from './format'

/* Time-value-of-money core, shared by the SIP and TVM calculators.
   For learning — uses the intuitive single-direction convention:
   you hold PV today, add PMT every period at rate r, and after n
   periods it grows to FV. No cash-flow sign juggling. */

/** Annuity factor: the multiplier on a level PMT to reach its future value.
    `due` = payments at the start of each period (annuity due); else end (ordinary). */
export function annuityFactor(r: number, n: number, due: boolean): number {
  if (r === 0) return n
  const f = (Math.pow(1 + r, n) - 1) / r
  return due ? f * (1 + r) : f
}

/** FV = PV·(1+r)ⁿ + PMT·annuityFactor */
export function futureValue(pv: number, pmt: number, r: number, n: number, due: boolean): number {
  return pv * Math.pow(1 + r, n) + pmt * annuityFactor(r, n, due)
}

/** PV such that it grows (with the PMTs) to a target FV. */
export function presentValue(fv: number, pmt: number, r: number, n: number, due: boolean): number {
  return (fv - pmt * annuityFactor(r, n, due)) / Math.pow(1 + r, n)
}

/** The level PMT needed to move from PV today to a target FV. */
export function payment(pv: number, fv: number, r: number, n: number, due: boolean): number {
  const af = annuityFactor(r, n, due)
  if (af === 0) return 0
  return (fv - pv * Math.pow(1 + r, n)) / af
}

/** Solve for the number of periods n by bisection. Returns NaN if no solution brackets. */
export function solveN(pv: number, pmt: number, fv: number, r: number, due: boolean): number {
  const g = (n: number) => futureValue(pv, pmt, r, n, due) - fv
  let lo = 0
  let hi = 1
  // grow the upper bound until the target is bracketed (or give up)
  while (g(lo) * g(hi) > 0 && hi < 100000) hi *= 2
  if (g(lo) * g(hi) > 0) return NaN
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    const v = g(mid)
    if (Math.abs(v) < 1e-6) return mid
    if (g(lo) * v <= 0) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}

/** Solve for the per-period rate r by bisection. Returns NaN if no solution brackets. */
export function solveRate(pv: number, pmt: number, fv: number, n: number, due: boolean): number {
  const g = (r: number) => futureValue(pv, pmt, r, n, due) - fv
  let lo = -0.9999
  let hi = 1 // 100% per period — generous upper bound
  while (g(lo) * g(hi) > 0 && hi < 1000) hi *= 2
  if (g(lo) * g(hi) > 0) return NaN
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    const v = g(mid)
    if (Math.abs(v) < 1e-6) return mid
    if (g(lo) * v <= 0) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}

export type SipYear = { year: number; invested: number; value: number; gain: number }

/** Month-by-month SIP simulation with optional annual step-up.
    Contributions are made at the start of each month, then grow for that month. */
export function simulateSip(
  monthly: number,
  annualRatePct: number,
  years: number,
  stepUpPct = 0,
): { fv: number; invested: number; gain: number; yearly: SipYear[] } {
  const r = annualRatePct / 100 / 12
  const months = Math.round(years * 12)
  let value = 0
  let invested = 0
  let amt = monthly
  const yearly: SipYear[] = []
  for (let month = 1; month <= months; month++) {
    value = (value + amt) * (1 + r)
    invested += amt
    if (month % 12 === 0) {
      yearly.push({
        year: month / 12,
        invested: round(invested),
        value: round(value),
        gain: round(value - invested),
      })
      amt = amt * (1 + stepUpPct / 100) // step up for the next year
    }
  }
  return { fv: round(value), invested: round(invested), gain: round(value - invested), yearly }
}
