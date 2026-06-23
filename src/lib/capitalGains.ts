import { round } from './format'

/* ----------------------------------------------------------------------------
   Capital gains — India, FY 2025-26 (AY 2026-27).
   For learning only. Verify against the latest Finance Act / a CA before filing.

   Sources (verified June 2026):
   - LTCG equity 112A: 12.5% on gains above ₹1,25,000; STCG equity 111A: 20%.
   - LTCG other 112: 12.5% without indexation (transfers on/after 23 Jul 2024).
     Land/building acquired before 23 Jul 2024 (resident individual/HUF): may
     opt for the lower of 12.5% (no indexation) or 20% (with indexation).
   - STCG on non-equity assets: added to income, taxed at slab rates.
   - Health & education cess @ 4% applies on the tax. Surcharge ignored here.
   - CII: CBDT Notification 70/2025 — FY 2025-26 = 376 (base 2001-02 = 100).
---------------------------------------------------------------------------- */

/** Cost Inflation Index, base FY 2001-02 = 100. Source: CBDT notifications. */
export const CII: Record<string, number> = {
  '2001-02': 100,
  '2002-03': 105,
  '2003-04': 109,
  '2004-05': 113,
  '2005-06': 117,
  '2006-07': 122,
  '2007-08': 129,
  '2008-09': 137,
  '2009-10': 148,
  '2010-11': 167,
  '2011-12': 184,
  '2012-13': 200,
  '2013-14': 220,
  '2014-15': 240,
  '2015-16': 254,
  '2016-17': 264,
  '2017-18': 272,
  '2018-19': 280,
  '2019-20': 289,
  '2020-21': 301,
  '2021-22': 317,
  '2022-23': 331,
  '2023-24': 348,
  '2024-25': 363,
  '2025-26': 376,
}

export const LTCG_EQUITY_EXEMPTION = 125000
export const RATE_EQUITY_STCG = 20 // §111A
export const RATE_EQUITY_LTCG = 12.5 // §112A
export const RATE_OTHER_LTCG = 12.5 // §112, no indexation
export const RATE_OTHER_LTCG_INDEXED = 20 // §112, with indexation (grandfathered option)
export const CESS_RATE = 4

/** The Indian financial year (Apr–Mar) that a date falls in, e.g. "2015-16". */
export function financialYear(date: Date): string {
  const y = date.getFullYear()
  const start = date.getMonth() >= 3 ? y : y - 1 // April = month index 3
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`
}

/** CII for the FY a date falls in. Indexation is only available from FY 2001-02,
    so earlier acquisitions are clamped to the 2001-02 index (100). */
export function ciiFor(date: Date): { fy: string; cii: number; clamped: boolean } {
  const fy = financialYear(date)
  if (CII[fy] != null) return { fy, cii: CII[fy], clamped: false }
  const firstFy = '2001-02'
  // before 2001-02 → clamp; after the table (future) → use the latest known
  const years = Object.keys(CII)
  const startYear = Number(fy.slice(0, 4))
  if (startYear < 2001) return { fy: firstFy, cii: CII[firstFy], clamped: true }
  const last = years[years.length - 1]
  return { fy: last, cii: CII[last], clamped: true }
}

function addMonths(d: Date, months: number): Date {
  const r = new Date(d.getTime())
  r.setMonth(r.getMonth() + months)
  return r
}

export type AssetType = 'equity' | 'other'

export type CGInput = {
  assetType: AssetType
  purchase: number
  sale: number
  expenses: number
  purchaseDate: Date
  saleDate: Date
  /** land/building acquired before 23 Jul 2024 → eligible for the 20%+indexation option */
  landBuildingOption: boolean
  /** marginal slab rate for STCG on non-equity assets (estimate only) */
  slabRatePct: number
}

export type CGMethod = {
  label: string
  taxableGain: number
  rate: number
  tax: number
  chosen: boolean
  note?: string
}

export type CGResult = {
  valid: boolean
  term: 'LTCG' | 'STCG'
  thresholdMonths: 12 | 24
  longTerm: boolean
  netConsideration: number
  rawGain: number // sale − cost − expenses (no indexation)
  isLoss: boolean
  exemption: number
  taxableGain: number
  methods: CGMethod[]
  chosenMethod: CGMethod | null
  indexation?: { ciiPurchase: number; ciiSale: number; fyPurchase: string; fySale: string; indexedCost: number; clamped: boolean }
  taxBeforeCess: number
  cess: number
  totalTax: number
}

export function computeCapitalGains(input: CGInput): CGResult {
  const { assetType, purchase, sale, expenses, purchaseDate, saleDate } = input
  const thresholdMonths: 12 | 24 = assetType === 'equity' ? 12 : 24
  const longTerm = saleDate.getTime() > addMonths(purchaseDate, thresholdMonths).getTime()
  const term: 'LTCG' | 'STCG' = longTerm ? 'LTCG' : 'STCG'

  const netConsideration = sale - expenses
  const rawGain = round(netConsideration - purchase)
  const isLoss = rawGain < 0

  const base: Omit<CGResult, 'methods' | 'chosenMethod' | 'taxBeforeCess' | 'cess' | 'totalTax'> = {
    valid: true,
    term,
    thresholdMonths,
    longTerm,
    netConsideration: round(netConsideration),
    rawGain,
    isLoss,
    exemption: 0,
    taxableGain: 0,
  }

  // Capital loss — no tax payable
  if (isLoss) {
    const m: CGMethod = {
      label: 'Capital loss',
      taxableGain: rawGain,
      rate: 0,
      tax: 0,
      chosen: true,
      note: 'No tax. The loss can be set off / carried forward per the set-off rules.',
    }
    return { ...base, taxableGain: rawGain, methods: [m], chosenMethod: m, taxBeforeCess: 0, cess: 0, totalTax: 0 }
  }

  let methods: CGMethod[] = []
  let exemption = 0
  let indexation: CGResult['indexation']

  if (assetType === 'equity') {
    if (longTerm) {
      exemption = Math.min(rawGain, LTCG_EQUITY_EXEMPTION)
      const taxable = Math.max(0, rawGain - LTCG_EQUITY_EXEMPTION)
      methods = [
        {
          label: 'LTCG on equity (§112A) @ 12.5%',
          taxableGain: round(taxable),
          rate: RATE_EQUITY_LTCG,
          tax: round((taxable * RATE_EQUITY_LTCG) / 100),
          chosen: true,
          note: `First ₹1,25,000 of equity LTCG in the year is exempt.`,
        },
      ]
    } else {
      methods = [
        {
          label: 'STCG on equity (§111A) @ 20%',
          taxableGain: rawGain,
          rate: RATE_EQUITY_STCG,
          tax: round((rawGain * RATE_EQUITY_STCG) / 100),
          chosen: true,
        },
      ]
    }
  } else {
    // other assets
    if (longTerm) {
      // Option A: 12.5% without indexation
      const taxA = round((rawGain * RATE_OTHER_LTCG) / 100)
      const optA: CGMethod = {
        label: 'LTCG (§112) @ 12.5% — no indexation',
        taxableGain: rawGain,
        rate: RATE_OTHER_LTCG,
        tax: taxA,
        chosen: true,
      }
      methods = [optA]

      if (input.landBuildingOption) {
        const p = ciiFor(purchaseDate)
        const s = ciiFor(saleDate)
        const indexedCost = round((purchase * s.cii) / p.cii)
        const gainB = Math.max(0, round(netConsideration - indexedCost))
        const taxB = round((gainB * RATE_OTHER_LTCG_INDEXED) / 100)
        const optB: CGMethod = {
          label: 'LTCG (§112) @ 20% — with indexation',
          taxableGain: gainB,
          rate: RATE_OTHER_LTCG_INDEXED,
          tax: taxB,
          chosen: false,
          note: `Indexed cost = ₹${purchase.toLocaleString('en-IN')} × ${s.cii} ÷ ${p.cii}`,
        }
        indexation = {
          ciiPurchase: p.cii,
          ciiSale: s.cii,
          fyPurchase: p.fy,
          fySale: s.fy,
          indexedCost,
          clamped: p.clamped || s.clamped,
        }
        // choose the lower-tax option (grandfathered relief)
        if (taxB < taxA) {
          optA.chosen = false
          optB.chosen = true
        }
        methods = [optA, optB]
      }
    } else {
      const rate = Math.max(0, input.slabRatePct)
      methods = [
        {
          label: 'STCG on other assets — at your slab rate',
          taxableGain: rawGain,
          rate,
          tax: round((rawGain * rate) / 100),
          chosen: true,
          note: 'Added to total income and taxed at the applicable slab rate (estimate using the rate you entered).',
        },
      ]
    }
  }

  const chosenMethod = methods.find((m) => m.chosen) ?? methods[0] ?? null
  const taxBeforeCess = chosenMethod ? chosenMethod.tax : 0
  const cess = round((taxBeforeCess * CESS_RATE) / 100)
  const totalTax = round(taxBeforeCess + cess)

  return {
    ...base,
    exemption: round(exemption),
    taxableGain: chosenMethod ? chosenMethod.taxableGain : 0,
    methods,
    chosenMethod,
    indexation,
    taxBeforeCess,
    cess,
    totalTax,
  }
}
