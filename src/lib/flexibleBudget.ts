/* Flexible budget — split a semi-variable cost into fixed and variable parts by
   the high-low method, then restate the budget at any activity level.
   Pure & React-free.

   Grounded in standard B.Com / CMA budgetary-control texts and the user's own
   T.Y.B.Com past-exam example. */
import type { Step } from '../calculators/types'
import { formatINR, formatNum } from './format'

export type FlexInputs = {
  /** observed high activity level (units) and its total cost */
  highUnits: number
  highCost: number
  /** observed low activity level (units) and its total cost */
  lowUnits: number
  lowCost: number
  /** the activity level (units) to budget for */
  targetUnits: number
}

export type FlexRow = { units: number; fixed: number; variable: number; total: number; perUnit: number }

export type FlexResult = {
  variablePerUnit: number
  fixedCost: number
  /** budget rows at low, target and high levels */
  rows: FlexRow[]
  target: FlexRow
  steps: Step[]
}

export function computeFlexibleBudget(inp: FlexInputs): FlexResult {
  const dUnits = inp.highUnits - inp.lowUnits
  // High-low: the change in total cost over the change in units is all variable.
  const variablePerUnit = dUnits !== 0 ? (inp.highCost - inp.lowCost) / dUnits : 0
  // Fixed cost = total at a level − variable at that level (use the high level).
  const fixedCost = inp.highCost - variablePerUnit * inp.highUnits

  const row = (units: number): FlexRow => {
    const variable = variablePerUnit * units
    const total = fixedCost + variable
    return { units, fixed: fixedCost, variable, total, perUnit: units > 0 ? total / units : 0 }
  }

  const levels = [inp.lowUnits, inp.targetUnits, inp.highUnits]
    .filter((u, i, a) => a.indexOf(u) === i)
    .sort((a, b) => a - b)
  const rows = levels.map(row)
  const target = row(inp.targetUnits)

  const steps: Step[] = [
    {
      label: 'Variable cost per unit (high-low) = ΔCost ÷ ΔUnits',
      formula: `(${formatINR(inp.highCost)} − ${formatINR(inp.lowCost)}) ÷ (${formatNum(inp.highUnits)} − ${formatNum(inp.lowUnits)})`,
      result: `${formatINR(variablePerUnit)} per unit`,
      note: 'Between the two levels, fixed cost is unchanged — so the whole change in cost is variable.',
    },
    {
      label: 'Fixed cost = total cost − (variable per unit × units)',
      formula: `${formatINR(inp.highCost)} − (${formatINR(variablePerUnit)} × ${formatNum(inp.highUnits)})`,
      result: formatINR(fixedCost),
    },
    {
      label: `Budget at ${formatNum(inp.targetUnits)} units = fixed + (variable per unit × units)`,
      formula: `${formatINR(fixedCost)} + (${formatINR(variablePerUnit)} × ${formatNum(inp.targetUnits)})`,
      result: formatINR(target.total),
      note: `Cost per unit at this level = ${formatINR(target.perUnit)}.`,
    },
  ]

  return { variablePerUnit, fixedCost, rows, target, steps }
}
