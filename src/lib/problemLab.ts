import { round } from './format'
import type { Step } from '../calculators/types'
import { computeFd } from './savings'
import { computeMarginalAbsorption } from './marginalAbsorption'
import { computeCostSheet } from './costSheet'
import { computeEbq } from './jobBatch'
import { computeContract } from './contract'
import { computeProcess } from './process'
import { computeOperating } from './operating'
import { computeMaterialVariance, computeLabourVariance } from './variance'
import { computeCashBudget } from './cashBudget'
import { computeFlexibleBudget } from './flexibleBudget'
import { computeFundFlow } from './fundFlow'
import { computeCashFlow } from './cashFlow'
import { computeWages } from './wages'
import { computeStockLevels } from './materialControl'
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

function tplRatios(rng: () => number): LabProblem {
  const cl = pick(rng, [100000, 150000, 200000] as const)
  const currentRatio = pick(rng, [1.8, 2, 2.5] as const)
  const quickRatio = pick(rng, [1, 1.2, 1.5] as const)
  const ca = currentRatio * cl
  const quickAssets = quickRatio * cl
  const inventory = ca - quickAssets // > 0 since currentRatio > quickRatio
  const revenue = pick(rng, [800000, 1000000, 1200000] as const)
  const gpPct = pick(rng, [25, 30, 40] as const)
  const npPct = pick(rng, [8, 10, 12] as const)
  const grossProfit = (revenue * gpPct) / 100
  const cogs = revenue - grossProfit
  const netProfit = (revenue * npPct) / 100
  const equity = pick(rng, [400000, 500000, 600000] as const)
  const de = pick(rng, [0.5, 0.75, 1] as const)
  const debt = de * equity

  return {
    templateId: 'ratios',
    topic: 'Financial statement analysis',
    title: 'Ratio Analysis',
    scenario: `From the accounts of a company: sales ${inr(revenue)}, cost of goods sold ${inr(cogs)}, net profit ${inr(netProfit)}; current assets ${inr(ca)} (of which inventory ${inr(inventory)}), current liabilities ${inr(cl)}; shareholders' equity ${inr(equity)} and long-term debt ${inr(debt)}. Compute the current ratio, the quick ratio, the gross profit ratio, the net profit ratio and the debt-equity ratio.`,
    given: [
      { label: 'Sales', value: inr(revenue) },
      { label: 'Cost of goods sold', value: inr(cogs) },
      { label: 'Net profit', value: inr(netProfit) },
      { label: 'Current assets (incl. inventory)', value: `${inr(ca)} (inv. ${inr(inventory)})` },
      { label: 'Current liabilities', value: inr(cl) },
      { label: 'Equity / Long-term debt', value: `${inr(equity)} / ${inr(debt)}` },
    ],
    answers: [
      { key: 'current', label: 'Current ratio', value: currentRatio, unit: ': 1', tol: 0.02 },
      { key: 'quick', label: 'Quick ratio', value: quickRatio, unit: ': 1', tol: 0.02 },
      { key: 'gp', label: 'Gross profit ratio', value: gpPct, unit: '%', tol: 0.06 },
      { key: 'np', label: 'Net profit ratio', value: npPct, unit: '%', tol: 0.06 },
      { key: 'de', label: 'Debt-equity ratio', value: de, unit: ': 1', tol: 0.02 },
    ],
    steps: [
      { label: 'Current ratio', formula: `Current assets ÷ Current liabilities = ${inr(ca)} ÷ ${inr(cl)}`, result: `${num(currentRatio)} : 1` },
      { label: 'Quick ratio', formula: `(Current assets − Inventory) ÷ CL = ${inr(quickAssets)} ÷ ${inr(cl)}`, result: `${num(quickRatio)} : 1`, note: 'Quick assets exclude inventory — the least liquid current asset.' },
      { label: 'Gross profit ratio', formula: `Gross profit ÷ Sales × 100 = ${inr(grossProfit)} ÷ ${inr(revenue)} × 100`, result: `${num(gpPct)}%` },
      { label: 'Net profit ratio', formula: `Net profit ÷ Sales × 100 = ${inr(netProfit)} ÷ ${inr(revenue)} × 100`, result: `${num(npPct)}%` },
      { label: 'Debt-equity ratio', formula: `Long-term debt ÷ Equity = ${inr(debt)} ÷ ${inr(equity)}`, result: `${num(de)} : 1`, note: 'A lower ratio means the firm leans less on borrowed funds.' },
    ],
    calc: 'ratio-analysis',
  }
}

function tplCostSheet(rng: () => number): LabProblem {
  const openingRM = pick(rng, [10000, 20000] as const)
  const purchases = pick(rng, [100000, 150000, 200000] as const)
  const closingRM = pick(rng, [10000, 15000] as const)
  const directWages = pick(rng, [50000, 80000] as const)
  const directExpenses = pick(rng, [10000, 20000] as const)
  const factoryOh = pick(rng, [30000, 40000] as const)
  const adminOh = pick(rng, [20000, 25000] as const)
  const sellingOh = pick(rng, [15000, 20000] as const)
  const units = pick(rng, [1000, 2000, 5000] as const)
  const sales = pick(rng, [400000, 500000, 600000] as const)

  const res = computeCostSheet({
    openingRM,
    purchases,
    carriageInward: 0,
    purchaseReturns: 0,
    closingRM,
    directWages,
    directExpenses,
    openingWIP: 0,
    closingWIP: 0,
    openingFG: 0,
    closingFG: 0,
    sales,
    unitsProduced: units,
    factoryOverheads: [{ label: 'Factory overheads', amount: factoryOh }],
    adminOverheads: [{ label: 'Office & admin overheads', amount: adminOh }],
    sellingOverheads: [{ label: 'Selling & distribution overheads', amount: sellingOh }],
  })

  return {
    templateId: 'cost-sheet',
    topic: 'Cost accounting',
    title: 'Cost Sheet (Unit Costing)',
    scenario: `A manufacturer's records show: opening raw material ${inr(openingRM)}, purchases ${inr(purchases)}, closing raw material ${inr(closingRM)}; direct wages ${inr(directWages)}, direct expenses ${inr(directExpenses)}; factory overheads ${inr(factoryOh)}, office & administration overheads ${inr(adminOh)}, selling & distribution overheads ${inr(sellingOh)}. Sales were ${inr(sales)}. Prepare the cost sheet and find the prime cost, works (factory) cost, cost of production, cost of sales and profit.`,
    given: [
      { label: 'Raw material (op. / purchases / cl.)', value: `${inr(openingRM)} / ${inr(purchases)} / ${inr(closingRM)}` },
      { label: 'Direct wages / expenses', value: `${inr(directWages)} / ${inr(directExpenses)}` },
      { label: 'Factory overheads', value: inr(factoryOh) },
      { label: 'Admin overheads', value: inr(adminOh) },
      { label: 'Selling overheads', value: inr(sellingOh) },
      { label: 'Sales', value: inr(sales) },
    ],
    answers: [
      { key: 'prime', label: 'Prime cost', value: res.primeCost, unit: '₹', tol: tolFor(res.primeCost) },
      { key: 'works', label: 'Works (factory) cost', value: res.worksCost, unit: '₹', tol: tolFor(res.worksCost) },
      { key: 'cop', label: 'Cost of production', value: res.costOfProduction, unit: '₹', tol: tolFor(res.costOfProduction) },
      { key: 'cos', label: 'Cost of sales', value: res.costOfSales, unit: '₹', tol: tolFor(res.costOfSales) },
      { key: 'profit', label: 'Profit', value: res.profit, unit: '₹', tol: tolFor(res.profit) },
    ],
    steps: res.steps,
    calc: 'cost-sheet',
  }
}

function tplEbq(rng: () => number): LabProblem {
  const Q = pick(rng, [500, 1000, 1500, 2000] as const) // clean EBQ
  const N = pick(rng, [4, 5, 6] as const) // batches per year
  const C = pick(rng, [1, 2] as const) // carrying cost per unit per year
  const annualUnits = N * Q
  const setupCost = (C * Q) / (2 * N) // integer by construction

  const res = computeEbq({ annualUnits, setupCost, carryingPerUnit: C })

  return {
    templateId: 'ebq',
    topic: 'Job & batch costing',
    title: 'Economic Batch Quantity',
    scenario: `A component is produced in batches. Annual demand is ${num(annualUnits)} units, the set-up cost per batch is ${inr(setupCost)}, and it costs ${inr(C)} to carry one unit in stock for a year. Find the economic batch quantity, the number of batches per year, and the total set-up plus carrying cost at the EBQ.`,
    given: [
      { label: 'Annual demand', value: `${num(annualUnits)} units` },
      { label: 'Set-up cost per batch', value: inr(setupCost) },
      { label: 'Carrying cost per unit per year', value: inr(C) },
    ],
    answers: [
      { key: 'ebq', label: 'Economic batch quantity', value: res.ebq, unit: 'units', tol: 0.51 },
      { key: 'batches', label: 'Batches per year', value: res.batchesPerYear, unit: 'batches', tol: 0.05 },
      { key: 'total', label: 'Total set-up + carrying cost', value: res.totalCost, unit: '₹', tol: tolFor(res.totalCost) },
    ],
    steps: res.steps,
    calc: 'job-batch-costing',
  }
}

function tplContract(rng: () => number): LabProblem {
  const m = pick(rng, [1, 2, 3] as const)
  const contractPrice = 1000000 * m
  const workCertified = 600000 * m // stage 0.6
  const workUncertified = 40000 * m
  const cashReceived = 480000 * m // 80% of work certified
  const materials = 200000 * m
  const labour = 150000 * m
  const expenses = 30000 * m
  const overheads = 20000 * m
  const plantIssued = 100000 * m
  const materialsReturned = 10000 * m
  const materialsAtSite = 20000 * m
  const plantAtSite = 80000 * m

  const res = computeContract({
    contractPrice,
    materials,
    labour,
    plantIssued,
    expenses,
    overheads,
    materialsReturned,
    materialsAtSite,
    plantAtSite,
    workUncertified,
    workCertified,
    cashReceived,
  })

  return {
    templateId: 'contract',
    topic: 'Contract costing',
    title: 'Contract Account — Notional Profit',
    scenario: `A contract for ${inr(contractPrice)} is in progress. To date: materials ${inr(materials)}, labour ${inr(labour)}, direct expenses ${inr(expenses)}, overheads ${inr(overheads)}, plant issued ${inr(plantIssued)}. Materials returned to store ${inr(materialsReturned)}; materials at site (closing) ${inr(materialsAtSite)}; plant at site (closing) ${inr(plantAtSite)}. Work certified ${inr(workCertified)} (${num((workCertified / contractPrice) * 100)}% of the contract) and work uncertified ${inr(workUncertified)}; cash received ${inr(cashReceived)}. Find the notional profit, the profit to be transferred to the P&L account, and the profit kept in reserve.`,
    given: [
      { label: 'Contract price', value: inr(contractPrice) },
      { label: 'Costs (materials/labour/exp./OH/plant)', value: `${inr(materials)} / ${inr(labour)} / ${inr(expenses)} / ${inr(overheads)} / ${inr(plantIssued)}` },
      { label: 'Closing materials / plant at site', value: `${inr(materialsAtSite)} / ${inr(plantAtSite)}` },
      { label: 'Work certified / uncertified', value: `${inr(workCertified)} / ${inr(workUncertified)}` },
      { label: 'Cash received', value: inr(cashReceived) },
    ],
    answers: [
      { key: 'np', label: 'Notional profit', value: res.notionalProfit, unit: '₹', tol: tolFor(res.notionalProfit) },
      { key: 'transfer', label: 'Profit transferred to P&L', value: res.transfer, unit: '₹', tol: tolFor(res.transfer) },
      { key: 'reserve', label: 'Profit in reserve', value: res.reserve, unit: '₹', tol: tolFor(res.reserve) },
    ],
    steps: res.steps,
    calc: 'contract-costing',
  }
}

function tplProcess(rng: () => number): LabProblem {
  const inputUnits = 10000
  const added = 1000
  const labour = 5000
  const overheads = 1050
  const cpu = pick(rng, [1.5, 2, 2.5] as const)
  const lossPct = pick(rng, [2, 3, 5] as const)
  const scrapPerUnit = pick(rng, [0.25, 0.5] as const)
  const abnLoss = pick(rng, [100, 200, 300] as const)

  const normalLossUnits = (inputUnits * lossPct) / 100
  const expectedOutput = inputUnits - normalLossUnits
  const scrapValue = normalLossUnits * scrapPerUnit
  const totalCost = cpu * expectedOutput + scrapValue
  const inputCost = totalCost - (added + labour + overheads)
  const actualOutput = expectedOutput - abnLoss

  const res = computeProcess({
    inputUnits,
    inputCost,
    addedMaterial: added,
    labour,
    overheads,
    normalLossPct: lossPct,
    scrapPerUnit,
    actualOutput,
  })

  return {
    templateId: 'process',
    topic: 'Process costing',
    title: 'Process Costing — Normal & Abnormal Loss',
    scenario: `${num(inputUnits)} units are introduced into a process costing ${inr(inputCost)}. Added in the process: materials ${inr(added)}, labour ${inr(labour)}, overheads ${inr(overheads)}. Normal loss is ${num(lossPct)}% of input with a scrap value of ${inr(scrapPerUnit)} per unit. Actual output is ${num(actualOutput)} units. Find the cost per unit of good output, the abnormal loss in units, and the value of the abnormal loss.`,
    given: [
      { label: 'Units introduced', value: `${num(inputUnits)} units` },
      { label: 'Cost of input', value: inr(inputCost) },
      { label: 'Added materials / labour / overheads', value: `${inr(added)} / ${inr(labour)} / ${inr(overheads)}` },
      { label: 'Normal loss', value: `${num(lossPct)}% of input, scrap ${inr(scrapPerUnit)}/unit` },
      { label: 'Actual output', value: `${num(actualOutput)} units` },
    ],
    answers: [
      { key: 'cpu', label: 'Cost per unit of good output', value: res.costPerUnit, unit: '₹', tol: 0.02 },
      { key: 'abnUnits', label: 'Abnormal loss', value: res.abnormalLossUnits, unit: 'units', tol: 0.51 },
      { key: 'abnValue', label: 'Value of abnormal loss', value: res.abnormalLossValue, unit: '₹', tol: tolFor(res.abnormalLossValue) },
    ],
    steps: res.steps,
    calc: 'process-costing',
  }
}

function tplOperating(rng: () => number): LabProblem {
  const standing = pick(rng, [20000, 30000] as const)
  const running = pick(rng, [15000, 20000] as const)
  const maintenance = pick(rng, [5000, 10000] as const)
  const distanceKm = pick(rng, [10000, 20000] as const)
  const load = pick(rng, [10, 20] as const) // tonnes
  const profitPct = pick(rng, [20, 25] as const)

  const res = computeOperating({
    standingCharges: standing,
    runningCharges: running,
    maintenanceCharges: maintenance,
    distanceKm,
    averageLoad: load,
    profitPct,
    compositeUnit: 'tonneKm',
  })

  return {
    templateId: 'operating',
    topic: 'Operating / service costing',
    title: 'Transport Costing — Cost per Tonne-km',
    scenario: `A transport operator's monthly costs are: standing charges ${inr(standing)}, running charges ${inr(running)}, maintenance ${inr(maintenance)}. The lorry ran ${num(distanceKm)} km carrying an average load of ${num(load)} tonnes. Find the total operating cost, the cost per km, the cost per tonne-km, and the rate to charge per tonne-km to earn ${num(profitPct)}% profit on cost.`,
    given: [
      { label: 'Standing / running / maintenance', value: `${inr(standing)} / ${inr(running)} / ${inr(maintenance)}` },
      { label: 'Distance run', value: `${num(distanceKm)} km` },
      { label: 'Average load', value: `${num(load)} tonnes` },
      { label: 'Profit', value: `${num(profitPct)}% on cost` },
    ],
    answers: [
      { key: 'total', label: 'Total operating cost', value: res.totalCost, unit: '₹', tol: tolFor(res.totalCost) },
      { key: 'perKm', label: 'Cost per km', value: res.costPerKm, unit: '₹', tol: 0.02 },
      { key: 'perTk', label: 'Cost per tonne-km', value: res.costPerComposite, unit: '₹', tol: 0.005 },
      { key: 'rate', label: 'Rate per tonne-km', value: res.ratePerComposite, unit: '₹', tol: 0.005 },
    ],
    steps: res.steps,
    calc: 'operating-costing',
  }
}

function tplVariance(rng: () => number): LabProblem {
  const sp = pick(rng, [10, 20] as const)
  const sq = pick(rng, [1000, 2000] as const)
  const ap = sp + pick(rng, [-2, -1, 1, 2] as const)
  const aq = sq + pick(rng, [-100, 100, 200] as const)
  const sr = pick(rng, [40, 50] as const)
  const sh = pick(rng, [500, 800] as const)
  const ar = sr + pick(rng, [-5, 5] as const)
  const ah = sh + pick(rng, [-50, 50] as const)

  const mat = computeMaterialVariance({ sq, sp, aq, ap })
  const lab = computeLabourVariance({ sh, sr, ah, ar })

  return {
    templateId: 'variance',
    topic: 'Standard costing',
    title: 'Material & Labour Cost Variances',
    scenario: `Standard: ${num(sq)} kg of material at ${inr(sp)}/kg and ${num(sh)} labour hours at ${inr(sr)}/hour for the actual output. Actual: ${num(aq)} kg at ${inr(ap)}/kg and ${num(ah)} hours at ${inr(ar)}/hour. Compute the material price variance, the material usage variance, the labour rate variance and the labour efficiency variance (give the amount in ₹; the working shows Favourable / Adverse).`,
    given: [
      { label: 'Material — std', value: `${num(sq)} kg @ ${inr(sp)}` },
      { label: 'Material — actual', value: `${num(aq)} kg @ ${inr(ap)}` },
      { label: 'Labour — std', value: `${num(sh)} hrs @ ${inr(sr)}` },
      { label: 'Labour — actual', value: `${num(ah)} hrs @ ${inr(ar)}` },
    ],
    answers: [
      { key: 'mpv', label: 'Material price variance (amount)', value: mat.priceVariance.amount, unit: '₹', tol: tolFor(mat.priceVariance.amount) },
      { key: 'muv', label: 'Material usage variance (amount)', value: mat.usageVariance.amount, unit: '₹', tol: tolFor(mat.usageVariance.amount) },
      { key: 'lrv', label: 'Labour rate variance (amount)', value: lab.rateVariance.amount, unit: '₹', tol: tolFor(lab.rateVariance.amount) },
      { key: 'lev', label: 'Labour efficiency variance (amount)', value: lab.efficiencyVariance.amount, unit: '₹', tol: tolFor(lab.efficiencyVariance.amount) },
    ],
    steps: [...mat.steps, ...lab.steps],
    calc: 'standard-costing-variances',
  }
}

function tplCashBudget(rng: () => number): LabProblem {
  const opening = pick(rng, [50000, 100000] as const)
  const s = pick(rng, [1, 2] as const)
  const cashSales = [80000 * s, 90000 * s, 100000 * s]
  const collections = [120000 * s, 130000 * s, 110000 * s]
  const purchases = [100000 * s, 110000 * s, 120000 * s]
  const wages = [40000 * s, 45000 * s, 50000 * s]

  const res = computeCashBudget({
    months: ['April', 'May', 'June'],
    openingBalance: opening,
    receipts: [
      { label: 'Cash sales', values: cashSales },
      { label: 'Collections from debtors', values: collections },
    ],
    payments: [
      { label: 'Purchases', values: purchases },
      { label: 'Wages & expenses', values: wages },
    ],
  })

  return {
    templateId: 'cash-budget',
    topic: 'Budgetary control',
    title: 'Cash Budget (three months)',
    scenario: `Opening cash is ${inr(opening)} on 1 April. Receipts — cash sales: ${cashSales.map(inr).join(', ')}; collections from debtors: ${collections.map(inr).join(', ')}. Payments — purchases: ${purchases.map(inr).join(', ')}; wages & expenses: ${wages.map(inr).join(', ')} (April, May, June). Prepare the cash budget and find the closing cash balance for each month and the lowest closing balance in the quarter.`,
    given: [
      { label: 'Opening balance (1 April)', value: inr(opening) },
      { label: 'Cash sales (Apr/May/Jun)', value: cashSales.map(inr).join(' · ') },
      { label: 'Collections (Apr/May/Jun)', value: collections.map(inr).join(' · ') },
      { label: 'Purchases (Apr/May/Jun)', value: purchases.map(inr).join(' · ') },
      { label: 'Wages & expenses (Apr/May/Jun)', value: wages.map(inr).join(' · ') },
    ],
    answers: [
      { key: 'apr', label: 'Closing balance — April', value: res.columns[0].closing, unit: '₹', tol: tolFor(res.columns[0].closing) },
      { key: 'may', label: 'Closing balance — May', value: res.columns[1].closing, unit: '₹', tol: tolFor(res.columns[1].closing) },
      { key: 'jun', label: 'Closing balance — June', value: res.columns[2].closing, unit: '₹', tol: tolFor(res.columns[2].closing) },
      { key: 'min', label: 'Lowest closing balance', value: res.minClosing, unit: '₹', tol: tolFor(res.minClosing) },
    ],
    steps: res.steps,
    calc: 'cash-budget',
  }
}

function tplFlexibleBudget(rng: () => number): LabProblem {
  const lowUnits = pick(rng, [1000, 2000] as const)
  const highUnits = lowUnits + pick(rng, [2000, 3000] as const)
  const varPerUnit = pick(rng, [5, 10] as const)
  const fixedCost = pick(rng, [20000, 50000] as const)
  const targetUnits = (lowUnits + highUnits) / 2
  const lowCost = fixedCost + varPerUnit * lowUnits
  const highCost = fixedCost + varPerUnit * highUnits

  const res = computeFlexibleBudget({ highUnits, highCost, lowUnits, lowCost, targetUnits })

  return {
    templateId: 'flexible-budget',
    topic: 'Budgetary control',
    title: 'Flexible Budget — High-Low Method',
    scenario: `At ${num(lowUnits)} units total cost was ${inr(lowCost)}, and at ${num(highUnits)} units it was ${inr(highCost)}. Using the high-low method, split the cost into its variable-per-unit and fixed parts, then find the budgeted total cost at ${num(targetUnits)} units.`,
    given: [
      { label: 'Low activity', value: `${num(lowUnits)} units → ${inr(lowCost)}` },
      { label: 'High activity', value: `${num(highUnits)} units → ${inr(highCost)}` },
      { label: 'Budget for', value: `${num(targetUnits)} units` },
    ],
    answers: [
      { key: 'var', label: 'Variable cost per unit', value: res.variablePerUnit, unit: '₹', tol: 0.02 },
      { key: 'fixed', label: 'Fixed cost', value: res.fixedCost, unit: '₹', tol: tolFor(res.fixedCost) },
      { key: 'target', label: `Budgeted total cost at ${num(targetUnits)} units`, value: res.target.total, unit: '₹', tol: tolFor(res.target.total) },
    ],
    steps: res.steps,
    calc: 'flexible-budget',
  }
}

function tplFundFlow(rng: () => number): LabProblem {
  const netProfit = pick(rng, [100000, 150000] as const)
  const depreciation = pick(rng, [30000, 40000] as const)
  const goodwill = 10000
  const profitOnSale = pick(rng, [5000, 10000] as const)
  const shareIssue = pick(rng, [100000, 200000] as const)
  const saleOfMachine = 50000
  const purchaseOfMachine = pick(rng, [150000, 200000] as const)
  const dividend = pick(rng, [40000, 50000] as const)

  const res = computeFundFlow({
    netProfit,
    addBacks: [
      { label: 'Depreciation', amount: depreciation },
      { label: 'Goodwill written off', amount: goodwill },
    ],
    deductions: [{ label: 'Profit on sale of investment', amount: profitOnSale }],
    otherSources: [
      { label: 'Issue of shares', amount: shareIssue },
      { label: 'Sale of machinery', amount: saleOfMachine },
    ],
    applications: [
      { label: 'Purchase of machinery', amount: purchaseOfMachine },
      { label: 'Dividend paid', amount: dividend },
    ],
    workingCapital: [
      { label: 'Debtors', kind: 'asset', opening: 80000, closing: 100000 },
      { label: 'Creditors', kind: 'liability', opening: 60000, closing: 50000 },
    ],
  })

  return {
    templateId: 'fund-flow',
    topic: 'Financial statement analysis',
    title: 'Fund Flow — Sources & Applications',
    scenario: `A company reports net profit ${inr(netProfit)} for the year, after charging depreciation ${inr(depreciation)} and goodwill written off ${inr(goodwill)}, and after crediting profit on sale of investment ${inr(profitOnSale)}. During the year it issued shares for ${inr(shareIssue)} and sold machinery for ${inr(saleOfMachine)}; it purchased machinery for ${inr(purchaseOfMachine)} and paid a dividend of ${inr(dividend)}. Find the funds from operations, the total sources of funds and the total applications of funds.`,
    given: [
      { label: 'Net profit', value: inr(netProfit) },
      { label: 'Add back: depreciation / goodwill', value: `${inr(depreciation)} / ${inr(goodwill)}` },
      { label: 'Less: profit on sale of investment', value: inr(profitOnSale) },
      { label: 'Other sources: shares / machinery sale', value: `${inr(shareIssue)} / ${inr(saleOfMachine)}` },
      { label: 'Applications: machinery / dividend', value: `${inr(purchaseOfMachine)} / ${inr(dividend)}` },
    ],
    answers: [
      { key: 'ffo', label: 'Funds from operations', value: res.ffo, unit: '₹', tol: tolFor(res.ffo) },
      { key: 'sources', label: 'Total sources of funds', value: res.totalSources, unit: '₹', tol: tolFor(res.totalSources) },
      { key: 'apps', label: 'Total applications of funds', value: res.totalApplications, unit: '₹', tol: tolFor(res.totalApplications) },
    ],
    steps: res.steps,
    calc: 'fund-flow',
  }
}

function tplCashFlow(rng: () => number): LabProblem {
  const npbt = pick(rng, [200000, 300000] as const)
  const depreciation = pick(rng, [40000, 50000] as const)
  const profitOnSale = pick(rng, [10000, 15000] as const)
  const taxPaid = pick(rng, [40000, 50000] as const)
  const purchaseMachine = pick(rng, [150000, 200000] as const)
  const saleAsset = pick(rng, [50000, 60000] as const)
  const shareIssue = pick(rng, [150000, 200000] as const)
  const dividend = pick(rng, [30000, 40000] as const)
  const openingCash = pick(rng, [50000, 100000] as const)

  const res = computeCashFlow({
    netProfitBeforeTax: npbt,
    addBacks: [{ label: 'Depreciation', amount: depreciation }],
    deductions: [{ label: 'Profit on sale of asset', amount: profitOnSale }],
    workingCapital: [
      { label: 'Debtors', kind: 'asset', opening: 90000, closing: 110000 },
      { label: 'Creditors', kind: 'liability', opening: 70000, closing: 80000 },
    ],
    taxPaid,
    investing: [
      { label: 'Purchase of machinery', amount: purchaseMachine, direction: 'out' },
      { label: 'Sale of asset', amount: saleAsset, direction: 'in' },
    ],
    financing: [
      { label: 'Issue of shares', amount: shareIssue, direction: 'in' },
      { label: 'Dividend paid', amount: dividend, direction: 'out' },
    ],
    openingCash,
  })

  return {
    templateId: 'cash-flow',
    topic: 'Financial statement analysis',
    title: 'Cash Flow Statement (AS 3, indirect method)',
    scenario: `Net profit before tax is ${inr(npbt)}, after charging depreciation ${inr(depreciation)} and crediting profit on sale of asset ${inr(profitOnSale)}. Debtors rose from ₹90,000 to ₹1,10,000; creditors rose from ₹70,000 to ₹80,000. Tax paid ${inr(taxPaid)}. The firm bought machinery for ${inr(purchaseMachine)}, sold an asset for ${inr(saleAsset)}, issued shares for ${inr(shareIssue)} and paid a dividend of ${inr(dividend)}. Opening cash was ${inr(openingCash)}. Find the cash flow from operating, investing and financing activities, and the closing cash balance.`,
    given: [
      { label: 'Net profit before tax', value: inr(npbt) },
      { label: 'Depreciation / profit on sale', value: `${inr(depreciation)} / ${inr(profitOnSale)}` },
      { label: 'Debtors / creditors change', value: '90,000→1,10,000 / 70,000→80,000' },
      { label: 'Tax paid', value: inr(taxPaid) },
      { label: 'Investing: buy / sell', value: `${inr(purchaseMachine)} / ${inr(saleAsset)}` },
      { label: 'Financing: shares / dividend', value: `${inr(shareIssue)} / ${inr(dividend)}` },
      { label: 'Opening cash', value: inr(openingCash) },
    ],
    answers: [
      { key: 'op', label: 'Cash flow from operating activities', value: res.operatingCF, unit: '₹', tol: tolFor(res.operatingCF) },
      { key: 'inv', label: 'Cash flow from investing activities', value: res.investingCF, unit: '₹', tol: tolFor(res.investingCF) },
      { key: 'fin', label: 'Cash flow from financing activities', value: res.financingCF, unit: '₹', tol: tolFor(res.financingCF) },
      { key: 'close', label: 'Closing cash balance', value: res.closingCash, unit: '₹', tol: tolFor(res.closingCash) },
    ],
    steps: res.steps,
    calc: 'cash-flow',
  }
}

function tplHalseyRowan(rng: () => number): LabProblem {
  const standardTime = pick(rng, [40, 50, 60] as const)
  const saved = pick(rng, [8, 10, 20] as const)
  const actualTime = standardTime - saved
  const rate = pick(rng, [20, 30, 40] as const)

  const res = computeWages({ standardTime, actualTime, rate, units: 0 })
  const halsey = res.plans.find((p) => p.key === 'halsey')!
  const rowan = res.plans.find((p) => p.key === 'rowan')!

  return {
    templateId: 'halsey-rowan',
    topic: 'Labour costing',
    title: 'Incentive Wages — Halsey & Rowan',
    scenario: `A job has a standard time of ${num(standardTime)} hours. A worker paid ${inr(rate)} per hour finishes it in ${num(actualTime)} hours. Find the basic time wages, the total earnings under the Halsey plan (50% of time saved), and the total earnings under the Rowan plan.`,
    given: [
      { label: 'Standard time', value: `${num(standardTime)} hours` },
      { label: 'Actual time taken', value: `${num(actualTime)} hours` },
      { label: 'Rate per hour', value: inr(rate) },
    ],
    answers: [
      { key: 'time', label: 'Basic time wages', value: res.timeWages, unit: '₹', tol: 0.51 },
      { key: 'halsey', label: 'Total earnings — Halsey', value: halsey.earnings, unit: '₹', tol: tolFor(halsey.earnings) },
      { key: 'rowan', label: 'Total earnings — Rowan', value: rowan.earnings, unit: '₹', tol: tolFor(rowan.earnings) },
    ],
    steps: res.steps,
    calc: 'wage-systems',
  }
}

function tplStockLevels(rng: () => number): LabProblem {
  const minUsage = pick(rng, [100, 200] as const)
  const maxUsage = minUsage + pick(rng, [100, 200] as const)
  const normalUsage = (minUsage + maxUsage) / 2
  const minLeadTime = pick(rng, [4, 6] as const)
  const maxLeadTime = minLeadTime + pick(rng, [2, 4] as const)
  const reorderQty = pick(rng, [1000, 1500, 2000] as const)

  const res = computeStockLevels({
    minUsage,
    maxUsage,
    normalUsage,
    minLeadTime,
    maxLeadTime,
    reorderQty,
    emergencyLeadTime: 0,
  })

  return {
    templateId: 'stock-levels',
    topic: 'Material control',
    title: 'Stock Levels — Re-order, Minimum & Maximum',
    scenario: `For a raw material: usage is ${num(minUsage)}–${num(maxUsage)} units per week (normal ${num(normalUsage)}), the lead time is ${num(minLeadTime)}–${num(maxLeadTime)} weeks, and the re-order quantity is ${num(reorderQty)} units. Compute the re-order level, the minimum stock level and the maximum stock level.`,
    given: [
      { label: 'Usage per week (min / normal / max)', value: `${num(minUsage)} / ${num(normalUsage)} / ${num(maxUsage)} units` },
      { label: 'Lead time (min / max)', value: `${num(minLeadTime)} / ${num(maxLeadTime)} weeks` },
      { label: 'Re-order quantity', value: `${num(reorderQty)} units` },
    ],
    answers: [
      { key: 'rol', label: 'Re-order level', value: res.reorderLevel, unit: 'units', tol: 0.51 },
      { key: 'min', label: 'Minimum stock level', value: res.minimumLevel, unit: 'units', tol: 0.51 },
      { key: 'max', label: 'Maximum stock level', value: res.maximumLevel, unit: 'units', tol: 0.51 },
    ],
    steps: res.steps,
    calc: 'eoq-stock-levels',
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
  ratios: tplRatios,
  'cost-sheet': tplCostSheet,
  ebq: tplEbq,
  contract: tplContract,
  process: tplProcess,
  operating: tplOperating,
  variance: tplVariance,
  'cash-budget': tplCashBudget,
  'flexible-budget': tplFlexibleBudget,
  'fund-flow': tplFundFlow,
  'cash-flow': tplCashFlow,
  'halsey-rowan': tplHalseyRowan,
  'stock-levels': tplStockLevels,
}

export const labTemplates: LabTemplate[] = [
  // Cost accounting
  { id: 'cost-sheet', label: 'Cost sheet', topic: 'Cost accounting' },
  { id: 'eoq', label: 'EOQ', topic: 'Material control' },
  { id: 'stock-levels', label: 'Stock levels', topic: 'Material control' },
  { id: 'labour-turnover', label: 'Labour turnover', topic: 'Labour costing' },
  { id: 'halsey-rowan', label: 'Halsey & Rowan', topic: 'Labour costing' },
  { id: 'overhead', label: 'Overhead absorption', topic: 'Overheads' },
  { id: 'ebq', label: 'EBQ (batch costing)', topic: 'Job & batch costing' },
  { id: 'contract', label: 'Contract costing', topic: 'Contract costing' },
  { id: 'process', label: 'Process costing', topic: 'Process costing' },
  { id: 'operating', label: 'Operating costing', topic: 'Operating / service costing' },
  { id: 'variance', label: 'Standard costing variances', topic: 'Standard costing' },
  // Marginal costing
  { id: 'break-even', label: 'Break-even / CVP', topic: 'Marginal costing' },
  { id: 'marginal-absorption', label: 'Marginal vs absorption', topic: 'Costing' },
  // Financial statement analysis & budgetary control
  { id: 'ratios', label: 'Ratio analysis', topic: 'Financial statement analysis' },
  { id: 'fund-flow', label: 'Fund flow', topic: 'Financial statement analysis' },
  { id: 'cash-flow', label: 'Cash flow (AS 3)', topic: 'Financial statement analysis' },
  { id: 'cash-budget', label: 'Cash budget', topic: 'Budgetary control' },
  { id: 'flexible-budget', label: 'Flexible budget', topic: 'Budgetary control' },
  // Accounting / finance
  { id: 'wdv', label: 'Depreciation (WDV)', topic: 'Depreciation' },
  { id: 'fd', label: 'FD maturity', topic: 'Investing / TVM' },
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
