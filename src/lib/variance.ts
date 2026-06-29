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

/* ----------------------------------------------------------- Overhead ------ */
/* Variable + fixed overhead variances (overhead-rate-per-hour method).
   Convention matches M.N. Arora, Cost Accounting, Unit 13 (Illustration 13.3):
   every variance = Absorbed/Standard/Budgeted − Actual; positive = Favourable.
     Variable:  Cost = Expenditure + Efficiency
     Fixed:     Cost = Expenditure + Volume;  Volume = Capacity + Efficiency (+ Calendar)
   Cross-checked: ICMAI/ICAI, ACCA (aCOWtancy), Finance Strategists, AccountingTools. */

export type OverheadInputs = {
  /* Budget */
  budgetedOutput: number
  budgetedHours: number
  budgetedVarOH: number
  budgetedFixedOH: number
  budgetedDays: number
  /* Actual */
  actualOutput: number
  actualHours: number
  actualVarOH: number
  actualFixedOH: number
  actualDays: number
  /** split the volume variance into calendar + revised-capacity + efficiency */
  separateCalendar: boolean
}

export type OverheadResult = {
  /* derived bases */
  stdVarRate: number
  stdFixedRatePerHour: number
  stdFixedRatePerDay: number
  shao: number
  varAbsorbed: number
  fixedAbsorbed: number
  /* variable */
  vohCost: Variance
  vohExpenditure: Variance
  vohEfficiency: Variance
  /* fixed */
  fohCost: Variance
  fohExpenditure: Variance
  fohVolume: Variance
  fohCapacity: Variance
  fohEffVariance: Variance
  fohCalendar?: Variance
  /** revised budgeted hours, only when separateCalendar */
  revisedBudgetedHours?: number
  /* total */
  totalCost: Variance
  steps: Step[]
}

export function computeOverheadVariance(inp: OverheadInputs): OverheadResult {
  const stdVarRate = inp.budgetedHours > 0 ? inp.budgetedVarOH / inp.budgetedHours : 0
  const stdFixedRatePerHour = inp.budgetedHours > 0 ? inp.budgetedFixedOH / inp.budgetedHours : 0
  const stdFixedRatePerDay = inp.budgetedDays > 0 ? inp.budgetedFixedOH / inp.budgetedDays : 0

  // Standard hours for actual output = (Budgeted hours ÷ Budgeted output) × Actual output.
  const shao = inp.budgetedOutput > 0 ? (inp.budgetedHours / inp.budgetedOutput) * inp.actualOutput : 0

  const varAbsorbed = shao * stdVarRate
  const varStandard = inp.actualHours * stdVarRate // "Standard V.O." = actual hrs × std rate
  const fixedAbsorbed = shao * stdFixedRatePerHour

  // Variable: Cost = Expenditure + Efficiency.
  const vohCost = v('Variable OH cost variance', varAbsorbed - inp.actualVarOH)
  const vohExpenditure = v('Variable OH expenditure variance', varStandard - inp.actualVarOH)
  const vohEfficiency = v('Variable OH efficiency variance', varAbsorbed - varStandard)

  // Fixed: Cost = Expenditure + Volume.
  const fohCost = v('Fixed OH cost variance', fixedAbsorbed - inp.actualFixedOH)
  const fohExpenditure = v('Fixed OH expenditure variance', inp.budgetedFixedOH - inp.actualFixedOH)
  const fohVolume = v('Fixed OH volume variance', fixedAbsorbed - inp.budgetedFixedOH)

  // Volume = Capacity + Efficiency (+ Calendar). Efficiency is the same either way.
  const fohEffVariance = v('Fixed OH efficiency variance', (shao - inp.actualHours) * stdFixedRatePerHour)

  let fohCapacity: Variance
  let fohCalendar: Variance | undefined
  let revisedBudgetedHours: number | undefined

  if (inp.separateCalendar) {
    revisedBudgetedHours = inp.budgetedDays > 0 ? (inp.budgetedHours / inp.budgetedDays) * inp.actualDays : 0
    fohCalendar = v('Fixed OH calendar variance', (inp.actualDays - inp.budgetedDays) * stdFixedRatePerDay)
    fohCapacity = v('Fixed OH capacity variance (revised)', (inp.actualHours - revisedBudgetedHours) * stdFixedRatePerHour)
  } else {
    fohCapacity = v('Fixed OH capacity variance', (inp.actualHours - inp.budgetedHours) * stdFixedRatePerHour)
  }

  const totalCost = v(
    'Total overhead cost variance',
    varAbsorbed + fixedAbsorbed - (inp.actualVarOH + inp.actualFixedOH),
  )

  const steps: Step[] = [
    {
      label: 'Standard hours for actual output (SHAO) = (Budgeted hours ÷ Budgeted output) × Actual output',
      formula: `(${formatNum(inp.budgetedHours)} ÷ ${formatNum(inp.budgetedOutput)}) × ${formatNum(inp.actualOutput)}`,
      result: `${formatNum(shao)} hours`,
    },
    {
      label: 'Standard rates',
      formula: `Variable ${formatINR(stdVarRate)}/hr · Fixed ${formatINR(stdFixedRatePerHour)}/hr`,
      result: `Absorbed: variable ${formatINR(varAbsorbed)}, fixed ${formatINR(fixedAbsorbed)}`,
      note: 'Absorbed (recovered) overhead = SHAO × standard rate.',
    },
    {
      label: 'Variable OH expenditure = (Std rate × Actual hrs) − Actual variable OH',
      formula: `(${formatINR(stdVarRate)} × ${formatNum(inp.actualHours)}) − ${formatINR(inp.actualVarOH)}`,
      result: tag(vohExpenditure),
    },
    {
      label: 'Variable OH efficiency = (SHAO − Actual hrs) × Std rate',
      formula: `(${formatNum(shao)} − ${formatNum(inp.actualHours)}) × ${formatINR(stdVarRate)}`,
      result: tag(vohEfficiency),
      note: 'Check: expenditure + efficiency = variable OH cost variance.',
    },
    {
      label: 'Fixed OH expenditure = Budgeted fixed OH − Actual fixed OH',
      formula: `${formatINR(inp.budgetedFixedOH)} − ${formatINR(inp.actualFixedOH)}`,
      result: tag(fohExpenditure),
    },
    {
      label: 'Fixed OH volume = Absorbed fixed OH − Budgeted fixed OH',
      formula: `${formatINR(fixedAbsorbed)} − ${formatINR(inp.budgetedFixedOH)}`,
      result: tag(fohVolume),
      note: 'Check: expenditure + volume = fixed OH cost variance.',
    },
  ]

  if (inp.separateCalendar) {
    steps.push(
      {
        label: 'Revised budgeted hours = (Budgeted hours ÷ Budgeted days) × Actual days',
        formula: `(${formatNum(inp.budgetedHours)} ÷ ${formatNum(inp.budgetedDays)}) × ${formatNum(inp.actualDays)}`,
        result: `${formatNum(revisedBudgetedHours ?? 0)} hours`,
      },
      {
        label: 'Fixed OH calendar = (Actual days − Budgeted days) × Std rate per day',
        formula: `(${formatNum(inp.actualDays)} − ${formatNum(inp.budgetedDays)}) × ${formatINR(stdFixedRatePerDay)}`,
        result: tag(fohCalendar!),
      },
      {
        label: 'Fixed OH capacity (revised) = (Actual hrs − Revised budgeted hrs) × Std rate',
        formula: `(${formatNum(inp.actualHours)} − ${formatNum(revisedBudgetedHours ?? 0)}) × ${formatINR(stdFixedRatePerHour)}`,
        result: tag(fohCapacity),
      },
    )
  } else {
    steps.push({
      label: 'Fixed OH capacity = (Actual hrs − Budgeted hrs) × Std rate',
      formula: `(${formatNum(inp.actualHours)} − ${formatNum(inp.budgetedHours)}) × ${formatINR(stdFixedRatePerHour)}`,
      result: tag(fohCapacity),
    })
  }

  steps.push(
    {
      label: 'Fixed OH efficiency = (SHAO − Actual hrs) × Std rate',
      formula: `(${formatNum(shao)} − ${formatNum(inp.actualHours)}) × ${formatINR(stdFixedRatePerHour)}`,
      result: tag(fohEffVariance),
      note: inp.separateCalendar
        ? 'Check: calendar + capacity + efficiency = volume variance.'
        : 'Check: capacity + efficiency = volume variance.',
    },
    {
      label: 'Total overhead cost variance = Total absorbed − Total actual',
      formula: `${formatINR(varAbsorbed + fixedAbsorbed)} − ${formatINR(inp.actualVarOH + inp.actualFixedOH)}`,
      result: tag(totalCost),
      note: 'Check: variable OH cost + fixed OH cost = total OH cost variance.',
    },
  )

  return {
    stdVarRate,
    stdFixedRatePerHour,
    stdFixedRatePerDay,
    shao,
    varAbsorbed,
    fixedAbsorbed,
    vohCost,
    vohExpenditure,
    vohEfficiency,
    fohCost,
    fohExpenditure,
    fohVolume,
    fohCapacity,
    fohEffVariance,
    fohCalendar,
    revisedBudgetedHours,
    totalCost,
    steps,
  }
}
