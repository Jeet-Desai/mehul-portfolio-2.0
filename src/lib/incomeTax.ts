import { formatINR, round } from './format'

/* Simplified income-tax engine for FY 2025-26 (AY 2026-27), individuals below 60.
   For learning — verify against the latest Finance Act for filing. */

export type Slab = { upTo: number | null; rate: number }

export const NEW_SLABS: Slab[] = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 5 },
  { upTo: 1200000, rate: 10 },
  { upTo: 1600000, rate: 15 },
  { upTo: 2000000, rate: 20 },
  { upTo: 2400000, rate: 25 },
  { upTo: null, rate: 30 },
]

export const OLD_SLABS: Slab[] = [
  { upTo: 250000, rate: 0 },
  { upTo: 500000, rate: 5 },
  { upTo: 1000000, rate: 20 },
  { upTo: null, rate: 30 },
]

export type SlabRow = { range: string; rate: number; taxable: number; amount: number }

export function computeSlabTax(income: number, slabs: Slab[]): { tax: number; rows: SlabRow[] } {
  let tax = 0
  let lower = 0
  const rows: SlabRow[] = []
  for (const s of slabs) {
    const upper = s.upTo ?? Infinity
    if (income > lower) {
      const taxable = Math.min(income, upper) - lower
      const amount = (taxable * s.rate) / 100
      tax += amount
      rows.push({
        range: s.upTo ? `${formatINR(lower)} – ${formatINR(upper)}` : `Above ${formatINR(lower)}`,
        rate: s.rate,
        taxable: round(taxable),
        amount: round(amount),
      })
    }
    lower = upper
    if (income <= upper) break
  }
  return { tax: round(tax), rows }
}

export type RegimeResult = {
  regime: 'new' | 'old'
  std: number
  deductions: number
  taxable: number
  rows: SlabRow[]
  tax: number
  rebate: number
  afterRebate: number
  cess: number
  total: number
}

export function computeRegime(params: {
  gross: number
  deductions: number
  salaried: boolean
  regime: 'new' | 'old'
}): RegimeResult {
  const cfg =
    params.regime === 'new'
      ? { slabs: NEW_SLABS, std: 75000, rebateUpto: 1200000 }
      : { slabs: OLD_SLABS, std: 50000, rebateUpto: 500000 }
  const std = params.salaried ? cfg.std : 0
  const deductions = params.regime === 'old' ? params.deductions : 0
  const taxable = Math.max(0, params.gross - std - deductions)
  const { tax, rows } = computeSlabTax(taxable, cfg.slabs)
  const rebate = taxable <= cfg.rebateUpto ? tax : 0
  const afterRebate = round(tax - rebate)
  const cess = round(afterRebate * 0.04)
  const total = round(afterRebate + cess)
  return { regime: params.regime, std, deductions, taxable, rows, tax, rebate, afterRebate, cess, total }
}
