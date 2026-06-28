/* Cost Sheet (Cost Statement) — unit / output costing. Pure & React-free.
   Builds the classic ladder: raw material consumed → Prime Cost → Works (Factory)
   Cost → Cost of Production → Cost of Goods Sold → Cost of Sales → Profit/Sales,
   with the standard stock adjustments (raw material, work-in-progress, finished
   goods) and an optional per-unit column.

   Grounded in M.N. Arora, *Cost Accounting* (Unit 2 — Cost Concepts & Cost Sheet),
   the standard B.Com / CA-CMA Inter format. */
import type { Step } from '../calculators/types'
import { formatINR } from './format'

export type CostLine = { label: string; amount: number }

export type CostSheetInputs = {
  /** raw-material control: opening + purchases + carriage inward − returns − closing = consumed */
  openingRM: number
  purchases: number
  carriageInward: number
  purchaseReturns: number
  closingRM: number

  directWages: number
  directExpenses: number

  factoryOverheads: CostLine[]
  /** WIP is adjusted at the works-cost stage (valued at works cost) */
  openingWIP: number
  closingWIP: number

  adminOverheads: CostLine[]
  /** finished goods are adjusted at cost-of-production stage */
  openingFG: number
  closingFG: number

  sellingOverheads: CostLine[]

  /** sales value — used to derive profit (Sales − Cost of Sales) */
  sales: number
  /** units produced — optional; drives the per-unit column when > 0 */
  unitsProduced: number
}

export type CostSheetResult = {
  materialsConsumed: number
  primeCost: number
  factoryOhTotal: number
  worksCostBeforeWIP: number
  worksCost: number
  adminOhTotal: number
  costOfProduction: number
  costOfGoodsSold: number
  sellingOhTotal: number
  costOfSales: number
  profit: number
  /** profit as a % of sales */
  profitPct: number
  /** per-unit figures (only meaningful when unitsProduced > 0) */
  perUnit: { prime: number; works: number; production: number } | null
  steps: Step[]
}

const sum = (xs: CostLine[]) => xs.reduce((a, l) => a + l.amount, 0)

export function computeCostSheet(inp: CostSheetInputs): CostSheetResult {
  const materialsConsumed =
    inp.openingRM + inp.purchases + inp.carriageInward - inp.purchaseReturns - inp.closingRM

  const primeCost = materialsConsumed + inp.directWages + inp.directExpenses

  const factoryOhTotal = sum(inp.factoryOverheads)
  const worksCostBeforeWIP = primeCost + factoryOhTotal
  // WIP is valued at works cost: add opening, subtract closing.
  const worksCost = worksCostBeforeWIP + inp.openingWIP - inp.closingWIP

  const adminOhTotal = sum(inp.adminOverheads)
  const costOfProduction = worksCost + adminOhTotal

  // Finished-goods stock is valued at cost of production.
  const costOfGoodsSold = costOfProduction + inp.openingFG - inp.closingFG

  const sellingOhTotal = sum(inp.sellingOverheads)
  const costOfSales = costOfGoodsSold + sellingOhTotal

  const profit = inp.sales - costOfSales
  const profitPct = inp.sales ? (profit / inp.sales) * 100 : 0

  const u = inp.unitsProduced
  const perUnit =
    u > 0
      ? { prime: primeCost / u, works: worksCost / u, production: costOfProduction / u }
      : null

  const steps: Step[] = [
    {
      label: 'Raw materials consumed',
      formula: `${formatINR(inp.openingRM)} opening + ${formatINR(inp.purchases)} purchases + ${formatINR(inp.carriageInward)} carriage − ${formatINR(inp.purchaseReturns)} returns − ${formatINR(inp.closingRM)} closing`,
      result: formatINR(materialsConsumed),
      note: 'Carriage inward on materials is part of material cost; closing stock is carried forward.',
    },
    {
      label: 'Prime Cost = direct material + direct wages + direct expenses',
      formula: `${formatINR(materialsConsumed)} + ${formatINR(inp.directWages)} + ${formatINR(inp.directExpenses)}`,
      result: formatINR(primeCost),
      note: 'Prime cost is the total of all direct costs.',
    },
    {
      label: 'Works (Factory) Cost = prime cost + factory overheads ± WIP',
      formula: `${formatINR(primeCost)} + ${formatINR(factoryOhTotal)} factory OH + ${formatINR(inp.openingWIP)} − ${formatINR(inp.closingWIP)} WIP`,
      result: formatINR(worksCost),
      note: 'Work-in-progress is adjusted here, valued at works cost.',
    },
    {
      label: 'Cost of Production = works cost + administration overheads',
      formula: `${formatINR(worksCost)} + ${formatINR(adminOhTotal)}`,
      result: formatINR(costOfProduction),
    },
    {
      label: 'Cost of Goods Sold = cost of production ± finished-goods stock',
      formula: `${formatINR(costOfProduction)} + ${formatINR(inp.openingFG)} − ${formatINR(inp.closingFG)}`,
      result: formatINR(costOfGoodsSold),
      note: 'Finished-goods stock is valued at cost of production.',
    },
    {
      label: 'Cost of Sales (Total Cost) = cost of goods sold + selling & distribution overheads',
      formula: `${formatINR(costOfGoodsSold)} + ${formatINR(sellingOhTotal)}`,
      result: formatINR(costOfSales),
    },
    {
      label: 'Profit = Sales − Cost of Sales',
      formula: `${formatINR(inp.sales)} − ${formatINR(costOfSales)}`,
      result: `${formatINR(profit)}  (${profitPct.toFixed(2)}% of sales)`,
      note: profit < 0 ? 'A negative figure is a loss.' : undefined,
    },
  ]

  return {
    materialsConsumed,
    primeCost,
    factoryOhTotal,
    worksCostBeforeWIP,
    worksCost,
    adminOhTotal,
    costOfProduction,
    costOfGoodsSold,
    sellingOhTotal,
    costOfSales,
    profit,
    profitPct,
    perUnit,
    steps,
  }
}
