/* Process costing — a single process with normal loss, abnormal loss or
   abnormal gain. Pure & React-free.

   Grounded in M.N. Arora, *Cost Accounting* (Unit 9 — Process Costing). The
   normal-loss cost is borne by good output; abnormal loss/gain is valued at the
   same cost per unit and taken to the costing P&L. */
import type { Step } from '../calculators/types'
import { formatINR, formatNum } from './format'

export type ProcessInputs = {
  /** units introduced into the process */
  inputUnits: number
  /** cost of the units introduced (transfer-in / material at entry) */
  inputCost: number
  /** added in this process */
  addedMaterial: number
  labour: number
  overheads: number
  /** normal loss as a % of input units */
  normalLossPct: number
  /** scrap (realisable) value per unit of loss */
  scrapPerUnit: number
  /** actual good output of the process */
  actualOutput: number
}

export type ProcessResult = {
  totalCost: number
  normalLossUnits: number
  scrapValue: number
  /** expected (normal) output = input − normal loss */
  expectedOutput: number
  costPerUnit: number
  /** positive = abnormal loss units; negative = abnormal gain units */
  abnormalLossUnits: number
  abnormalLossValue: number
  isGain: boolean
  goodOutputValue: number
  steps: Step[]
}

export function computeProcess(inp: ProcessInputs): ProcessResult {
  const totalCost = inp.inputCost + inp.addedMaterial + inp.labour + inp.overheads
  const normalLossUnits = (inp.normalLossPct / 100) * inp.inputUnits
  const scrapValue = normalLossUnits * inp.scrapPerUnit
  const expectedOutput = inp.inputUnits - normalLossUnits

  // Cost per good unit = (total cost − scrap value of normal loss) ÷ (input − normal loss).
  const costPerUnit = expectedOutput > 0 ? (totalCost - scrapValue) / expectedOutput : 0

  // Abnormal loss (+) when actual < expected; abnormal gain (−) when actual > expected.
  const abnormalLossUnits = expectedOutput - inp.actualOutput
  const isGain = abnormalLossUnits < 0
  const abnormalLossValue = Math.abs(abnormalLossUnits) * costPerUnit
  const goodOutputValue = inp.actualOutput * costPerUnit

  const steps: Step[] = [
    {
      label: 'Total process cost = input + materials + labour + overheads',
      formula: `${formatINR(inp.inputCost)} + ${formatINR(inp.addedMaterial)} + ${formatINR(inp.labour)} + ${formatINR(inp.overheads)}`,
      result: formatINR(totalCost),
    },
    {
      label: `Normal loss = ${formatNum(inp.normalLossPct)}% of input`,
      formula: `${formatNum(inp.normalLossPct)}% × ${formatNum(inp.inputUnits)} = ${formatNum(normalLossUnits)} units; scrap ${formatNum(normalLossUnits)} × ${formatINR(inp.scrapPerUnit)}`,
      result: `${formatNum(normalLossUnits)} units · scrap ${formatINR(scrapValue)}`,
      note: 'The cost of normal loss is absorbed by good output; its scrap value is credited to the process.',
    },
    {
      label: 'Cost per unit = (total cost − scrap value) ÷ (input − normal loss)',
      formula: `(${formatINR(totalCost)} − ${formatINR(scrapValue)}) ÷ (${formatNum(inp.inputUnits)} − ${formatNum(normalLossUnits)})`,
      result: `${formatINR(costPerUnit)} per unit`,
    },
    {
      label: isGain
        ? 'Abnormal gain = actual output − expected output'
        : 'Abnormal loss = expected output − actual output',
      formula: `${formatNum(inp.actualOutput)} ${isGain ? '−' : 'vs'} ${formatNum(expectedOutput)} expected`,
      result: `${formatNum(Math.abs(abnormalLossUnits))} units × ${formatINR(costPerUnit)} = ${formatINR(abnormalLossValue)} ${isGain ? '(abnormal gain)' : '(abnormal loss)'}`,
      note: isGain
        ? 'Abnormal gain is debited to the process and credited to the Abnormal Gain A/c → costing P&L.'
        : 'Abnormal loss is credited out of the process to the Abnormal Loss A/c → costing P&L (less any scrap).',
    },
    {
      label: 'Cost of good output = actual output × cost per unit',
      formula: `${formatNum(inp.actualOutput)} × ${formatINR(costPerUnit)}`,
      result: formatINR(goodOutputValue),
    },
  ]

  return {
    totalCost,
    normalLossUnits,
    scrapValue,
    expectedOutput,
    costPerUnit,
    abnormalLossUnits,
    abnormalLossValue,
    isGain,
    goodOutputValue,
    steps,
  }
}
