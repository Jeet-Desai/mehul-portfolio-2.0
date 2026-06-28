/* Job & Batch costing — a job cost card (build-up of cost + profit → price) and
   the Economic Batch Quantity (EBQ). Pure & React-free.

   Grounded in M.N. Arora, *Cost Accounting* (Unit 8 Job Costing, Unit 12 Batch
   Costing — §12.2.1 Economic Batch Quantity). EBQ is the batch analogue of EOQ. */
import type { Step } from '../calculators/types'
import { formatINR, formatNum } from './format'

/* ----------------------------------------------------------- Job cost card - */

export type JobInputs = {
  directMaterial: number
  directLabour: number
  directExpenses: number
  /** factory/works overhead as a % of direct wages */
  factoryOhPct: number
  /** administration overhead as a % of works cost */
  adminOhPct: number
  /** profit as a % of total cost (cost-plus pricing) */
  profitPct: number
}

export type JobResult = {
  primeCost: number
  factoryOh: number
  worksCost: number
  adminOh: number
  totalCost: number
  profit: number
  price: number
  steps: Step[]
}

export function computeJob(inp: JobInputs): JobResult {
  const primeCost = inp.directMaterial + inp.directLabour + inp.directExpenses
  const factoryOh = (inp.factoryOhPct / 100) * inp.directLabour
  const worksCost = primeCost + factoryOh
  const adminOh = (inp.adminOhPct / 100) * worksCost
  const totalCost = worksCost + adminOh
  const profit = (inp.profitPct / 100) * totalCost
  const price = totalCost + profit

  const steps: Step[] = [
    {
      label: 'Prime cost = direct material + direct wages + direct expenses',
      formula: `${formatINR(inp.directMaterial)} + ${formatINR(inp.directLabour)} + ${formatINR(inp.directExpenses)}`,
      result: formatINR(primeCost),
    },
    {
      label: `Works cost = prime cost + factory overhead (${formatNum(inp.factoryOhPct)}% of wages)`,
      formula: `${formatINR(primeCost)} + ${formatINR(factoryOh)}`,
      result: formatINR(worksCost),
    },
    {
      label: `Total cost = works cost + administration overhead (${formatNum(inp.adminOhPct)}% of works cost)`,
      formula: `${formatINR(worksCost)} + ${formatINR(adminOh)}`,
      result: formatINR(totalCost),
    },
    {
      label: `Selling price = total cost + profit (${formatNum(inp.profitPct)}% of cost)`,
      formula: `${formatINR(totalCost)} + ${formatINR(profit)}`,
      result: formatINR(price),
      note: 'This is cost-plus pricing — profit is a mark-up on total cost.',
    },
  ]

  return { primeCost, factoryOh, worksCost, adminOh, totalCost, profit, price, steps }
}

/* ------------------------------------------------ Economic Batch Quantity -- */

export type EbqInputs = {
  /** annual demand / units to be produced in a year (U) */
  annualUnits: number
  /** set-up cost per batch / production run (S) */
  setupCost: number
  /** carrying cost per unit per annum (C) */
  carryingPerUnit: number
}

export type EbqResult = {
  ebq: number
  batchesPerYear: number
  setupCostTotal: number
  carryingCostTotal: number
  totalCost: number
  steps: Step[]
}

export function computeEbq(inp: EbqInputs): EbqResult {
  const ebq =
    inp.annualUnits > 0 && inp.setupCost > 0 && inp.carryingPerUnit > 0
      ? Math.sqrt((2 * inp.annualUnits * inp.setupCost) / inp.carryingPerUnit)
      : 0
  const batchesPerYear = ebq > 0 ? inp.annualUnits / ebq : 0
  const setupCostTotal = batchesPerYear * inp.setupCost
  const carryingCostTotal = (ebq / 2) * inp.carryingPerUnit
  const totalCost = setupCostTotal + carryingCostTotal

  const steps: Step[] = [
    {
      label: 'Economic Batch Quantity',
      formula: `√(2 × U × S ÷ C) = √(2 × ${formatNum(inp.annualUnits)} × ${formatINR(inp.setupCost)} ÷ ${formatINR(inp.carryingPerUnit)})`,
      result: `${formatNum(ebq)} units`,
      note: 'U = annual units, S = set-up cost per batch, C = carrying cost per unit p.a. (the batch analogue of EOQ).',
    },
    {
      label: 'Number of batches (production runs) per year',
      formula: `U ÷ EBQ = ${formatNum(inp.annualUnits)} ÷ ${formatNum(ebq)}`,
      result: `${formatNum(batchesPerYear)} batches`,
    },
    {
      label: 'Total set-up cost = batches × set-up cost',
      formula: `${formatNum(batchesPerYear)} × ${formatINR(inp.setupCost)}`,
      result: formatINR(setupCostTotal),
    },
    {
      label: 'Total carrying cost = (EBQ ÷ 2) × C',
      formula: `${formatNum(ebq / 2)} × ${formatINR(inp.carryingPerUnit)}`,
      result: formatINR(carryingCostTotal),
      note: 'At the EBQ the set-up and carrying costs are equal — total cost is minimised.',
    },
  ]

  return { ebq, batchesPerYear, setupCostTotal, carryingCostTotal, totalCost, steps }
}
