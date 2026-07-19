import { round } from './format'
import type { Step } from '../calculators/types'

/* ----------------------------------------------------------------------------
   Marginal vs Absorption costing — the classic profit-difference problem.

   Absorption costing carries FIXED manufacturing overhead into stock (product
   cost = variable cost + fixed OH per unit at normal capacity), so profit moves
   with PRODUCTION. Marginal costing writes all fixed cost off in the period, so
   profit moves with SALES. The two profits differ by exactly:

       (closing stock units − opening stock units) × fixed OH rate

   Assumptions (standard for exam problems): opening stock is valued at the
   same cost rates as current production (FIFO with stable costs), and actual
   fixed overhead equals budget — under/over-absorption arises only from the
   volume difference between production and normal capacity.
---------------------------------------------------------------------------- */

export type MaInputs = {
  unitsProduced: number
  unitsSold: number
  openingStock: number
  sellingPrice: number
  variableCostPerUnit: number // manufacturing only
  fixedMfgOverhead: number // actual = budgeted
  normalCapacity: number // units used to set the absorption rate
  varSellingPerUnit: number
  fixedSelling: number
}

type Line = { label: string; amount: number; op?: '−' | '+' | '=' }

export type MaStatement = {
  lines: Line[]
  profit: number
}

export type MaResult = {
  closingStock: number
  fohRate: number
  marginalCostPerUnit: number
  absorptionCostPerUnit: number
  underOverAbsorbed: number // + over, − under
  marginal: MaStatement
  absorption: MaStatement
  profitDifference: number // absorption − marginal
  reconciliation: Step[]
  steps: Step[]
}

export function computeMarginalAbsorption(inp: MaInputs): MaResult {
  const closingStock = Math.max(0, inp.openingStock + inp.unitsProduced - inp.unitsSold)
  const fohRate = inp.normalCapacity > 0 ? inp.fixedMfgOverhead / inp.normalCapacity : 0
  const marginalCostPerUnit = inp.variableCostPerUnit
  const absorptionCostPerUnit = inp.variableCostPerUnit + fohRate

  const sales = inp.unitsSold * inp.sellingPrice
  const varSelling = inp.unitsSold * inp.varSellingPerUnit

  /* ---- marginal statement ---- */
  const variableCogs = inp.unitsSold * marginalCostPerUnit
  const contribution = sales - variableCogs - varSelling
  const marginalProfit = contribution - inp.fixedMfgOverhead - inp.fixedSelling
  const marginal: MaStatement = {
    lines: [
      { label: `Sales (${fmt(inp.unitsSold)} × ₹${fmt(inp.sellingPrice)})`, amount: sales },
      { label: `Variable cost of goods sold (${fmt(inp.unitsSold)} × ₹${fmt(marginalCostPerUnit)})`, amount: variableCogs, op: '−' },
      { label: `Variable selling & admin (${fmt(inp.unitsSold)} × ₹${fmt(inp.varSellingPerUnit)})`, amount: varSelling, op: '−' },
      { label: 'Contribution', amount: contribution, op: '=' },
      { label: 'Fixed manufacturing overhead (all written off)', amount: inp.fixedMfgOverhead, op: '−' },
      { label: 'Fixed selling & admin', amount: inp.fixedSelling, op: '−' },
      { label: 'Profit (marginal costing)', amount: marginalProfit, op: '=' },
    ],
    profit: round(marginalProfit),
  }

  /* ---- absorption statement ---- */
  const absorbed = inp.unitsProduced * fohRate
  const underOverAbsorbed = absorbed - inp.fixedMfgOverhead // + over, − under
  const cogs = inp.unitsSold * absorptionCostPerUnit
  const grossProfit = sales - cogs + underOverAbsorbed
  const absorptionProfit = grossProfit - varSelling - inp.fixedSelling
  const absLines: Line[] = [
    { label: `Sales (${fmt(inp.unitsSold)} × ₹${fmt(inp.sellingPrice)})`, amount: sales },
    { label: `Cost of goods sold (${fmt(inp.unitsSold)} × ₹${fmt(round(absorptionCostPerUnit))})`, amount: cogs, op: '−' },
  ]
  if (Math.abs(underOverAbsorbed) > 0.005) {
    absLines.push({
      label: underOverAbsorbed > 0 ? 'Over-absorbed fixed overhead (credited)' : 'Under-absorbed fixed overhead (charged)',
      amount: Math.abs(underOverAbsorbed),
      op: underOverAbsorbed > 0 ? '+' : '−',
    })
  }
  absLines.push(
    { label: 'Gross profit', amount: grossProfit, op: '=' },
    { label: `Variable selling & admin (${fmt(inp.unitsSold)} × ₹${fmt(inp.varSellingPerUnit)})`, amount: varSelling, op: '−' },
    { label: 'Fixed selling & admin', amount: inp.fixedSelling, op: '−' },
    { label: 'Profit (absorption costing)', amount: absorptionProfit, op: '=' },
  )
  const absorption: MaStatement = { lines: absLines, profit: round(absorptionProfit) }

  const profitDifference = round(absorptionProfit - marginalProfit)
  const stockChange = closingStock - inp.openingStock

  const reconciliation: Step[] = [
    {
      label: 'Profit under absorption costing',
      result: `₹${fmt(round(absorptionProfit))}`,
    },
    {
      label: 'Profit under marginal costing',
      result: `₹${fmt(round(marginalProfit))}`,
    },
    {
      label: 'Difference explained by fixed OH held in stock',
      formula: `(Closing ${fmt(closingStock)} − Opening ${fmt(inp.openingStock)}) units × ₹${fmt(round(fohRate))} fixed OH per unit`,
      result: `₹${fmt(round(stockChange * fohRate))}`,
      note:
        stockChange > 0
          ? 'Stock rose — absorption defers some fixed overhead into closing stock, so it reports the HIGHER profit.'
          : stockChange < 0
            ? 'Stock fell — absorption releases prior fixed overhead from opening stock, so it reports the LOWER profit.'
            : 'Production equals sales — both methods report the same profit.',
    },
  ]

  const steps: Step[] = [
    {
      label: 'Fixed overhead absorption rate',
      formula: `₹${fmt(inp.fixedMfgOverhead)} ÷ ${fmt(inp.normalCapacity)} units (normal capacity)`,
      result: `₹${fmt(round(fohRate))} per unit`,
    },
    {
      label: 'Cost per unit under each method',
      formula: `Marginal = variable only ₹${fmt(marginalCostPerUnit)} · Absorption = ₹${fmt(marginalCostPerUnit)} + ₹${fmt(round(fohRate))} fixed`,
      result: `₹${fmt(round(absorptionCostPerUnit))} absorbed`,
    },
    {
      label: 'Stock movement',
      formula: `Opening ${fmt(inp.openingStock)} + Produced ${fmt(inp.unitsProduced)} − Sold ${fmt(inp.unitsSold)}`,
      result: `${fmt(closingStock)} units closing`,
    },
    ...(Math.abs(underOverAbsorbed) > 0.005
      ? [
          {
            label: underOverAbsorbed > 0 ? 'Over-absorption (production above normal)' : 'Under-absorption (production below normal)',
            formula: `Absorbed ${fmt(inp.unitsProduced)} × ₹${fmt(round(fohRate))} = ₹${fmt(round(absorbed))} vs actual ₹${fmt(inp.fixedMfgOverhead)}`,
            result: `₹${fmt(round(Math.abs(underOverAbsorbed)))}`,
          } satisfies Step,
        ]
      : []),
  ]

  return {
    closingStock,
    fohRate: round(fohRate),
    marginalCostPerUnit: round(marginalCostPerUnit),
    absorptionCostPerUnit: round(absorptionCostPerUnit),
    underOverAbsorbed: round(underOverAbsorbed),
    marginal,
    absorption,
    profitDifference,
    reconciliation,
    steps,
  }
}

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)
