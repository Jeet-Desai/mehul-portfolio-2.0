/* Labour cost — incentive (premium-bonus) wage systems and labour turnover.
   Pure & React-free. Two independent tools sharing this module.

   Grounded in M.N. Arora, *Cost Accounting* (Unit 5 — Labour Cost Control):
   Halsey (1891, 50% of time saved), Halsey–Weir (30%), Rowan plans, plus the
   separation / replacement / flux methods of labour turnover. */
import type { Step } from '../calculators/types'
import { formatINR, formatNum, formatPct } from './format'

/* --------------------------------------------------- Incentive earnings ---- */

export type WageInputs = {
  /** standard (allowed) time for the job, in hours */
  standardTime: number
  /** actual time taken, in hours */
  actualTime: number
  /** time rate per hour */
  rate: number
  /** optional output (units produced) — drives labour cost per unit when > 0 */
  units: number
}

export type WagePlan = {
  key: 'time' | 'piece' | 'halsey' | 'halseyWeir' | 'rowan'
  name: string
  bonus: number
  earnings: number
  /** effective earning per hour actually worked */
  perHour: number
  /** labour cost per unit (only when units > 0) */
  perUnit: number | null
  note: string
}

export type WageResult = {
  timeSaved: number
  timeWages: number
  plans: WagePlan[]
  steps: Step[]
}

export function computeWages(inp: WageInputs): WageResult {
  const timeSaved = inp.standardTime - inp.actualTime
  // Bonus only accrues when time is saved; otherwise time wages are guaranteed.
  const saved = Math.max(0, timeSaved)
  const timeWages = inp.actualTime * inp.rate

  const halseyBonus = 0.5 * saved * inp.rate
  const halseyWeirBonus = 0.3 * saved * inp.rate
  const rowanBonus = inp.standardTime > 0 ? (saved / inp.standardTime) * inp.actualTime * inp.rate : 0
  // Straight piece rate: paid for standard (allowed) time at the time rate.
  const pieceEarnings = inp.standardTime * inp.rate

  const mk = (
    key: WagePlan['key'],
    name: string,
    bonus: number,
    earnings: number,
    note: string,
  ): WagePlan => ({
    key,
    name,
    bonus,
    earnings,
    perHour: inp.actualTime > 0 ? earnings / inp.actualTime : 0,
    perUnit: inp.units > 0 ? earnings / inp.units : null,
    note,
  })

  const plans: WagePlan[] = [
    mk('time', 'Time rate', 0, timeWages, 'Actual hours × rate. No bonus — the guaranteed floor.'),
    mk(
      'piece',
      'Piece rate',
      0,
      pieceEarnings,
      'Paid for the allowed (standard) time at the time rate, regardless of actual hours.',
    ),
    mk(
      'halsey',
      'Halsey (50%)',
      halseyBonus,
      timeWages + halseyBonus,
      'Time wages + 50% of (time saved × rate). Bonus shared with the employer.',
    ),
    mk(
      'halseyWeir',
      'Halsey–Weir (30%)',
      halseyWeirBonus,
      timeWages + halseyWeirBonus,
      'As Halsey, but bonus is 30% of the time saved.',
    ),
    mk(
      'rowan',
      'Rowan',
      rowanBonus,
      timeWages + rowanBonus,
      'Bonus = (time saved ÷ standard time) × time wages. Self-limiting — guards against over-tight rates.',
    ),
  ]

  const steps: Step[] = [
    {
      label: 'Time saved = standard time − actual time',
      formula: `${formatNum(inp.standardTime)} h − ${formatNum(inp.actualTime)} h`,
      result: `${formatNum(timeSaved)} hours`,
      note: timeSaved <= 0 ? 'No time saved — only guaranteed time wages are paid.' : undefined,
    },
    {
      label: 'Time wages (guaranteed) = actual time × rate',
      formula: `${formatNum(inp.actualTime)} × ${formatINR(inp.rate)}`,
      result: formatINR(timeWages),
    },
    {
      label: 'Halsey bonus = 50% × (time saved × rate)',
      formula: `50% × (${formatNum(saved)} × ${formatINR(inp.rate)})`,
      result: formatINR(halseyBonus),
    },
    {
      label: 'Rowan bonus = (time saved ÷ standard time) × time wages',
      formula: `(${formatNum(saved)} ÷ ${formatNum(inp.standardTime)}) × ${formatINR(timeWages)}`,
      result: formatINR(rowanBonus),
      note: 'Halsey gives a higher bonus when over half the time is saved; Rowan when less than half is saved.',
    },
  ]

  return { timeSaved, timeWages, plans, steps }
}

/* ----------------------------------------------------- Labour turnover ----- */

export type TurnoverInputs = {
  /** workers on the payroll at the start of the period */
  opening: number
  /** workers on the payroll at the end of the period */
  closing: number
  /** workers who left (resignations + discharges + retirements) during the period */
  separations: number
  /** new workers engaged in the vacancies of those who left */
  replacements: number
  /** new workers engaged for expansion (not replacements) */
  newForExpansion: number
}

export type TurnoverResult = {
  avgWorkers: number
  accessions: number
  separationRate: number
  replacementRate: number
  fluxRate: number
  /** turnover for fresh recruitment (expansion only) */
  newRecruitmentRate: number
  /** accession rate (replacements + expansion) */
  accessionRate: number
  steps: Step[]
}

export function computeTurnover(inp: TurnoverInputs): TurnoverResult {
  const avgWorkers = (inp.opening + inp.closing) / 2
  const accessions = inp.replacements + inp.newForExpansion
  const pct = (n: number) => (avgWorkers > 0 ? (n / avgWorkers) * 100 : 0)

  const separationRate = pct(inp.separations)
  const replacementRate = pct(inp.replacements)
  const fluxRate = pct(inp.separations + inp.replacements)
  const newRecruitmentRate = pct(inp.newForExpansion)
  const accessionRate = pct(accessions)

  const steps: Step[] = [
    {
      label: 'Average number of workers = (opening + closing) ÷ 2',
      formula: `(${formatNum(inp.opening)} + ${formatNum(inp.closing)}) ÷ 2`,
      result: formatNum(avgWorkers),
    },
    {
      label: 'Separation rate = separations ÷ average workers',
      formula: `${formatNum(inp.separations)} ÷ ${formatNum(avgWorkers)} × 100`,
      result: formatPct(separationRate),
      note: 'Counts only workers who left.',
    },
    {
      label: 'Replacement rate = replacements ÷ average workers',
      formula: `${formatNum(inp.replacements)} ÷ ${formatNum(avgWorkers)} × 100`,
      result: formatPct(replacementRate),
      note: 'Counts only new hires filling vacancies (expansion hires excluded).',
    },
    {
      label: 'Flux rate = (separations + replacements) ÷ average workers',
      formula: `(${formatNum(inp.separations)} + ${formatNum(inp.replacements)}) ÷ ${formatNum(avgWorkers)} × 100`,
      result: formatPct(fluxRate),
      note: 'The total change in composition of the workforce.',
    },
  ]

  return {
    avgWorkers,
    accessions,
    separationRate,
    replacementRate,
    fluxRate,
    newRecruitmentRate,
    accessionRate,
    steps,
  }
}
