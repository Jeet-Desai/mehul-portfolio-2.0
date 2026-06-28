/* Overhead absorption — compute the overhead absorption (recovery) rate by the
   six standard methods, apply a predetermined rate, and find under-/over-
   absorption. Pure & React-free.

   Grounded in M.N. Arora, *Cost Accounting* (Unit 6 — Overhead Cost Control,
   §6.4 Absorption of Overheads, §6.6 Under-/Over-absorption). */
import type { Step } from '../calculators/types'
import { formatINR, formatNum, formatPct } from './format'

export type AbsMethod = 'material' | 'labour' | 'prime' | 'labourHour' | 'machineHour' | 'unit'

export type OverheadInputs = {
  /** budgeted (or normal) production overheads for the period */
  overheads: number
  directMaterial: number
  directLabour: number
  labourHours: number
  machineHours: number
  units: number
  /** chosen method — drives the hero rate and the under/over-absorption */
  method: AbsMethod
  /** actual overheads incurred (for under-/over-absorption) */
  actualOverheads: number
  /** actual level of the chosen base (₹ for % methods, hours for hour rates, units for per-unit) */
  actualBase: number
}

export type RateRow = { key: AbsMethod; name: string; rate: number; unit: string; basis: number }

export type OverheadResult = {
  primeCost: number
  rows: RateRow[]
  chosen: RateRow
  absorbed: number
  /** positive = under-absorbed (actual > absorbed); negative = over-absorbed */
  underAbsorbed: number
  steps: Step[]
}

const METHOD_NAME: Record<AbsMethod, string> = {
  material: '% of direct material cost',
  labour: '% of direct labour cost',
  prime: '% of prime cost',
  labourHour: 'Direct labour hour rate',
  machineHour: 'Machine hour rate',
  unit: 'Rate per unit',
}

export function computeOverhead(inp: OverheadInputs): OverheadResult {
  const primeCost = inp.directMaterial + inp.directLabour
  const div = (a: number, b: number) => (b > 0 ? a / b : 0)

  const rows: RateRow[] = [
    { key: 'material', name: METHOD_NAME.material, rate: div(inp.overheads, inp.directMaterial) * 100, unit: '%', basis: inp.directMaterial },
    { key: 'labour', name: METHOD_NAME.labour, rate: div(inp.overheads, inp.directLabour) * 100, unit: '%', basis: inp.directLabour },
    { key: 'prime', name: METHOD_NAME.prime, rate: div(inp.overheads, primeCost) * 100, unit: '%', basis: primeCost },
    { key: 'labourHour', name: METHOD_NAME.labourHour, rate: div(inp.overheads, inp.labourHours), unit: '₹/hr', basis: inp.labourHours },
    { key: 'machineHour', name: METHOD_NAME.machineHour, rate: div(inp.overheads, inp.machineHours), unit: '₹/hr', basis: inp.machineHours },
    { key: 'unit', name: METHOD_NAME.unit, rate: div(inp.overheads, inp.units), unit: '₹/unit', basis: inp.units },
  ]

  const chosen = rows.find((r) => r.key === inp.method)!
  const isPct = chosen.unit === '%'
  // Overhead absorbed = predetermined rate applied to the actual level of the base.
  const absorbed = isPct ? (chosen.rate / 100) * inp.actualBase : chosen.rate * inp.actualBase
  const underAbsorbed = inp.actualOverheads - absorbed

  const rateLabel = isPct ? formatPct(chosen.rate) : `${formatINR(chosen.rate)} ${chosen.unit.replace('₹', '')}`

  const steps: Step[] = [
    {
      label: `Absorption rate — ${chosen.name}`,
      formula: `${formatINR(inp.overheads)} ÷ ${isPct ? formatINR(chosen.basis) : formatNum(chosen.basis)}${isPct ? ' × 100' : ''}`,
      result: rateLabel,
      note: 'Rate = budgeted overheads ÷ budgeted base. Only one rate is struck for a group of overheads.',
    },
    {
      label: 'Overhead absorbed = rate × actual base',
      formula: isPct
        ? `${formatPct(chosen.rate)} × ${formatINR(inp.actualBase)}`
        : `${formatINR(chosen.rate)} × ${formatNum(inp.actualBase)}`,
      result: formatINR(absorbed),
    },
    {
      label: 'Under-/over-absorption = actual overhead − absorbed',
      formula: `${formatINR(inp.actualOverheads)} − ${formatINR(absorbed)}`,
      result: `${formatINR(Math.abs(underAbsorbed))} ${underAbsorbed >= 0 ? 'under-absorbed' : 'over-absorbed'}`,
      note:
        underAbsorbed >= 0
          ? 'Actual exceeds absorbed — costs were under-recovered; charge the shortfall to the costing P&L (or use a supplementary rate).'
          : 'Absorbed exceeds actual — costs were over-recovered; credit the excess back.',
    },
  ]

  return { primeCost, rows, chosen, absorbed, underAbsorbed, steps }
}
