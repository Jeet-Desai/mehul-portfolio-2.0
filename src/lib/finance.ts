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

/* ----------------------------------------------------------------------------
   Growth & return measures — CAGR / XIRR
---------------------------------------------------------------------------- */

/** Compound Annual Growth Rate from a beginning to an ending value over `years`.
    CAGR = (end ÷ begin)^(1/years) − 1.  Returns NaN for non-positive inputs. */
export function cagr(begin: number, end: number, years: number): number {
  if (begin <= 0 || end <= 0 || years <= 0) return NaN
  return Math.pow(end / begin, 1 / years) - 1
}

export type DatedFlow = { date: Date; amount: number }

const MS_PER_DAY = 86_400_000

/** XNPV — net present value of dated cash flows, discounted on an Actual/365 basis
    (the convention Excel's XNPV/XIRR use). Flows are dated from the first entry. */
export function xnpv(rate: number, flows: DatedFlow[]): number {
  if (flows.length === 0) return NaN
  const t0 = flows[0].date.getTime()
  return flows.reduce((acc, f) => {
    const years = (f.date.getTime() - t0) / MS_PER_DAY / 365
    return acc + f.amount / Math.pow(1 + rate, years)
  }, 0)
}

/** XIRR — the annualised return that sets XNPV to zero for irregularly-timed flows.
    Newton-Raphson from `guess`, falling back to a bracketing bisection scan if it
    diverges. Needs at least one negative and one positive flow. Returns NaN if none. */
export function xirr(flows: DatedFlow[], guess = 0.1): number {
  if (flows.length < 2) return NaN
  const hasPos = flows.some((f) => f.amount > 0)
  const hasNeg = flows.some((f) => f.amount < 0)
  if (!hasPos || !hasNeg) return NaN

  const t0 = flows[0].date.getTime()
  const yearFrac = flows.map((f) => (f.date.getTime() - t0) / MS_PER_DAY / 365)
  const f = (r: number) => flows.reduce((a, fl, i) => a + fl.amount / Math.pow(1 + r, yearFrac[i]), 0)
  const df = (r: number) =>
    flows.reduce((a, fl, i) => a - (yearFrac[i] * fl.amount) / Math.pow(1 + r, yearFrac[i] + 1), 0)

  // Newton-Raphson
  let r = guess
  for (let i = 0; i < 100; i++) {
    const v = f(r)
    const d = df(r)
    if (Math.abs(v) < 1e-7) return r
    if (d === 0) break
    const next = r - v / d
    if (!Number.isFinite(next) || next <= -1) break // stepped out of the valid domain
    if (Math.abs(next - r) < 1e-9) return next
    r = next
  }
  // Fallback: scan for a sign change, then bisect that bracket
  let prev = -0.9999
  let prevVal = f(prev)
  for (let rr = prev + 0.01; rr <= 100; rr += 0.01) {
    const val = f(rr)
    if (Number.isFinite(val) && prevVal * val <= 0) {
      let lo = prev
      let hi = rr
      for (let i = 0; i < 200; i++) {
        const mid = (lo + hi) / 2
        const v = f(mid)
        if (Math.abs(v) < 1e-7) return mid
        if (f(lo) * v <= 0) hi = mid
        else lo = mid
      }
      return (lo + hi) / 2
    }
    prev = rr
    prevVal = val
  }
  return NaN
}

/* ----------------------------------------------------------------------------
   Capital budgeting — NPV / IRR / payback (period cash flows, index 0 = today)
---------------------------------------------------------------------------- */

/** Net present value of period cash flows. flows[0] is today (undiscounted),
    flows[t] is discounted by (1+rate)^t. */
export function npv(rate: number, flows: number[]): number {
  return flows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0)
}

/** Internal rate of return: the rate where NPV = 0. Scans for the first
    sign-change bracket from −99% upward, then bisects it. Returns NaN if the
    cash flows never cross zero (e.g. all inflows or all outflows). */
export function irr(flows: number[]): number {
  const f = (r: number) => npv(r, flows)
  let prev = -0.9999
  let prevVal = f(prev)
  for (let r = prev + 0.005; r <= 100; r += 0.005) {
    const val = f(r)
    if (Number.isFinite(val) && prevVal * val <= 0) {
      let lo = prev
      let hi = r
      for (let i = 0; i < 200; i++) {
        const mid = (lo + hi) / 2
        const v = f(mid)
        if (Math.abs(v) < 1e-7) return mid
        if (f(lo) * v <= 0) hi = mid
        else lo = mid
      }
      return (lo + hi) / 2
    }
    prev = r
    prevVal = val
  }
  return NaN
}

/** Payback period in periods (fractional, by straight-line interpolation within
    the recovery period). flows[0] is the outlay (negative); later entries are
    recoveries. Pass discounted flows to get the discounted payback. Returns null
    if the cumulative balance never turns non-negative. */
export function paybackPeriod(flows: number[]): number | null {
  let cum = flows[0] ?? 0
  if (cum >= 0) return 0
  for (let t = 1; t < flows.length; t++) {
    const before = cum
    cum += flows[t]
    if (cum >= 0) return t - 1 + -before / flows[t]
  }
  return null
}

/* ----------------------------------------------------------------------------
   Bond pricing & yield to maturity
---------------------------------------------------------------------------- */

/** Price of a plain-vanilla coupon bond = PV of coupons + PV of redemption.
    `freq` = coupon payments per year (1 = annual, 2 = semi-annual). The annual
    yield is converted to a per-period rate (yield ÷ freq). */
export function bondPrice(
  face: number,
  annualCouponPct: number,
  years: number,
  annualYieldPct: number,
  freq: number,
): number {
  const m = Math.max(1, Math.round(freq))
  const n = Math.max(1, Math.round(years * m))
  const coupon = (face * (annualCouponPct / 100)) / m
  const i = annualYieldPct / 100 / m
  if (i === 0) return coupon * n + face
  let price = 0
  for (let t = 1; t <= n; t++) price += coupon / Math.pow(1 + i, t)
  price += face / Math.pow(1 + i, n)
  return price
}

/** Yield to maturity (nominal annual %) for a bond bought at `marketPrice`.
    Builds the bond's periodic cash flows and solves for the rate that prices
    them to the market price (reuses the IRR root-finder), then annualises by
    multiplying the per-period rate by `freq`. Returns NaN if no rate is found. */
export function bondYTM(
  marketPrice: number,
  face: number,
  annualCouponPct: number,
  years: number,
  freq: number,
): number {
  const m = Math.max(1, Math.round(freq))
  const n = Math.max(1, Math.round(years * m))
  const coupon = (face * (annualCouponPct / 100)) / m
  const flows = [-marketPrice]
  for (let t = 1; t <= n; t++) flows.push(t === n ? coupon + face : coupon)
  const periodic = irr(flows)
  return Number.isFinite(periodic) ? periodic * m * 100 : NaN
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
