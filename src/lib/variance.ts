/* Standard costing — direct material and direct labour cost variances.
   Pure & React-free.

   Grounded in M.N. Arora, *Cost Accounting* (Unit 13 — Standard Costing).
   Convention: a variance is Favourable (F) when it saves cost, Adverse (A)
   when it costs more. Price/usage variances reconcile to the cost variance. */
import type { Step } from '../calculators/types'
import { formatINR, formatNum } from './format'

/** Label a signed variance: positive = favourable, negative = adverse. */
export type Variance = { name: string; amount: number; favourable: boolean }

const v = (name: string, amount: number): Variance => ({ name, amount: Math.abs(amount), favourable: amount >= 0 })

export const tag = (x: Variance) => `${formatINR(x.amount)} ${x.favourable ? '(F)' : '(A)'}`

/* ----------------------------------------------------------- Material ------ */

export type MaterialInputs = {
  /** standard quantity for the actual output */
  sq: number
  /** standard price per unit */
  sp: number
  /** actual quantity used */
  aq: number
  /** actual price paid per unit */
  ap: number
}

export type MaterialResult = {
  standardCost: number
  actualCost: number
  costVariance: Variance
  priceVariance: Variance
  usageVariance: Variance
  steps: Step[]
}

export function computeMaterialVariance(inp: MaterialInputs): MaterialResult {
  const standardCost = inp.sq * inp.sp
  const actualCost = inp.aq * inp.ap
  // MCV = SC − AC; MPV = (SP − AP) × AQ; MUV = (SQ − AQ) × SP.
  const costVariance = v('Material cost variance', standardCost - actualCost)
  const priceVariance = v('Material price variance', (inp.sp - inp.ap) * inp.aq)
  const usageVariance = v('Material usage variance', (inp.sq - inp.aq) * inp.sp)

  const steps: Step[] = [
    {
      label: 'Standard cost = SQ × SP; Actual cost = AQ × AP',
      formula: `${formatNum(inp.sq)} × ${formatINR(inp.sp)} = ${formatINR(standardCost)};  ${formatNum(inp.aq)} × ${formatINR(inp.ap)} = ${formatINR(actualCost)}`,
      result: `Cost variance ${tag(costVariance)}`,
    },
    {
      label: 'Material price variance = (SP − AP) × AQ',
      formula: `(${formatINR(inp.sp)} − ${formatINR(inp.ap)}) × ${formatNum(inp.aq)}`,
      result: tag(priceVariance),
      note: 'Difference in price, on the actual quantity bought.',
    },
    {
      label: 'Material usage variance = (SQ − AQ) × SP',
      formula: `(${formatNum(inp.sq)} − ${formatNum(inp.aq)}) × ${formatINR(inp.sp)}`,
      result: tag(usageVariance),
      note: 'Difference in quantity, at the standard price.',
    },
    {
      label: 'Check: price + usage = cost variance',
      formula: `${signed(priceVariance)} + ${signed(usageVariance)}`,
      result: tag(costVariance),
    },
  ]

  return { standardCost, actualCost, costVariance, priceVariance, usageVariance, steps }
}

/* ------------------------------------------------------------- Labour ------ */

export type LabourInputs = {
  /** standard hours for the actual output */
  sh: number
  /** standard rate per hour */
  sr: number
  /** actual hours worked */
  ah: number
  /** actual rate per hour */
  ar: number
}

export type LabourResult = {
  standardCost: number
  actualCost: number
  costVariance: Variance
  rateVariance: Variance
  efficiencyVariance: Variance
  steps: Step[]
}

export function computeLabourVariance(inp: LabourInputs): LabourResult {
  const standardCost = inp.sh * inp.sr
  const actualCost = inp.ah * inp.ar
  // LCV = SC − AC; LRV = (SR − AR) × AH; LEV = (SH − AH) × SR.
  const costVariance = v('Labour cost variance', standardCost - actualCost)
  const rateVariance = v('Labour rate variance', (inp.sr - inp.ar) * inp.ah)
  const efficiencyVariance = v('Labour efficiency variance', (inp.sh - inp.ah) * inp.sr)

  const steps: Step[] = [
    {
      label: 'Standard cost = SH × SR; Actual cost = AH × AR',
      formula: `${formatNum(inp.sh)} × ${formatINR(inp.sr)} = ${formatINR(standardCost)};  ${formatNum(inp.ah)} × ${formatINR(inp.ar)} = ${formatINR(actualCost)}`,
      result: `Cost variance ${tag(costVariance)}`,
    },
    {
      label: 'Labour rate variance = (SR − AR) × AH',
      formula: `(${formatINR(inp.sr)} − ${formatINR(inp.ar)}) × ${formatNum(inp.ah)}`,
      result: tag(rateVariance),
      note: 'Difference in wage rate, on the actual hours paid.',
    },
    {
      label: 'Labour efficiency variance = (SH − AH) × SR',
      formula: `(${formatNum(inp.sh)} − ${formatNum(inp.ah)}) × ${formatINR(inp.sr)}`,
      result: tag(efficiencyVariance),
      note: 'Difference in hours, at the standard rate.',
    },
    {
      label: 'Check: rate + efficiency = cost variance',
      formula: `${signed(rateVariance)} + ${signed(efficiencyVariance)}`,
      result: tag(costVariance),
    },
  ]

  return { standardCost, actualCost, costVariance, rateVariance, efficiencyVariance, steps }
}

const signed = (x: Variance) => `${x.favourable ? '+' : '−'}${formatINR(x.amount)}`
