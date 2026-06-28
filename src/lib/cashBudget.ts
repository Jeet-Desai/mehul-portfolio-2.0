/* Cash budget — month-by-month receipts & payments with a running closing
   balance. Pure & React-free.

   Grounded in standard B.Com / CMA budgetary-control texts (receipts-and-
   payments method). Only actual cash flows enter — no depreciation or accruals. */
import type { Step } from '../calculators/types'
import { formatINR } from './format'

export type BudgetRow = { label: string; values: number[] }

export type CashBudgetInputs = {
  months: string[]
  openingBalance: number
  receipts: BudgetRow[]
  payments: BudgetRow[]
}

export type MonthColumn = {
  month: string
  opening: number
  totalReceipts: number
  totalPayments: number
  closing: number
}

export type CashBudgetResult = {
  columns: MonthColumn[]
  receiptTotals: number[]
  paymentTotals: number[]
  /** the lowest closing balance across the months (overdraft warning if < 0) */
  minClosing: number
  steps: Step[]
}

const colSum = (rows: BudgetRow[], i: number) => rows.reduce((a, r) => a + (r.values[i] || 0), 0)

export function computeCashBudget(inp: CashBudgetInputs): CashBudgetResult {
  const n = inp.months.length
  const receiptTotals = Array.from({ length: n }, (_, i) => colSum(inp.receipts, i))
  const paymentTotals = Array.from({ length: n }, (_, i) => colSum(inp.payments, i))

  const columns: MonthColumn[] = []
  let opening = inp.openingBalance
  for (let i = 0; i < n; i++) {
    const closing = opening + receiptTotals[i] - paymentTotals[i]
    columns.push({ month: inp.months[i], opening, totalReceipts: receiptTotals[i], totalPayments: paymentTotals[i], closing })
    // Each month's closing balance carries forward as next month's opening.
    opening = closing
  }

  const minClosing = columns.length ? Math.min(...columns.map((c) => c.closing)) : 0

  const steps: Step[] = columns.map((c) => ({
    label: `${c.month}: closing = opening + receipts − payments`,
    formula: `${formatINR(c.opening)} + ${formatINR(c.totalReceipts)} − ${formatINR(c.totalPayments)}`,
    result: formatINR(c.closing),
    note: c.closing < 0 ? 'Negative — an overdraft / borrowing is needed this month.' : undefined,
  }))

  return { columns, receiptTotals, paymentTotals, minClosing, steps }
}
