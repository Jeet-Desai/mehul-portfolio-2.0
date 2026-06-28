/* Material cost control — Economic Order Quantity (EOQ) and stock levels.
   Pure & React-free. Two independent tools sharing this module.

   Grounded in M.N. Arora, *Cost Accounting* (Unit 3 — Material Cost Control),
   the standard B.Com / CA-CMA Inter formulae. */
import type { Step } from '../calculators/types'
import { formatINR, formatNum } from './format'

/* ----------------------------------------------------------------- EOQ ----- */

export type EoqInputs = {
  /** annual consumption / demand in units (A) */
  annualDemand: number
  /** ordering / buying cost per order (O) */
  orderingCost: number
  /** how the carrying cost is supplied */
  carryingMode: 'perUnit' | 'percent'
  /** carrying cost per unit per annum (used when carryingMode = perUnit) */
  carryingPerUnit: number
  /** cost per unit of material (C) — needed for the percentage mode */
  unitCost: number
  /** carrying cost as a % of average inventory value p.a. (used when carryingMode = percent) */
  carryingPercent: number
}

export type EoqResult = {
  /** holding cost per unit per annum actually used */
  holdingPerUnit: number
  eoq: number
  ordersPerYear: number
  /** total annual ordering cost at EOQ */
  orderingCostTotal: number
  /** total annual carrying cost at EOQ */
  carryingCostTotal: number
  /** total relevant inventory cost (ordering + carrying) at EOQ */
  totalCost: number
  steps: Step[]
}

export function computeEoq(inp: EoqInputs): EoqResult {
  const holdingPerUnit =
    inp.carryingMode === 'perUnit'
      ? inp.carryingPerUnit
      : (inp.unitCost * inp.carryingPercent) / 100

  const eoq =
    inp.annualDemand > 0 && inp.orderingCost > 0 && holdingPerUnit > 0
      ? Math.sqrt((2 * inp.annualDemand * inp.orderingCost) / holdingPerUnit)
      : 0

  const ordersPerYear = eoq > 0 ? inp.annualDemand / eoq : 0
  const orderingCostTotal = ordersPerYear * inp.orderingCost
  const carryingCostTotal = (eoq / 2) * holdingPerUnit
  const totalCost = orderingCostTotal + carryingCostTotal

  const steps: Step[] = [
    {
      label: 'Carrying cost per unit per annum',
      formula:
        inp.carryingMode === 'perUnit'
          ? `Given directly = ${formatINR(holdingPerUnit)}`
          : `${inp.carryingPercent}% × ${formatINR(inp.unitCost)} per unit`,
      result: formatINR(holdingPerUnit),
    },
    {
      label: 'Economic Order Quantity',
      formula: `√(2 × A × O ÷ Cₕ) = √(2 × ${formatNum(inp.annualDemand)} × ${formatINR(inp.orderingCost)} ÷ ${formatINR(holdingPerUnit)})`,
      result: `${formatNum(eoq)} units`,
      note: 'A = annual demand, O = cost per order, Cₕ = carrying cost per unit p.a.',
    },
    {
      label: 'Number of orders per year',
      formula: `A ÷ EOQ = ${formatNum(inp.annualDemand)} ÷ ${formatNum(eoq)}`,
      result: `${formatNum(ordersPerYear)} orders`,
    },
    {
      label: 'Total ordering cost = (A ÷ EOQ) × O',
      formula: `${formatNum(ordersPerYear)} × ${formatINR(inp.orderingCost)}`,
      result: formatINR(orderingCostTotal),
    },
    {
      label: 'Total carrying cost = (EOQ ÷ 2) × Cₕ',
      formula: `${formatNum(eoq / 2)} avg units × ${formatINR(holdingPerUnit)}`,
      result: formatINR(carryingCostTotal),
      note: 'At EOQ the ordering and carrying costs are equal — total cost is at its minimum.',
    },
    {
      label: 'Total relevant inventory cost',
      formula: `${formatINR(orderingCostTotal)} + ${formatINR(carryingCostTotal)}`,
      result: formatINR(totalCost),
    },
  ]

  return {
    holdingPerUnit,
    eoq,
    ordersPerYear,
    orderingCostTotal,
    carryingCostTotal,
    totalCost,
    steps,
  }
}

/* --------------------------------------------------------- Stock levels ---- */

export type StockInputs = {
  /** usage / consumption per period (units) */
  minUsage: number
  maxUsage: number
  normalUsage: number
  /** lead (reorder) time per order, in the same period units */
  minLeadTime: number
  maxLeadTime: number
  /** reorder quantity (EOQ) */
  reorderQty: number
  /** emergency lead time for the danger level (optional; 0 to hide) */
  emergencyLeadTime: number
}

export type StockResult = {
  reorderLevel: number
  minimumLevel: number
  maximumLevel: number
  averageLevel: number
  dangerLevel: number
  /** average normal lead time, used in the minimum-level formula */
  avgLeadTime: number
  steps: Step[]
}

export function computeStockLevels(inp: StockInputs): StockResult {
  const avgLeadTime = (inp.minLeadTime + inp.maxLeadTime) / 2

  // Reorder level = maximum usage × maximum lead time.
  const reorderLevel = inp.maxUsage * inp.maxLeadTime
  // Minimum level = ROL − (normal usage × average lead time).
  const minimumLevel = reorderLevel - inp.normalUsage * avgLeadTime
  // Maximum level = ROL + ROQ − (minimum usage × minimum lead time).
  const maximumLevel = reorderLevel + inp.reorderQty - inp.minUsage * inp.minLeadTime
  // Average stock level = ½ (minimum + maximum).
  const averageLevel = (minimumLevel + maximumLevel) / 2
  // Danger level = normal usage × emergency lead time.
  const dangerLevel = inp.normalUsage * inp.emergencyLeadTime

  const steps: Step[] = [
    {
      label: 'Re-order level = maximum usage × maximum lead time',
      formula: `${formatNum(inp.maxUsage)} × ${formatNum(inp.maxLeadTime)}`,
      result: `${formatNum(reorderLevel)} units`,
      note: 'The level at which a fresh purchase requisition is raised.',
    },
    {
      label: 'Minimum level = re-order level − (normal usage × average lead time)',
      formula: `${formatNum(reorderLevel)} − (${formatNum(inp.normalUsage)} × ${formatNum(avgLeadTime)})`,
      result: `${formatNum(minimumLevel)} units`,
      note: 'The safety-stock floor; production risks stoppage below it.',
    },
    {
      label: 'Maximum level = re-order level + re-order qty − (minimum usage × minimum lead time)',
      formula: `${formatNum(reorderLevel)} + ${formatNum(inp.reorderQty)} − (${formatNum(inp.minUsage)} × ${formatNum(inp.minLeadTime)})`,
      result: `${formatNum(maximumLevel)} units`,
      note: 'The ceiling; stock should not normally rise above it (avoids blocked capital).',
    },
    {
      label: 'Average stock level = ½ (minimum + maximum)',
      formula: `½ × (${formatNum(minimumLevel)} + ${formatNum(maximumLevel)})`,
      result: `${formatNum(averageLevel)} units`,
    },
  ]
  if (inp.emergencyLeadTime > 0) {
    steps.push({
      label: 'Danger level = normal usage × emergency lead time',
      formula: `${formatNum(inp.normalUsage)} × ${formatNum(inp.emergencyLeadTime)}`,
      result: `${formatNum(dangerLevel)} units`,
      note: 'Below this, normal issues stop — material is issued only for urgent jobs.',
    })
  }

  return { reorderLevel, minimumLevel, maximumLevel, averageLevel, dangerLevel, avgLeadTime, steps }
}
