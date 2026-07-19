import { round } from './format'
import type { Step } from '../calculators/types'
import { computeFd } from './savings'
import { computeMarginalAbsorption } from './marginalAbsorption'
import { todayKey } from './progress'

/* ----------------------------------------------------------------------------
   Problem Lab — an infinite exam-style numerical generator.

   Each template REVERSE-ENGINEERS its inputs from a clean answer (pick the EOQ,
   derive the demand) so every generated problem has exam-friendly round figures,
   and computes the answer key with the SAME verified engines the calculators
   use (computeFd, computeMarginalAbsorption) or hand-checked closed forms.
   Correctness therefore never depends on the random numbers.

   Determinism: a problem is (templateId, seed). The same pair always produces
   the same problem — this powers the shareable "challenge a friend" links and
   the Daily Challenge (seed derived from the local date, like QotD).
---------------------------------------------------------------------------- */

export type LabAnswer = {
  key: string
  label: string
  /** the correct value */
  value: number
  unit?: string
  /** absolute tolerance for grading (covers rounding differences) */
  tol: number
}

export type LabProblem = {
  templateId: string
  topic: string
  title: string
  /** the exam-style narrative */
  scenario: string
  given: { label: string; value: string }[]
  answers: LabAnswer[]
  steps: Step[]
  /** related calculator slug (rendered only if it exists in the registry) */
  calc?: string
}

export type LabTemplate = {
  id: string
  label: string
  topic: string
}

/* ------------------------------------------------------------------ seeding */

/** mulberry32 — tiny deterministic PRNG, good enough for problem variation. */
function mulberry32(a: number): () => number {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** djb2 string hash → PRNG seed (for date-based daily seeds). */
export function hashSeed(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i)
  return h >>> 0
}

const pick = <T,>(rng: () => number, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)]

/** money tolerance: generous enough to forgive rounding, tight enough to catch method errors */
const tolFor = (v: number) => Math.max(0.6, Math.abs(v) * 0.005)

const inr = (n: number) => '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(round(n))
const num = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(round(n))

/* ---------------------------------------------------------------- templates */

function tplEoq(rng: () => number): LabProblem {
  // choose clean EOQ and orders/year, derive demand and ordering cost
  const E = pick(rng, [300, 600, 900, 1200] as const)
  const N = pick(rng, [5, 6, 10] as const)
  const C = pick(rng, [2, 4] as const) // carrying cost ₹/unit/yr
  const A = N * E // annual demand
  const O = (C * E) / (2 * N) // ordering cost per order (integer by construction)
  const orderingTotal = N * O // = carrying total at EOQ

  return {
    templateId: 'eoq',
    topic: 'Material control',
    title: 'Economic Order Quantity',
    scenario: `A factory uses ${num(A)} units of a raw material a year. Each purchase order costs ${inr(O)} to place, and carrying one unit in stock for a year costs ${inr(C)}. Find the economic order quantity, the number of orders per year, and the total annual ordering cost at EOQ.`,
    given: [
      { label: 'Annual demand (A)', value: `${num(A)} units` },
      { label: 'Ordering cost per order (O)', value: inr(O) },
      { label: 'Carrying cost per unit per year (C)', value: inr(C) },
    ],
    answers: [
      { key: 'eoq', label: 'Economic order quantity', value: E, unit: 'units', tol: 0.51 },
      { key: 'orders', label: 'Orders per year', value: N, unit: 'orders', tol: 0.05 },
      { key: 'ordCost', label: 'Total annual ordering cost at EOQ', value: orderingTotal, unit: '₹', tol: tolFor(orderingTotal) },
    ],
    steps: [
      { label: 'EOQ formula', formula: `EOQ = √(2AO ÷ C) = √(2 × ${num(A)} × ${num(O)} ÷ ${num(C)})`, result: `${num(E)} units` },
      { label: 'Orders per year', formula: `A ÷ EOQ = ${num(A)} ÷ ${num(E)}`, result: `${num(N)} orders` },
      { label: 'Annual ordering cost', formula: `${num(N)} orders × ${inr(O)}`, result: inr(orderingTotal), note: 'At EOQ this exactly equals the annual carrying cost (EOQ/2 × C) — that equality is the whole point of EOQ.' },
    ],
    calc: 'eoq-stock-levels',
  }
}

function tplBreakEven(rng: () => number): LabProblem {
  const c = pick(rng, [20, 30, 40, 50] as const) // contribution per unit
  const m = pick(rng, [2, 2.5, 4] as const) // SP multiple → P/V 50 / 40 / 25 %
  const sp = c * m
  const vc = sp - c
  const bep = pick(rng, [1500, 2000, 3000, 4000] as const)
  const fc = c * bep
  const mos = pick(rng, [500, 1000, 1500] as const)
  const actual = bep + mos
  const pv = (c / sp) * 100

  return {
    templateId: 'break-even',
    topic: 'Marginal costing / CVP',
    title: 'Break-even Analysis',
    scenario: `A product sells for ${inr(sp)} per unit with a variable cost of ${inr(vc)} per unit. Fixed costs are ${inr(fc)} a year, and the company currently sells ${num(actual)} units. Find the contribution per unit, the P/V ratio, the break-even point in units, and the margin of safety in units.`,
    given: [
      { label: 'Selling price per unit', value: inr(sp) },
      { label: 'Variable cost per unit', value: inr(vc) },
      { label: 'Fixed costs', value: inr(fc) },
      { label: 'Actual sales', value: `${num(actual)} units` },
    ],
    answers: [
      { key: 'contribution', label: 'Contribution per unit', value: c, unit: '₹', tol: 0.51 },
      { key: 'pv', label: 'P/V ratio', value: pv, unit: '%', tol: 0.51 },
      { key: 'bep', label: 'Break-even point', value: bep, unit: 'units', tol: 0.51 },
      { key: 'mos', label: 'Margin of safety', value: mos, unit: 'units', tol: 0.51 },
    ],
    steps: [
      { label: 'Contribution per unit', formula: `SP − VC = ${inr(sp)} − ${inr(vc)}`, result: inr(c) },
      { label: 'P/V ratio', formula: `Contribution ÷ Sales × 100 = ${num(c)} ÷ ${num(sp)} × 100`, result: `${num(pv)}%` },
      { label: 'Break-even point', formula: `Fixed cost ÷ Contribution per unit = ${inr(fc)} ÷ ${inr(c)}`, result: `${num(bep)} units` },
      { label: 'Margin of safety', formula: `Actual sales − BEP = ${num(actual)} − ${num(bep)}`, result: `${num(mos)} units`, note: 'MoS is how far sales can fall before losses begin.' },
    ],
    calc: 'break-even',
  }
}

function tplOverhead(rng: () => number): LabProblem {
  const r = pick(rng, [20, 25, 30, 40, 50] as const) // machine-hour rate
  const H = pick(rng, [2000, 2500, 4000, 5000] as const) // budgeted hours
  const B = r * H
  const dh = pick(rng, [-400, -200, 200, 400] as const)
  const h = H + dh // actual hours
  const absorbed = h * r
  const extra = pick(rng, [5000, 10000, 15000, 20000] as const)
  const actualOh = absorbed + extra // always UNDER-absorbed by `extra`

  return {
    templateId: 'overhead',
    topic: 'Overheads',
    title: 'Overhead Absorption (Machine-hour Rate)',
    scenario: `A machine shop budgets overheads of ${inr(B)} for ${num(H)} machine hours. During the year the machines actually ran ${num(h)} hours and actual overheads came to ${inr(actualOh)}. Find the machine-hour rate, the overhead absorbed, and the amount of under-absorption.`,
    given: [
      { label: 'Budgeted overheads', value: inr(B) },
      { label: 'Budgeted machine hours', value: `${num(H)} hours` },
      { label: 'Actual machine hours', value: `${num(h)} hours` },
      { label: 'Actual overheads', value: inr(actualOh) },
    ],
    answers: [
      { key: 'mhr', label: 'Machine-hour rate', value: r, unit: '₹/hour', tol: 0.51 },
      { key: 'absorbed', label: 'Overhead absorbed', value: absorbed, unit: '₹', tol: tolFor(absorbed) },
      { key: 'under', label: 'Under-absorption', value: extra, unit: '₹', tol: tolFor(extra) },
    ],
    steps: [
      { label: 'Machine-hour rate (predetermined)', formula: `Budgeted OH ÷ Budgeted hours = ${inr(B)} ÷ ${num(H)}`, result: `${inr(r)} per hour` },
      { label: 'Overhead absorbed', formula: `Actual hours × rate = ${num(h)} × ${inr(r)}`, result: inr(absorbed) },
      { label: 'Under-absorption', formula: `Actual OH − Absorbed = ${inr(actualOh)} − ${inr(absorbed)}`, result: inr(extra), note: 'Absorbed < actual ⇒ under-absorption — costs charged to production fell short of what was really spent.' },
    ],
    calc: 'overhead-absorption',
  }
}

function tplLabourTurnover(rng: () => number): LabProblem {
  const W = pick(rng, [400, 500, 800, 1000] as const) // average workers
  const a = pick(rng, [2, 4, 5] as const) // separation %
  const b = pick(rng, [1, 2, 3] as const) // replacement %
  const s = (W * a) / 100
  const p = (W * b) / 100

  return {
    templateId: 'labour-turnover',
    topic: 'Labour costing',
    title: 'Labour Turnover Rates',
    scenario: `A factory had an average of ${num(W)} workers on its rolls during the year. ${num(s)} workers left or were discharged, of whom ${num(p)} were replaced during the same period. Compute the labour turnover rate by the separation, replacement and flux methods.`,
    given: [
      { label: 'Average number of workers', value: num(W) },
      { label: 'Separations', value: `${num(s)} workers` },
      { label: 'Replacements', value: `${num(p)} workers` },
    ],
    answers: [
      { key: 'sep', label: 'Separation rate', value: a, unit: '%', tol: 0.05 },
      { key: 'rep', label: 'Replacement rate', value: b, unit: '%', tol: 0.05 },
      { key: 'flux', label: 'Flux rate', value: a + b, unit: '%', tol: 0.05 },
    ],
    steps: [
      { label: 'Separation method', formula: `Separations ÷ Average workers × 100 = ${num(s)} ÷ ${num(W)} × 100`, result: `${num(a)}%` },
      { label: 'Replacement method', formula: `Replacements ÷ Average workers × 100 = ${num(p)} ÷ ${num(W)} × 100`, result: `${num(b)}%` },
      { label: 'Flux method', formula: `(Separations + Replacements) ÷ Average workers × 100 = (${num(s)} + ${num(p)}) ÷ ${num(W)} × 100`, result: `${num(a + b)}%`, note: 'Flux counts every movement — both leavers and joiners filling vacancies.' },
    ],
    calc: 'wage-systems',
  }
}

function tplWdv(rng: () => number): LabProblem {
  const C = pick(rng, [100000, 200000, 500000, 800000] as const)
  const r = pick(rng, [10, 15, 20] as const)
  const f = 1 - r / 100
  const d1 = C * (r / 100)
  const d2 = C * f * (r / 100)
  const bv3 = C * f * f * f

  return {
    templateId: 'wdv',
    topic: 'Depreciation',
    title: 'Written-down Value Depreciation',
    scenario: `A machine is bought for ${inr(C)} and depreciated at ${num(r)}% per annum on the written-down value method. Find the depreciation for year 1 and year 2, and the book value at the end of year 3.`,
    given: [
      { label: 'Cost of machine', value: inr(C) },
      { label: 'Depreciation rate (WDV)', value: `${num(r)}% p.a.` },
    ],
    answers: [
      { key: 'd1', label: 'Depreciation — year 1', value: d1, unit: '₹', tol: tolFor(d1) },
      { key: 'd2', label: 'Depreciation — year 2', value: d2, unit: '₹', tol: tolFor(d2) },
      { key: 'bv3', label: 'Book value — end of year 3', value: bv3, unit: '₹', tol: tolFor(bv3) },
    ],
    steps: [
      { label: 'Year 1 depreciation', formula: `${inr(C)} × ${num(r)}%`, result: inr(d1) },
      { label: 'Year 2 depreciation (on reduced balance)', formula: `(${inr(C)} − ${inr(d1)}) × ${num(r)}%`, result: inr(d2) },
      { label: 'Book value after 3 years', formula: `Cost × (1 − r)³ = ${inr(C)} × ${f.toFixed(2)}³`, result: inr(bv3), note: 'Under WDV the charge falls every year — book value never quite reaches zero.' },
    ],
    calc: 'depreciation',
  }
}

function tplFd(rng: () => number): LabProblem {
  const P = pick(rng, [50000, 100000, 200000] as const)
  const rate = pick(rng, [6, 6.5, 7, 7.5, 8] as const)
  const t = pick(rng, [2, 3, 5] as const)
  const res = computeFd({ principal: P, ratePct: rate, years: t, frequency: 4 })

  return {
    templateId: 'fd',
    topic: 'Investing / TVM',
    title: 'Fixed Deposit Maturity',
    scenario: `${inr(P)} is placed in a bank fixed deposit at ${num(rate)}% per annum, compounded quarterly, for ${num(t)} years. Find the maturity value and the total interest earned.`,
    given: [
      { label: 'Deposit', value: inr(P) },
      { label: 'Rate', value: `${num(rate)}% p.a., compounded quarterly` },
      { label: 'Tenure', value: `${num(t)} years` },
    ],
    answers: [
      { key: 'maturity', label: 'Maturity value', value: res.maturity, unit: '₹', tol: tolFor(res.maturity) },
      { key: 'interest', label: 'Total interest earned', value: res.interest, unit: '₹', tol: tolFor(res.interest) },
    ],
    steps: res.steps,
    calc: 'savings-schemes',
  }
}

function tplMarginalAbsorption(rng: () => number): LabProblem {
  const produced = pick(rng, [5000, 8000, 10000] as const)
  const closing = pick(rng, [500, 1000, 2000] as const)
  const sold = produced - closing
  const rate = pick(rng, [10, 20, 25] as const) // fixed OH per unit
  const sp = pick(rng, [80, 100, 120] as const)
  const vc = pick(rng, [30, 40, 50] as const)
  const foh = rate * produced // normal capacity = production → no under/over
  const fixedSell = pick(rng, [20000, 50000] as const)

  const res = computeMarginalAbsorption({
    unitsProduced: produced,
    unitsSold: sold,
    openingStock: 0,
    sellingPrice: sp,
    variableCostPerUnit: vc,
    fixedMfgOverhead: foh,
    normalCapacity: produced,
    varSellingPerUnit: 0,
    fixedSelling: fixedSell,
  })

  return {
    templateId: 'marginal-absorption',
    topic: 'Marginal vs absorption',
    title: 'Profit under Marginal vs Absorption Costing',
    scenario: `A company produced ${num(produced)} units and sold ${num(sold)} units at ${inr(sp)} each (no opening stock). Variable manufacturing cost is ${inr(vc)} per unit; fixed manufacturing overhead is ${inr(foh)} (normal capacity ${num(produced)} units); fixed selling costs are ${inr(fixedSell)}. Find the profit under marginal costing, the profit under absorption costing, and the difference between them.`,
    given: [
      { label: 'Production / Sales', value: `${num(produced)} / ${num(sold)} units` },
      { label: 'Selling price per unit', value: inr(sp) },
      { label: 'Variable manufacturing cost per unit', value: inr(vc) },
      { label: 'Fixed manufacturing overhead', value: `${inr(foh)} (normal capacity ${num(produced)} units)` },
      { label: 'Fixed selling & admin', value: inr(fixedSell) },
    ],
    answers: [
      { key: 'marginal', label: 'Profit — marginal costing', value: res.marginal.profit, unit: '₹', tol: tolFor(res.marginal.profit) },
      { key: 'absorption', label: 'Profit — absorption costing', value: res.absorption.profit, unit: '₹', tol: tolFor(res.absorption.profit) },
      { key: 'diff', label: 'Profit difference', value: res.profitDifference, unit: '₹', tol: tolFor(res.profitDifference) },
    ],
    steps: [...res.steps, ...res.reconciliation],
    calc: 'marginal-vs-absorption',
  }
}

/* ------------------------------------------------------------------ registry */

const makers: Record<string, (rng: () => number) => LabProblem> = {
  eoq: tplEoq,
  'break-even': tplBreakEven,
  overhead: tplOverhead,
  'labour-turnover': tplLabourTurnover,
  wdv: tplWdv,
  fd: tplFd,
  'marginal-absorption': tplMarginalAbsorption,
}

export const labTemplates: LabTemplate[] = [
  { id: 'break-even', label: 'Break-even / CVP', topic: 'Marginal costing' },
  { id: 'eoq', label: 'EOQ', topic: 'Material control' },
  { id: 'overhead', label: 'Overhead absorption', topic: 'Overheads' },
  { id: 'labour-turnover', label: 'Labour turnover', topic: 'Labour costing' },
  { id: 'wdv', label: 'Depreciation (WDV)', topic: 'Depreciation' },
  { id: 'fd', label: 'FD maturity', topic: 'Investing / TVM' },
  { id: 'marginal-absorption', label: 'Marginal vs absorption', topic: 'Costing' },
]

/** Deterministic: the same (templateId, seed) always yields the same problem. */
export function generateProblem(templateId: string, seed: number): LabProblem {
  const make = makers[templateId] ?? makers['break-even']
  return make(mulberry32(seed))
}

/** Today's Daily Challenge — same for every student (local date, like QotD). */
export function dailyChallenge(): { templateId: string; seed: number } {
  const day = todayKey()
  const h = hashSeed(`accrualsense-lab:${day}`)
  return { templateId: labTemplates[h % labTemplates.length].id, seed: h }
}

/** Grade one answer with its tolerance. */
export function isCorrect(a: LabAnswer, userValue: number): boolean {
  return Number.isFinite(userValue) && Math.abs(userValue - a.value) <= a.tol
}
