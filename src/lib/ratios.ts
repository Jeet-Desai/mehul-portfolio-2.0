import { round } from './format'

/* ----------------------------------------------------------------------------
   Accounting ratio analysis — liquidity, solvency, profitability, efficiency.
   Formulas follow the standard Indian B.Com / financial-management convention.
   "Ideal" figures are widely-quoted rules of thumb — always read a ratio against
   the firm's own trend and its industry peers, not the textbook norm alone.
---------------------------------------------------------------------------- */

export type FinancialInputs = {
  // Income statement
  revenue: number
  cogs: number
  operatingExpenses: number
  interest: number
  netProfit: number
  // Balance sheet
  currentAssets: number
  inventory: number
  currentLiabilities: number
  totalAssets: number
  equity: number
  longTermDebt: number
}

export type Grade = 'good' | 'ok' | 'weak' | 'na'

export type Ratio = {
  name: string
  formula: string
  value: number
  display: string
  ideal?: string
  interpret: string
  grade: Grade
}

export type RatioGroup = { category: string; blurb: string; ratios: Ratio[] }

const safe = (num: number, den: number): number => (den !== 0 && Number.isFinite(num / den) ? num / den : NaN)
const ok = (v: number) => Number.isFinite(v)

const times = (v: number) => (ok(v) ? `${round(v, 2)} times` : '—')
const toOne = (v: number) => (ok(v) ? `${round(v, 2)} : 1` : '—')
const pct = (v: number) => (ok(v) ? `${round(v, 2)}%` : '—')

export function computeRatios(f: FinancialInputs): {
  groups: RatioGroup[]
  derived: { grossProfit: number; ebit: number; capitalEmployed: number; workingCapital: number; quickAssets: number }
} {
  const grossProfit = f.revenue - f.cogs
  const ebit = grossProfit - f.operatingExpenses // operating profit
  const capitalEmployed = f.equity + f.longTermDebt
  const workingCapital = f.currentAssets - f.currentLiabilities
  const quickAssets = f.currentAssets - f.inventory

  // ---- Liquidity -----------------------------------------------------------
  const current = safe(f.currentAssets, f.currentLiabilities)
  const quick = safe(quickAssets, f.currentLiabilities)

  // ---- Solvency ------------------------------------------------------------
  const debtEquity = safe(f.longTermDebt, f.equity)
  const interestCover = f.interest === 0 ? NaN : safe(ebit, f.interest)
  const proprietary = safe(f.equity, f.totalAssets)

  // ---- Profitability -------------------------------------------------------
  const gpMargin = safe(grossProfit, f.revenue) * 100
  const opMargin = safe(ebit, f.revenue) * 100
  const npMargin = safe(f.netProfit, f.revenue) * 100
  const roe = safe(f.netProfit, f.equity) * 100
  const roce = safe(ebit, capitalEmployed) * 100

  // ---- Efficiency / turnover ----------------------------------------------
  const invTurn = safe(f.cogs, f.inventory)
  const invDays = ok(invTurn) ? 365 / invTurn : NaN
  const assetTurn = safe(f.revenue, f.totalAssets)
  const wcTurn = workingCapital > 0 ? safe(f.revenue, workingCapital) : NaN

  const groups: RatioGroup[] = [
    {
      category: 'Liquidity',
      blurb: 'Can the firm meet its short-term dues?',
      ratios: [
        {
          name: 'Current Ratio',
          formula: 'Current Assets ÷ Current Liabilities',
          value: round(current, 2),
          display: toOne(current),
          ideal: '2 : 1',
          grade: !ok(current) ? 'na' : current >= 2 ? 'good' : current >= 1.33 ? 'ok' : 'weak',
          interpret: !ok(current)
            ? 'Enter current liabilities to compute this.'
            : current >= 2
              ? `Comfortably above the 2:1 norm — strong short-term liquidity. A very high ratio (>3) can mean idle cash or slow-moving stock.`
              : current >= 1.33
                ? 'Adequate cover for short-term dues, though below the 2:1 textbook ideal.'
                : current >= 1
                  ? 'Thin — assets only just cover liabilities; little safety margin.'
                  : 'Below 1 — current liabilities exceed current assets, a liquidity warning.',
        },
        {
          name: 'Quick (Acid-test) Ratio',
          formula: '(Current Assets − Inventory) ÷ Current Liabilities',
          value: round(quick, 2),
          display: toOne(quick),
          ideal: '1 : 1',
          grade: !ok(quick) ? 'na' : quick >= 1 ? 'good' : quick >= 0.75 ? 'ok' : 'weak',
          interpret: !ok(quick)
            ? 'Enter current liabilities to compute this.'
            : quick >= 1
              ? 'Meets the 1:1 ideal — the firm can pay current dues even without selling inventory.'
              : quick >= 0.75
                ? 'Slightly below 1:1; liquidity leans on inventory being converted to cash.'
                : 'Weak — excluding inventory, the firm cannot cover its short-term dues.',
        },
      ],
    },
    {
      category: 'Solvency',
      blurb: 'How much does the firm rely on borrowed funds?',
      ratios: [
        {
          name: 'Debt-Equity Ratio',
          formula: 'Long-term Debt ÷ Shareholders’ Equity',
          value: round(debtEquity, 2),
          display: toOne(debtEquity),
          ideal: '≤ 2 : 1',
          grade: !ok(debtEquity) ? 'na' : debtEquity <= 1 ? 'good' : debtEquity <= 2 ? 'ok' : 'weak',
          interpret: !ok(debtEquity)
            ? 'Enter shareholders’ equity to compute this.'
            : debtEquity <= 1
              ? 'Conservatively financed — owners’ funds at least match borrowings; low financial risk.'
              : debtEquity <= 2
                ? 'Moderately geared; within the commonly accepted 2:1 limit.'
                : 'Highly leveraged — heavy reliance on debt raises financial risk and interest burden.',
        },
        {
          name: 'Interest Coverage Ratio',
          formula: 'EBIT ÷ Interest expense',
          value: round(interestCover, 2),
          display: times(interestCover),
          ideal: '> 3 times',
          grade: !ok(interestCover) ? 'na' : interestCover >= 3 ? 'good' : interestCover >= 1.5 ? 'ok' : 'weak',
          interpret: !ok(interestCover)
            ? 'No interest expense entered — gearing risk is not applicable.'
            : interestCover >= 3
              ? 'Operating profit covers interest comfortably — low risk of default on interest.'
              : interestCover >= 1.5
                ? 'Interest is covered, but the cushion is modest.'
                : 'Operating profit barely covers (or fails to cover) interest — solvency stress.',
        },
        {
          name: 'Proprietary Ratio',
          formula: 'Shareholders’ Equity ÷ Total Assets',
          value: round(proprietary, 2),
          display: toOne(proprietary),
          ideal: '> 0.5',
          grade: !ok(proprietary) ? 'na' : proprietary >= 0.5 ? 'good' : proprietary >= 0.33 ? 'ok' : 'weak',
          interpret: !ok(proprietary)
            ? 'Enter total assets to compute this.'
            : proprietary >= 0.5
              ? 'Over half the assets are owner-funded — a sound, low-risk capital structure.'
              : proprietary >= 0.33
                ? 'A fair share of assets is owner-funded; the rest is creditor-financed.'
                : 'Assets are largely financed by outsiders — higher solvency risk.',
        },
      ],
    },
    {
      category: 'Profitability',
      blurb: 'How much profit does each rupee of sales / capital generate?',
      ratios: [
        {
          name: 'Gross Profit Margin',
          formula: '(Revenue − COGS) ÷ Revenue × 100',
          value: round(gpMargin, 2),
          display: pct(gpMargin),
          grade: !ok(gpMargin) ? 'na' : gpMargin >= 25 ? 'good' : gpMargin >= 10 ? 'ok' : 'weak',
          interpret: !ok(gpMargin)
            ? 'Enter revenue to compute this.'
            : `${pct(gpMargin)} of sales is left after direct costs to cover overheads and profit. Compare with prior years and peers — there is no universal ideal.`,
        },
        {
          name: 'Operating (EBIT) Margin',
          formula: 'EBIT ÷ Revenue × 100',
          value: round(opMargin, 2),
          display: pct(opMargin),
          grade: !ok(opMargin) ? 'na' : opMargin >= 15 ? 'good' : opMargin >= 8 ? 'ok' : 'weak',
          interpret: !ok(opMargin)
            ? 'Enter revenue to compute this.'
            : `Profit from core operations (before interest and tax) per ₹100 of sales. Reflects operating efficiency, independent of how the firm is financed.`,
        },
        {
          name: 'Net Profit Margin',
          formula: 'Net Profit (PAT) ÷ Revenue × 100',
          value: round(npMargin, 2),
          display: pct(npMargin),
          grade: !ok(npMargin) ? 'na' : npMargin < 0 ? 'weak' : npMargin >= 10 ? 'good' : npMargin >= 5 ? 'ok' : 'weak',
          interpret: !ok(npMargin)
            ? 'Enter revenue to compute this.'
            : npMargin < 0
              ? 'A net loss — costs exceed revenue this period.'
              : `${pct(npMargin)} of every sales rupee becomes bottom-line profit after all costs, interest and tax.`,
        },
        {
          name: 'Return on Equity (ROE)',
          formula: 'Net Profit ÷ Shareholders’ Equity × 100',
          value: round(roe, 2),
          display: pct(roe),
          ideal: '> 15%',
          grade: !ok(roe) ? 'na' : roe < 0 ? 'weak' : roe >= 15 ? 'good' : roe >= 8 ? 'ok' : 'weak',
          interpret: !ok(roe)
            ? 'Enter shareholders’ equity to compute this.'
            : roe < 0
              ? 'Negative — the firm eroded shareholder funds this period.'
              : `Owners earned ${pct(roe)} on their funds. Judge against their expected return / cost of equity.`,
        },
        {
          name: 'Return on Capital Employed (ROCE)',
          formula: 'EBIT ÷ Capital Employed × 100',
          value: round(roce, 2),
          display: pct(roce),
          ideal: '> cost of capital',
          grade: !ok(roce) ? 'na' : roce < 0 ? 'weak' : roce >= 15 ? 'good' : roce >= 8 ? 'ok' : 'weak',
          interpret: !ok(roce)
            ? 'Enter equity and long-term debt to compute capital employed.'
            : `The business earns ${pct(roce)} on all long-term capital (equity + debt). It creates value only when ROCE exceeds the cost of that capital.`,
        },
      ],
    },
    {
      category: 'Efficiency / Turnover',
      blurb: 'How hard are the firm’s assets working?',
      ratios: [
        {
          name: 'Inventory Turnover',
          formula: 'COGS ÷ Inventory',
          value: round(invTurn, 2),
          display: ok(invTurn) ? `${round(invTurn, 2)} times (≈ ${Math.round(invDays)} days)` : '—',
          grade: !ok(invTurn) ? 'na' : invTurn >= 6 ? 'good' : invTurn >= 3 ? 'ok' : 'weak',
          interpret: !ok(invTurn)
            ? 'Enter inventory to compute this.'
            : `Stock is sold and replaced about ${round(invTurn, 1)} times a year (≈ ${Math.round(invDays)} days on the shelf). Higher = faster-moving stock and less tied-up cash. Uses closing inventory — use the average of opening & closing if available.`,
        },
        {
          name: 'Asset Turnover',
          formula: 'Revenue ÷ Total Assets',
          value: round(assetTurn, 2),
          display: times(assetTurn),
          grade: !ok(assetTurn) ? 'na' : assetTurn >= 1 ? 'good' : assetTurn >= 0.5 ? 'ok' : 'weak',
          interpret: !ok(assetTurn)
            ? 'Enter total assets to compute this.'
            : `Each ₹1 of assets generates ₹${round(assetTurn, 2)} of sales — a measure of how efficiently assets are used to drive revenue.`,
        },
        {
          name: 'Working Capital Turnover',
          formula: 'Revenue ÷ Working Capital',
          value: round(wcTurn, 2),
          display: times(wcTurn),
          grade: !ok(wcTurn) ? 'na' : wcTurn >= 4 ? 'good' : wcTurn >= 2 ? 'ok' : 'weak',
          interpret: !ok(wcTurn)
            ? workingCapital <= 0
              ? 'Working capital is zero or negative — the ratio is not meaningful here.'
              : 'Enter revenue to compute this.'
            : `Each ₹1 of working capital supports ₹${round(wcTurn, 2)} of sales. Very high can signal overtrading; very low, idle working capital.`,
        },
      ],
    },
  ]

  return {
    groups,
    derived: {
      grossProfit: round(grossProfit),
      ebit: round(ebit),
      capitalEmployed: round(capitalEmployed),
      workingCapital: round(workingCapital),
      quickAssets: round(quickAssets),
    },
  }
}
