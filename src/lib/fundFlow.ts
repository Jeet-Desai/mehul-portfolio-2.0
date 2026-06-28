/* Fund Flow Statement (working-capital basis). Pure & React-free.
   Three linked statements: schedule of changes in working capital, funds from
   operations, and the fund flow statement — with the sources-vs-applications
   cross-check against the schedule. */
import type { Step } from '../calculators/types'
import { formatINR } from './format'

export type WCItem = { label: string; kind: 'asset' | 'liability'; opening: number; closing: number }
export type FFLine = { label: string; amount: number }

export type FundFlowInputs = {
  workingCapital: WCItem[]
  netProfit: number
  /** non-fund / non-operating debits added back (depreciation, goodwill w/o, loss on sale, transfer to reserves, proposed dividend, provision for tax…) */
  addBacks: FFLine[]
  /** non-operating credits removed (profit on sale, dividend / interest income…) */
  deductions: FFLine[]
  /** sources other than funds from operations (shares/debentures issued, loans raised, sale of fixed assets/investments) */
  otherSources: FFLine[]
  /** applications (purchase of fixed assets/investments, repayment of loans, redemption, dividend & tax paid) */
  applications: FFLine[]
}

export type WCRow = { label: string; kind: 'asset' | 'liability'; delta: number; effect: number }

export type FundFlowResult = {
  wcRows: WCRow[]
  wcIncrease: number
  addBackTotal: number
  deductionTotal: number
  ffo: number
  otherSourcesTotal: number
  totalSources: number
  totalApplications: number
  stmtWcChange: number
  diff: number
  ties: boolean
  steps: Step[]
}

const sum = (xs: FFLine[]) => xs.reduce((a, l) => a + l.amount, 0)

export function computeFundFlow(inp: FundFlowInputs): FundFlowResult {
  const wcRows: WCRow[] = inp.workingCapital.map((w) => {
    const delta = w.closing - w.opening
    // Increase in a current asset raises WC; increase in a current liability lowers it.
    const effect = w.kind === 'asset' ? delta : -delta
    return { label: w.label, kind: w.kind, delta, effect }
  })
  const wcIncrease = wcRows.reduce((a, r) => a + r.effect, 0)

  const addBackTotal = sum(inp.addBacks)
  const deductionTotal = sum(inp.deductions)
  const ffo = inp.netProfit + addBackTotal - deductionTotal

  const otherSourcesTotal = sum(inp.otherSources)
  const totalSources = ffo + otherSourcesTotal
  const totalApplications = sum(inp.applications)
  const stmtWcChange = totalSources - totalApplications

  const diff = stmtWcChange - wcIncrease
  const ties = Math.abs(diff) < 0.5

  const word = (n: number) => (n >= 0 ? 'Increase' : 'Decrease')

  const steps: Step[] = [
    {
      label: 'Schedule of changes in working capital',
      formula: 'Σ (increase in current assets − increase in current liabilities)',
      result: `${word(wcIncrease)} in working capital ${formatINR(Math.abs(wcIncrease))}`,
      note: 'An increase in a current asset (or decrease in a current liability) raises working capital.',
    },
    {
      label: 'Funds from operations',
      formula: `${formatINR(inp.netProfit)} + ${formatINR(addBackTotal)} (non-fund add-backs) − ${formatINR(deductionTotal)} (non-operating income)`,
      result: formatINR(ffo),
      note: 'Adjusted P&L: add back non-fund/non-operating charges; remove non-operating incomes.',
    },
    {
      label: 'Total sources of funds',
      formula: `${formatINR(ffo)} (FFO) + ${formatINR(otherSourcesTotal)} (other sources)`,
      result: formatINR(totalSources),
    },
    {
      label: 'Total applications of funds',
      result: formatINR(totalApplications),
    },
    {
      label: 'Sources − Applications = change in working capital',
      formula: `${formatINR(totalSources)} − ${formatINR(totalApplications)}`,
      result: `${word(stmtWcChange)} ${formatINR(Math.abs(stmtWcChange))}`,
      note: ties
        ? 'Cross-check ties with the schedule of changes in working capital. ✓'
        : `Does not tie with the schedule (${formatINR(Math.abs(wcIncrease))}) — re-check an item.`,
    },
  ]

  return {
    wcRows,
    wcIncrease,
    addBackTotal,
    deductionTotal,
    ffo,
    otherSourcesTotal,
    totalSources,
    totalApplications,
    stmtWcChange,
    diff,
    ties,
    steps,
  }
}
