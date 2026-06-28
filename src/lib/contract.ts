/* Contract costing — build the contract account, find notional profit as the
   balancing figure, and compute the prudent portion of profit to credit to the
   P&L A/c by stage of completion. Pure & React-free.

   Grounded in M.N. Arora, *Cost Accounting* (Unit 10 — Contract Costing,
   §10.3.1 Profit from Incomplete Contracts). */
import type { Step } from '../calculators/types'
import { formatINR, formatNum, formatPct } from './format'

export type ContractInputs = {
  contractPrice: number
  /* costs debited to the contract account (to date) */
  materials: number
  labour: number
  plantIssued: number
  expenses: number
  overheads: number
  /* closing items credited to the contract account */
  materialsReturned: number
  materialsAtSite: number
  plantAtSite: number
  workUncertified: number
  /* work-in-progress */
  workCertified: number
  cashReceived: number
}

export type ContractResult = {
  totalDebits: number
  totalCredits: number
  notionalProfit: number
  /** work certified ÷ contract price */
  stage: number
  /** cash received ÷ work certified */
  cashRatio: number
  /** the rule band applied */
  rule: string
  /** profit credited to P&L A/c */
  transfer: number
  /** profit held back as reserve */
  reserve: number
  isLoss: boolean
  steps: Step[]
}

export function computeContract(inp: ContractInputs): ContractResult {
  const costs = inp.materials + inp.labour + inp.plantIssued + inp.expenses + inp.overheads
  const closingCredits = inp.materialsReturned + inp.materialsAtSite + inp.plantAtSite + inp.workUncertified
  const wipCredits = inp.workCertified
  // Notional profit is the balancing figure: credits (excl. profit) − debits (costs).
  const notionalProfit = closingCredits + wipCredits - costs

  const totalDebits = costs + Math.max(0, notionalProfit)
  const totalCredits = closingCredits + wipCredits + Math.max(0, -notionalProfit)

  const stage = inp.contractPrice > 0 ? inp.workCertified / inp.contractPrice : 0
  const cashRatio = inp.workCertified > 0 ? inp.cashReceived / inp.workCertified : 0
  const isLoss = notionalProfit < 0

  let transfer = 0
  let rule: string
  if (isLoss) {
    // A notional loss is transferred to P&L in full, whatever the stage.
    transfer = notionalProfit
    rule = 'Notional loss — transferred to P&L in full, irrespective of stage.'
  } else if (stage < 0.25) {
    transfer = 0
    rule = 'Work certified < ¼ of contract price — no profit is taken (too early).'
  } else if (stage < 0.5) {
    transfer = (1 / 3) * notionalProfit * cashRatio
    rule = '¼ ≤ stage < ½ — transfer ⅓ × notional profit × cash ratio.'
  } else if (stage < 0.9) {
    transfer = (2 / 3) * notionalProfit * cashRatio
    rule = '½ ≤ stage < 9⁄10 — transfer ⅔ × notional profit × cash ratio.'
  } else {
    // Near completion the estimated-profit method is preferred; as a working
    // figure on notional profit, ⅔ × cash ratio is the conservative carry-over.
    transfer = (2 / 3) * notionalProfit * cashRatio
    rule = 'Stage ≥ 9⁄10 (near completion) — estimated-profit method is preferred; shown here as ⅔ × notional profit × cash ratio.'
  }

  const reserve = notionalProfit - transfer

  const steps: Step[] = [
    {
      label: 'Notional profit = (work certified + uncertified + closing materials/plant) − cost to date',
      formula: `(${formatINR(wipCredits)} + ${formatINR(closingCredits)}) − ${formatINR(costs)}`,
      result: `${formatINR(Math.abs(notionalProfit))} ${isLoss ? 'notional loss' : 'notional profit'}`,
      note: 'It is the balancing figure of the contract account.',
    },
    {
      label: 'Stage of completion = work certified ÷ contract price',
      formula: `${formatINR(inp.workCertified)} ÷ ${formatINR(inp.contractPrice)}`,
      result: formatPct(stage * 100),
    },
    {
      label: 'Cash ratio = cash received ÷ work certified',
      formula: `${formatINR(inp.cashReceived)} ÷ ${formatINR(inp.workCertified)}`,
      result: formatPct(cashRatio * 100),
    },
    {
      label: 'Profit credited to P&L A/c',
      formula: rule,
      result: formatINR(transfer),
      note: `Balance ${formatINR(Math.abs(reserve))} is held back as a reserve against future contingencies.`,
    },
  ]

  return {
    totalDebits,
    totalCredits,
    notionalProfit,
    stage,
    cashRatio,
    rule,
    transfer,
    reserve,
    isLoss,
    steps,
  }
}
