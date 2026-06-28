/* Cash Flow Statement — AS 3 / Ind AS 7, indirect method. Pure & React-free.
   Verified against the worked example in the `cash-flow` resource topic
   (net cash from operating activities = ₹95,000). */
import type { Step } from '../calculators/types'
import { formatINR } from './format'

/** A simple labelled amount (an add-back, a deduction, a flow line). */
export type CFLine = { label: string; amount: number }

/** A current asset / current liability whose movement adjusts operating cash. */
export type WCItem = {
  label: string
  kind: 'asset' | 'liability'
  opening: number
  closing: number
}

/** A line under investing / financing — an inflow or an outflow. */
export type FlowItem = { label: string; amount: number; direction: 'in' | 'out' }

export type CashFlowInputs = {
  /** profit before tax (after adding back tax provision, proposed dividend, transfers to reserves) */
  netProfitBeforeTax: number
  /** non-cash & non-operating charges added back (depreciation, interest expense, loss on sale, write-offs…) */
  addBacks: CFLine[]
  /** non-operating incomes removed (profit on sale, interest & dividend income…) */
  deductions: CFLine[]
  /** current assets & liabilities, opening → closing */
  workingCapital: WCItem[]
  taxPaid: number
  investing: FlowItem[]
  financing: FlowItem[]
  openingCash: number
  /** optional: actual closing cash per balance sheet, for the reconciliation check */
  closingCashActual?: number
}

export type WCRow = {
  label: string
  kind: 'asset' | 'liability'
  delta: number
  /** signed effect on operating cash (+ adds, − subtracts) */
  effect: number
}

export type CashFlowResult = {
  addBackTotal: number
  deductionTotal: number
  opBeforeWC: number
  wcRows: WCRow[]
  wcEffect: number
  cashBeforeTax: number
  operatingCF: number
  investingCF: number
  financingCF: number
  netChange: number
  closingCash: number
  /** closingCashActual − closingCash; ~0 means the statement ties */
  reconDiff: number | null
  steps: Step[]
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

export function computeCashFlow(inp: CashFlowInputs): CashFlowResult {
  const addBackTotal = sum(inp.addBacks.map((l) => l.amount))
  const deductionTotal = sum(inp.deductions.map((l) => l.amount))
  const opBeforeWC = inp.netProfitBeforeTax + addBackTotal - deductionTotal

  const wcRows: WCRow[] = inp.workingCapital.map((w) => {
    const delta = w.closing - w.opening
    // CA up → cash down; CL up → cash up.
    const effect = w.kind === 'asset' ? -delta : delta
    return { label: w.label, kind: w.kind, delta, effect }
  })
  const wcEffect = sum(wcRows.map((r) => r.effect))

  const cashBeforeTax = opBeforeWC + wcEffect
  const operatingCF = cashBeforeTax - inp.taxPaid

  const flowNet = (items: FlowItem[]) =>
    sum(items.map((f) => (f.direction === 'in' ? f.amount : -f.amount)))
  const investingCF = flowNet(inp.investing)
  const financingCF = flowNet(inp.financing)

  const netChange = operatingCF + investingCF + financingCF
  const closingCash = inp.openingCash + netChange
  const reconDiff =
    inp.closingCashActual === undefined ? null : inp.closingCashActual - closingCash

  const steps: Step[] = [
    {
      label: 'Operating profit before working-capital changes',
      formula: `${formatINR(inp.netProfitBeforeTax)} + ${formatINR(addBackTotal)} (add-backs) − ${formatINR(deductionTotal)} (non-operating income)`,
      result: formatINR(opBeforeWC),
      note: 'Start from net profit before tax; add back non-cash/non-operating charges and remove non-operating incomes.',
    },
    {
      label: 'Adjust working-capital changes',
      formula: `${formatINR(opBeforeWC)} ${wcEffect >= 0 ? '+' : '−'} ${formatINR(Math.abs(wcEffect))}`,
      result: formatINR(cashBeforeTax),
      note: 'Add a decrease in a current asset / increase in a current liability; subtract the opposite.',
    },
    {
      label: 'Less: tax paid → Net cash from operating activities',
      formula: `${formatINR(cashBeforeTax)} − ${formatINR(inp.taxPaid)}`,
      result: formatINR(operatingCF),
    },
    {
      label: 'Net cash from investing activities',
      result: formatINR(investingCF),
      note: 'Inflows (sale of assets/investments, interest & dividend received) less outflows (purchase of assets/investments).',
    },
    {
      label: 'Net cash from financing activities',
      result: formatINR(financingCF),
      note: 'Inflows (shares/debentures issued, loans raised) less outflows (redemptions, repayments, interest & dividend paid).',
    },
    {
      label: 'Net change in cash, then add opening balance',
      formula: `(${formatINR(operatingCF)} + ${formatINR(investingCF)} + ${formatINR(financingCF)}) + ${formatINR(inp.openingCash)}`,
      result: `Closing cash & equivalents ${formatINR(closingCash)}`,
    },
  ]

  return {
    addBackTotal,
    deductionTotal,
    opBeforeWC,
    wcRows,
    wcEffect,
    cashBeforeTax,
    operatingCF,
    investingCF,
    financingCF,
    netChange,
    closingCash,
    reconDiff,
    steps,
  }
}
