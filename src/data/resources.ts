/* ----------------------------------------------------------------------------
   Resource Library — structured study notes for each Learn-Hub topic.
   Data-driven (this file is the single source of truth); the pages just render it.

   CORRECTNESS RULE (everything here ships under Dr. Desai's name):
   - Content is grounded in standard B.Com / CA-CS-CMA texts (esp. M.N. Arora,
     *Cost Accounting*) and Dr. Desai's own class material, and cross-checked
     against authoritative sources (ICAI / ACCA / ClearTax) — see each topic's
     `references`. Never add a formula or claim you have not verified.
   - Keep statutory/rate-specific numbers OUT of here — they change. This is an
     evergreen study reference; live figures live in the calculators.
   - Each topic optionally links to a calculator (`calc`) and the formula sheet.
     The calculator link only renders if that calculator actually exists yet.
---------------------------------------------------------------------------- */

import type { LucideIcon } from 'lucide-react'
import {
  Gauge,
  ArrowRightLeft,
  Wallet,
  CalendarClock,
  SlidersHorizontal,
  FileSpreadsheet,
  PackageSearch,
  Users,
  Layers,
  ClipboardList,
  HardHat,
  GitBranch,
  Bus,
} from 'lucide-react'

export type ResourceSubject =
  | 'Financial Statement Analysis'
  | 'Budgetary Control'
  | 'Cost Accounting'

/** kind drives the little badge + icon on a reference link */
export type RefKind = 'official' | 'textbook' | 'article' | 'video'

export type ResourceRef = {
  label: string
  url: string
  kind: RefKind
  /** short attribution shown on the chip, e.g. "ICAI", "ACCA" */
  source?: string
}

export type KeyTerm = { term: string; def: string }
export type TopicFormula = { name: string; expr: string; note?: string }
export type ProcedureStep = { title: string; detail: string }

/** A fully-worked numerical example (shown step by step, like the calculators). */
export type WorkedExample = {
  title?: string
  problem: string
  steps: { label: string; formula?: string; result?: string }[]
  answer: string
  /** optional attribution, e.g. a past-exam paper */
  source?: string
}

/** A self-test question; the answer reveals on click behind a warning. */
export type PracticeQuestion = {
  q: string
  /** optional MCQ choices */
  options?: string[]
  /** the answer + a short why */
  answer: string
}

export type ResourceTopic = {
  id: string
  title: string
  subject: ResourceSubject
  icon: LucideIcon
  /** who studies this — shown as a small pill */
  level: string
  /** one-line summary for the index card + search */
  blurb: string
  readingMinutes: number
  /** intro paragraphs — the "what & why" */
  overview: string[]
  keyTerms: KeyTerm[]
  formulas?: TopicFormula[]
  /** the method, step by step */
  procedure?: { heading?: string; steps: ProcedureStep[] }
  examTips?: string[]
  pitfalls?: string[]
  /** a fully-worked numerical example, where one helps */
  workedExample?: WorkedExample
  /** a few self-test questions with reveal-on-click answers */
  practice?: PracticeQuestion[]
  references: ResourceRef[]
  /** slug of the related calculator (link renders only if it exists in the registry) */
  calc?: string
  /** extra search keywords */
  tags?: string[]
}

/** Only subjects that currently have topics are listed (drives the filter chips). */
export const resourceSubjects: ResourceSubject[] = [
  'Financial Statement Analysis',
  'Budgetary Control',
  'Cost Accounting',
]

export const resourceTopics: ResourceTopic[] = [
  /* ============================================ Financial Statement Analysis */
  {
    id: 'ratio-analysis',
    title: 'Ratio Analysis',
    subject: 'Financial Statement Analysis',
    icon: Gauge,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Turn a P&L and balance sheet into liquidity, solvency, profitability and turnover ratios — and read what they mean.',
    readingMinutes: 9,
    tags: ['current ratio', 'quick ratio', 'debt equity', 'roce', 'roe', 'turnover', 'gearing'],
    overview: [
      'Ratio analysis is the most widely used tool of financial-statement analysis. A ratio simply expresses the relationship between two figures drawn from the financial statements — for example, current assets against current liabilities — so that performance can be judged far more meaningfully than from the absolute figures alone.',
      'Ratios are grouped by the question they answer: liquidity ratios test short-term solvency, solvency/gearing ratios test long-term financial structure, profitability ratios test earning power, and activity (turnover) ratios test how efficiently assets are used. A single ratio in isolation says little — its value comes from comparison: against the firm’s own past trend, against a budget, or against industry peers.',
      '“Ideal” figures such as a 2 : 1 current ratio or a 1 : 1 quick ratio are rules of thumb, not laws. A ratio well above the norm can be as much a warning (idle cash, slow-moving stock) as a ratio below it. Always interpret, don’t just compute.',
    ],
    keyTerms: [
      { term: 'Liquidity ratios', def: 'Measure the firm’s ability to meet short-term obligations as they fall due (current ratio, quick/acid-test ratio).' },
      { term: 'Solvency / gearing ratios', def: 'Measure reliance on borrowed funds and ability to service long-term debt (debt-equity, interest coverage, proprietary ratio).' },
      { term: 'Profitability ratios', def: 'Measure earnings relative to sales or capital (gross/net margin, ROCE, ROE).' },
      { term: 'Activity / turnover ratios', def: 'Measure how hard assets work to generate sales (inventory, asset and working-capital turnover).' },
      { term: 'Capital employed', def: 'Long-term funds in the business = Shareholders’ equity + Long-term debt (or Total assets − Current liabilities).' },
    ],
    formulas: [
      { name: 'Current Ratio', expr: 'Current Assets ÷ Current Liabilities', note: 'Rule-of-thumb ideal 2 : 1.' },
      { name: 'Quick (Acid-test) Ratio', expr: '(Current Assets − Inventory) ÷ Current Liabilities', note: 'Rule-of-thumb ideal 1 : 1.' },
      { name: 'Debt-Equity Ratio', expr: 'Long-term Debt ÷ Shareholders’ Equity' },
      { name: 'Interest Coverage', expr: 'EBIT ÷ Interest expense', note: 'Higher = more comfortable debt servicing.' },
      { name: 'Gross Profit Margin', expr: '(Sales − COGS) ÷ Sales × 100' },
      { name: 'Net Profit Margin', expr: 'Net Profit (PAT) ÷ Sales × 100' },
      { name: 'Return on Capital Employed', expr: 'EBIT ÷ Capital Employed × 100' },
      { name: 'Return on Equity', expr: 'Net Profit ÷ Shareholders’ Equity × 100' },
      { name: 'Inventory Turnover', expr: 'COGS ÷ Average Inventory (times)' },
    ],
    procedure: {
      heading: 'How to attempt a ratio question',
      steps: [
        { title: 'Pick the figures', detail: 'Identify the exact items the ratio needs from the P&L and balance sheet — be careful with “current” vs “non-current” classification.' },
        { title: 'Use the standard formula', detail: 'Apply the agreed formula. Where averages are available (e.g. average inventory, average debtors), prefer them over closing figures.' },
        { title: 'Express in the right form', detail: 'Liquidity/solvency ratios as “x : 1”, profitability as a %, turnover as “times” (and convert to days where asked = 365 ÷ turnover).' },
        { title: 'Interpret', detail: 'Compare against the ideal, the prior year and the industry. State what the number means for the firm — that is where the marks are.' },
      ],
    },
    examTips: [
      'Show the formula, the substitution and the answer with its unit — examiners award method marks even if the arithmetic slips.',
      'When asked to “comment”, always benchmark: ideal norm, trend, and peer comparison.',
      'Watch the denominator: ROCE uses capital employed, ROE uses equity only — mixing them is the most common error.',
    ],
    pitfalls: [
      'Treating an “ideal” ratio as a target — a very high current ratio can signal idle resources.',
      'Including prepaid expenses in “quick assets” — they are excluded along with inventory.',
      'Comparing ratios of firms using different accounting policies without adjusting.',
    ],
    references: [
      { label: 'Ratio analysis (technical article)', url: 'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f2/technical-articles/ratio-analysis.html', kind: 'official', source: 'ACCA' },
      { label: 'Complete list of financial ratios', url: 'https://corporatefinanceinstitute.com/resources/accounting/financial-ratios/', kind: 'article', source: 'CFI' },
      { label: 'Ratio analysis study note', url: 'https://oer.pressbooks.pub/utsaccounting1/chapter/ratio-analysis/', kind: 'article', source: 'UTS OER' },
    ],
    workedExample: {
      title: 'Computing the core liquidity & profitability ratios',
      problem:
        'A trader reports: Sales ₹10,00,000; Cost of goods sold ₹6,00,000; Current assets ₹4,00,000 (including inventory ₹1,50,000); Current liabilities ₹2,00,000. Find the current ratio, quick ratio and gross profit margin.',
      steps: [
        { label: 'Current ratio = Current Assets ÷ Current Liabilities', formula: '₹4,00,000 ÷ ₹2,00,000', result: '2 : 1' },
        { label: 'Quick ratio = (Current Assets − Inventory) ÷ Current Liabilities', formula: '(₹4,00,000 − ₹1,50,000) ÷ ₹2,00,000', result: '1.25 : 1' },
        { label: 'Gross profit = Sales − COGS', formula: '₹10,00,000 − ₹6,00,000', result: '₹4,00,000' },
        { label: 'Gross profit margin = Gross Profit ÷ Sales × 100', formula: '₹4,00,000 ÷ ₹10,00,000 × 100', result: '40%' },
      ],
      answer:
        'Current ratio 2 : 1 (meets the textbook norm), quick ratio 1.25 : 1 (the firm can cover current dues even without selling stock), and a healthy 40% gross margin.',
    },
    practice: [
      {
        q: 'A firm’s current ratio is 3 : 1 but its quick ratio is 0.8 : 1. What does the gap indicate?',
        answer:
          'A large part of current assets is inventory, which is less liquid. Despite a strong current ratio, immediate liquidity is weak — the firm depends on selling stock to pay its short-term dues.',
      },
      {
        q: 'Which ratio best measures long-term solvency?',
        options: ['Current ratio', 'Debt-equity ratio', 'Inventory turnover', 'Gross profit margin'],
        answer: 'Debt-equity ratio — it compares borrowed funds with owners’ funds, reflecting long-term financial risk.',
      },
      {
        q: 'Why can a very high current ratio actually be a warning sign?',
        answer:
          'It can signal idle cash, excessive or slow-moving inventory, or poor working-capital management — not necessarily financial strength.',
      },
    ],
    calc: 'ratio-analysis',
  },
  {
    id: 'fund-flow',
    title: 'Fund Flow Statement',
    subject: 'Financial Statement Analysis',
    icon: ArrowRightLeft,
    level: 'B.Com Sem 6 · CMA Inter',
    blurb:
      'Track the movement of working capital between two balance-sheet dates — sources, applications and the change in working capital.',
    readingMinutes: 11,
    tags: ['working capital', 'sources and applications', 'funds from operations', 'where got where gone'],
    overview: [
      'A fund flow statement explains the financial changes that occurred between two balance-sheet dates. Here the word “fund” means working capital — the excess of current assets over current liabilities — so the statement answers a single question: why did working capital change over the year?',
      'A “flow of funds” happens only when a transaction touches one current and one non-current account. A transaction wholly within current accounts (collecting from a debtor), or wholly within non-current accounts (converting shares into debentures), changes the form but not the total of working capital — so there is no flow.',
      'Fund flow analysis is built from three linked statements: the Schedule of Changes in Working Capital, the calculation of Funds from Operations (an adjusted profit & loss account), and the Fund Flow Statement itself (sources and applications). It is also called the “Statement of Sources and Application of Funds” or, memorably, the “Where Got, Where Gone” statement.',
    ],
    keyTerms: [
      { term: 'Fund', def: 'In this context, working capital = Current Assets − Current Liabilities.' },
      { term: 'Flow of funds', def: 'Any increase or decrease in working capital caused by a transaction between a current and a non-current account.' },
      { term: 'No flow', def: 'A transaction between two current accounts, or two non-current accounts — it does not change total working capital.' },
      { term: 'Funds from operations', def: 'Trading profit adjusted back for non-fund and non-operating items (e.g. depreciation added back).' },
      { term: 'Sources of funds', def: 'Funds from operations, issue of shares/debentures, long-term loans raised, sale of fixed assets/investments.' },
      { term: 'Applications of funds', def: 'Purchase of fixed assets/investments, repayment of loans, redemption of capital, dividends and tax paid.' },
    ],
    formulas: [
      { name: 'Working Capital', expr: 'Working Capital = Current Assets − Current Liabilities' },
      { name: 'Change in Working Capital', expr: 'Increase in WC = application of funds; Decrease in WC = source of funds' },
      {
        name: 'Funds from Operations',
        expr: 'Net Profit + Non-fund/non-operating debits − Non-operating credits',
        note: 'Add back: depreciation, goodwill/preliminary expenses written off, loss on sale of assets, transfer to reserves, proposed dividend & provision for tax (when treated as appropriations). Deduct: profit on sale of assets, dividend/interest income.',
      },
    ],
    procedure: {
      heading: 'The three-statement method',
      steps: [
        { title: '1 · Schedule of Changes in Working Capital', detail: 'List every current asset and current liability at both dates. An increase in a current asset (or a decrease in a current liability) increases working capital; the opposite decreases it. The net figure is the increase/decrease in working capital.' },
        { title: '2 · Funds from Operations', detail: 'Open an Adjusted P&L Account. Start from the year’s net profit and add back all non-fund and non-operating charges (depreciation, write-offs, loss on sale, proposed dividend, provision for tax); deduct non-operating incomes. The balancing figure is funds from operations.' },
        { title: '3 · Prepare ledger accounts for non-current items', detail: 'Where adjustments are involved (fixed assets, provision for tax, provision for depreciation), open ledger accounts to find the hidden source/application — e.g. fixed assets purchased or sold, tax actually paid.' },
        { title: '4 · Fund Flow Statement', detail: 'List all sources and all applications. The difference between the two equals the increase or decrease in working capital found in step 1 — that cross-check must tie.' },
      ],
    },
    examTips: [
      'Always cross-check: (Total Sources − Total Applications) must equal the change in working capital from the schedule. If it doesn’t, an item is mis-classified.',
      'Decide your treatment of provision for tax and proposed dividend (as a current liability vs an appropriation) and stay consistent — state your assumption.',
      'Depreciation is not a source of funds by itself; it is added back only because it was deducted in arriving at profit.',
    ],
    pitfalls: [
      'Recording a transaction between two current accounts as a “flow” — it is not.',
      'Forgetting to add back proposed dividend / provision for tax when computing funds from operations, then double-counting them as applications.',
      'Confusing fund flow (working-capital basis) with cash flow (cash basis) — they answer different questions.',
    ],
    references: [
      { label: 'Funds flow statement — working capital & FFO (illustrated)', url: 'https://www.futureaccountant.com/funds-flow-cash-flow/study-notes/funds-flow-statement-changes-working-capital-funds-from-operations-adjustments-illustration/f180/', kind: 'article', source: 'FutureAccountant' },
      { label: 'Fund flow statement format & example', url: 'https://www.wallstreetmojo.com/fund-flow-statement-format/', kind: 'article', source: 'WallStreetMojo' },
      { label: 'Fund flow statement & objectives', url: 'https://tallysolutions.com/accounting/fund-flow-statement/', kind: 'article', source: 'Tally' },
    ],
    workedExample: {
      title: 'Schedule of changes in working capital',
      problem:
        'From the current items below, find the change in working capital. Stock ₹50,000 → ₹70,000; Debtors ₹40,000 → ₹50,000; Cash ₹10,000 → ₹5,000; Creditors ₹30,000 → ₹45,000.',
      steps: [
        { label: 'Working capital (Year 1) = Current Assets − Current Liabilities', formula: '(50,000 + 40,000 + 10,000) − 30,000', result: '₹70,000' },
        { label: 'Working capital (Year 2)', formula: '(70,000 + 50,000 + 5,000) − 45,000', result: '₹80,000' },
        { label: 'Change in working capital = WC(Y2) − WC(Y1)', formula: '₹80,000 − ₹70,000', result: 'Increase ₹10,000' },
      ],
      answer:
        'Working capital rose by ₹10,000. An increase in working capital is shown as an application of funds in the fund flow statement — and ties back as the cross-check on the sources vs applications.',
    },
    practice: [
      {
        q: 'Is “cash collected from a debtor” a flow of funds? Why?',
        answer:
          'No. It is a transaction between two current accounts (cash ↑, debtors ↓), so total working capital is unchanged — there is no flow of funds.',
      },
      {
        q: 'An increase in working capital is treated in the fund flow statement as a:',
        options: ['Source of funds', 'Application of funds', 'Non-fund item'],
        answer: 'Application of funds — funds have been tied up in higher working capital.',
      },
      {
        q: 'How is depreciation treated when computing funds from operations, and why?',
        answer:
          'It is added back to net profit. Depreciation is a non-fund (non-cash) charge that reduced profit but did not reduce working capital.',
      },
    ],
    calc: 'fund-flow',
  },
  {
    id: 'cash-flow',
    title: 'Cash Flow Statement (AS 3)',
    subject: 'Financial Statement Analysis',
    icon: Wallet,
    level: 'B.Com · CA/CMA Inter',
    blurb:
      'Classify the year’s cash movements into operating, investing and financing activities under AS 3 — using the indirect method.',
    readingMinutes: 12,
    tags: ['as 3', 'ind as 7', 'operating investing financing', 'indirect method', 'cash equivalents'],
    overview: [
      'A cash flow statement shows what actually happened to a business’s cash and cash equivalents during the year. Under Accounting Standard 3 (AS 3) — and its Ind AS 7 counterpart — cash flows are classified into three activities: operating, investing and financing. This classification lets a reader see how cash was generated and where it went.',
      'Operating activities are the principal revenue-producing activities. Investing activities are the acquisition and disposal of long-term assets and investments. Financing activities change the size and composition of owners’ capital and borrowings. The same transaction is reported in exactly one activity.',
      'The operating section can be prepared two ways. The direct method lists actual cash receipts and payments. The indirect method — the one shown in most Indian B.Com problems — starts from net profit and “de-accrues” it: non-cash and non-operating items are added back or removed, then working-capital changes are adjusted, to arrive at cash from operations. Remember: cash flow is not the same as profit.',
    ],
    keyTerms: [
      { term: 'Cash & cash equivalents', def: 'Cash on hand, demand deposits, and short-term highly liquid investments readily convertible to known amounts of cash with insignificant risk of value change.' },
      { term: 'Operating activities', def: 'Principal revenue-producing activities and others that are not investing or financing — the core of the business.' },
      { term: 'Investing activities', def: 'Purchase and sale of fixed assets and investments; interest and dividend income received.' },
      { term: 'Financing activities', def: 'Issue/redemption of shares and debentures, raising/repaying loans, dividend and interest paid.' },
      { term: 'Indirect method', def: 'Operating cash flow derived by adjusting net profit for non-cash items and working-capital changes.' },
    ],
    formulas: [
      {
        name: 'Operating cash flow (indirect)',
        expr: 'Net profit + non-cash & non-operating charges − non-operating incomes ± working-capital changes − tax paid',
        note: 'Add back depreciation, interest expense, loss on sale, goodwill written off; deduct interest/dividend income and profit on sale. Then add decreases in current assets / increases in current liabilities (and vice-versa).',
      },
      { name: 'Net change in cash', expr: 'Operating CF + Investing CF + Financing CF' },
      { name: 'Closing cash', expr: 'Opening cash & equivalents + Net change in cash' },
    ],
    procedure: {
      heading: 'Indirect-method workflow',
      steps: [
        { title: '1 · Start from net profit', detail: 'Take the profit for the year (closing balance of P&L − opening balance), and add back provision for tax, proposed dividend and transfer to reserves to reach net profit before tax and extraordinary items.' },
        { title: '2 · Adjust non-cash & non-operating items', detail: 'Add back depreciation, interest on borrowings, loss on sale and amounts written off; deduct interest/dividend income and profit on sale of assets. This gives operating profit before working-capital changes.' },
        { title: '3 · Adjust working-capital changes', detail: 'Add a decrease in current assets and an increase in current liabilities; deduct an increase in current assets and a decrease in current liabilities. Then deduct tax paid to get net cash from operating activities.' },
        { title: '4 · Investing activities', detail: 'Inflows: sale of fixed assets/investments, interest & dividend received. Outflows: purchase of fixed assets/investments.' },
        { title: '5 · Financing activities', detail: 'Inflows: issue of shares/debentures, loans raised. Outflows: redemption, repayment of loans, interest paid, dividend paid.' },
        { title: '6 · Reconcile', detail: 'Sum the three activities; add opening cash & equivalents. The total must equal closing cash & equivalents per the balance sheet.' },
      ],
    },
    examTips: [
      'Lay the statement out in the standard three-activity format with sub-totals — presentation carries marks.',
      'Interest and dividend paid are usually financing; interest and dividend received are usually investing — be consistent and state it.',
      'A healthy firm’s cash from operations should normally exceed its net profit over time.',
    ],
    pitfalls: [
      'Adding depreciation as a “source of cash” conceptually — it is added back only to undo its earlier deduction from profit.',
      'Netting purchase and sale of fixed assets — show the gross figures separately under investing.',
      'Confusing the cash flow statement (AS 3, cash basis) with the fund flow statement (working-capital basis).',
    ],
    references: [
      { label: 'AS 3 — Cash Flow Statements', url: 'https://cleartax.in/s/as-3-cash-flow-statements', kind: 'article', source: 'ClearTax' },
      { label: 'AS 3 standard text', url: 'https://www.icai.org/post/accounting-standards', kind: 'official', source: 'ICAI' },
      { label: 'Cash flow statement explained', url: 'https://corporatefinanceinstitute.com/resources/accounting/cash-flow-statement/', kind: 'article', source: 'CFI' },
    ],
    workedExample: {
      title: 'Cash from operating activities (indirect method)',
      problem:
        'Net profit before tax ₹1,00,000. Depreciation ₹20,000; loss on sale of machinery ₹5,000; profit on sale of investments ₹10,000. During the year debtors rose ₹15,000, stock fell ₹12,000 and creditors rose ₹8,000. Tax paid ₹25,000. Find net cash from operating activities.',
      steps: [
        { label: 'Net profit before tax', result: '₹1,00,000' },
        { label: 'Add back non-cash / non-operating items: + Depreciation + Loss on sale − Profit on sale of investments', formula: '1,00,000 + 20,000 + 5,000 − 10,000', result: '₹1,15,000 (operating profit before working-capital changes)' },
        { label: 'Adjust working capital: − Increase in debtors + Decrease in stock + Increase in creditors', formula: '1,15,000 − 15,000 + 12,000 + 8,000', result: '₹1,20,000' },
        { label: 'Less: Tax paid', formula: '1,20,000 − 25,000', result: '₹95,000' },
      ],
      answer: 'Net cash from operating activities = ₹95,000.',
    },
    practice: [
      {
        q: 'Purchase of machinery is classified under which activity?',
        options: ['Operating', 'Investing', 'Financing'],
        answer: 'Investing — it is the acquisition of a long-term asset.',
      },
      {
        q: 'For a non-financial company under AS 3, under which activity is dividend paid shown?',
        answer: 'Financing activity — it is a return to the providers of capital.',
      },
      {
        q: 'Why is depreciation added back in the indirect method?',
        answer:
          'It is a non-cash expense that was deducted in computing profit; adding it back removes its effect to arrive at the cash actually generated.',
      },
    ],
    calc: 'cash-flow',
  },

  /* =================================================== Budgetary Control */
  {
    id: 'cash-budget',
    title: 'Cash Budget',
    subject: 'Budgetary Control',
    icon: CalendarClock,
    level: 'B.Com · BBA · CMA Inter',
    blurb:
      'Forecast month-by-month cash receipts and payments to reveal surpluses, shortfalls and the financing needed to hold a minimum balance.',
    readingMinutes: 10,
    tags: ['receipts and payments', 'collection lag', 'minimum cash balance', 'budgetary control'],
    overview: [
      'A cash budget is an estimate of cash receipts and payments for a future period, usually month by month. It is one of the most practical budgets a business prepares: it shows in advance when cash will be tight and when it will be in surplus, so the firm can arrange a loan before a shortfall or invest idle cash productively.',
      'The most common approach is the receipts-and-payments method: add all expected cash receipts to the opening balance, deduct all expected cash payments, and the remainder is the closing balance — which becomes next month’s opening balance. Only cash items enter the budget; non-cash charges such as depreciation are excluded.',
      'Receipts must be timed using the collection pattern (the “lag”): if 60% of sales are collected in the month of sale, 30% in the next month and 10% in the third, each month’s collection is built from several months’ sales. Payments are timed the same way. Where a minimum cash balance must be maintained, any projected shortfall is met by planned borrowing.',
    ],
    keyTerms: [
      { term: 'Cash receipts', def: 'Cash sales, collections from debtors (per the lag), interest/dividend received, sale of assets, loans raised.' },
      { term: 'Cash payments', def: 'Cash purchases, payments to creditors, wages, overheads (excluding depreciation), capital expenditure, tax, dividend, interest.' },
      { term: 'Collection lag', def: 'The pattern in which credit sales are realised over subsequent months.' },
      { term: 'Minimum cash balance', def: 'The floor the firm wants to keep; a projected dip below it triggers planned financing.' },
      { term: 'Opening / closing balance', def: 'Closing balance = Opening + Receipts − Payments; the closing balance carries forward as next month’s opening.' },
    ],
    formulas: [
      { name: 'Closing cash balance', expr: 'Opening balance + Total receipts − Total payments' },
      { name: 'Collection from credit sales', expr: 'Σ (sales of each prior month × that month’s collection %)', note: 'Apply the given lag pattern; remember cash sales are collected immediately.' },
      { name: 'Financing required', expr: 'Minimum balance − Projected closing balance (if positive, borrow)' },
    ],
    procedure: {
      heading: 'Receipts-and-payments method',
      steps: [
        { title: '1 · Schedule the receipts', detail: 'Split sales into cash and credit. Spread credit collections across months using the lag. Add other cash inflows (interest, asset sales, loans).' },
        { title: '2 · Schedule the payments', detail: 'Time payments to creditors, wages and overheads per their own lags. Add capital expenditure, tax, dividend and interest. Exclude depreciation and any other non-cash item.' },
        { title: '3 · Build the budget month by month', detail: 'For each month: Opening balance + Receipts − Payments = Closing balance. Carry the closing balance to the next month’s opening.' },
        { title: '4 · Apply the minimum-balance rule', detail: 'Where the closing balance falls below the required minimum, show the borrowing needed to restore it (and repay/invest when in surplus).' },
      ],
    },
    examTips: [
      'Prepare the collection and payment schedules as separate workings first — then the main budget falls out neatly.',
      'Never include depreciation, provisions or other non-cash items in a cash budget.',
      'Read the lag carefully: “collected in the month following sale” vs “second month after sale” shifts every figure.',
    ],
    pitfalls: [
      'Including credit sales in the month of sale instead of when cash is actually collected.',
      'Forgetting that opening balance for each month is the previous month’s closing balance.',
      'Mixing the receipts-and-payments method with the adjusted profit & loss method in one answer.',
    ],
    references: [
      { label: 'Cash budget — format & how to prepare', url: 'https://www.wallstreetmojo.com/cash-budget/', kind: 'article', source: 'WallStreetMojo' },
      { label: 'Cash budget (managerial accounting)', url: 'https://courses.lumenlearning.com/wm-managerialaccounting/chapter/cash-budget/', kind: 'article', source: 'Lumen' },
      { label: 'Preparing a cash budget (open text)', url: 'https://oer.pressbooks.pub/utsaccounting1/chapter/prepare-a-cash-budget/', kind: 'article', source: 'UTS OER' },
    ],
    workedExample: {
      title: 'Building the collection (receipts) schedule',
      problem:
        'Sales: Jan ₹1,00,000; Feb ₹1,20,000; Mar ₹1,40,000. Cash sales are 20% of sales (collected at once). Of the 80% credit sales, 60% are collected in the month after sale and 40% in the second month after. Find the cash collected in March.',
      steps: [
        { label: 'Cash sales of March = 20% × March sales', formula: '20% × ₹1,40,000', result: '₹28,000' },
        { label: 'From February credit sales (1 month after) = 60% × (80% × Feb sales)', formula: '60% × ₹96,000', result: '₹57,600' },
        { label: 'From January credit sales (2 months after) = 40% × (80% × Jan sales)', formula: '40% × ₹80,000', result: '₹32,000' },
        { label: 'Total cash collected in March', formula: '₹28,000 + ₹57,600 + ₹32,000', result: '₹1,17,600' },
      ],
      answer: 'Cash collected in March = ₹1,17,600 (this figure then feeds the receipts side of the cash budget).',
    },
    practice: [
      {
        q: 'Should depreciation appear in a cash budget? Why?',
        answer: 'No — it is a non-cash item. A cash budget records only actual cash receipts and payments.',
      },
      {
        q: 'Closing cash balance for a month equals:',
        options: ['Opening + Receipts − Payments', 'Receipts − Payments', 'Opening + Payments − Receipts'],
        answer: 'Opening + Receipts − Payments. The closing balance carries forward as next month’s opening balance.',
      },
      {
        q: 'Credit sales are collected 50% in the next month and 50% the month after. When is January’s credit sale realised?',
        answer: 'Half in February and half in March.',
      },
    ],
    calc: 'cash-budget',
  },
  {
    id: 'flexible-budget',
    title: 'Flexible Budget',
    subject: 'Budgetary Control',
    icon: SlidersHorizontal,
    level: 'B.Com · BBA · CMA Inter',
    blurb:
      'Restate a budget at different activity levels by splitting costs into fixed, variable and semi-variable — using the high-low method.',
    readingMinutes: 9,
    tags: ['cost behaviour', 'high-low method', 'semi-variable', 'capacity', 'fixed variable cost'],
    overview: [
      'A fixed budget is drawn for a single level of activity; if actual output differs, comparison becomes meaningless. A flexible budget solves this by recognising cost behaviour — it can be prepared for any level of activity because it knows which costs change with output and which do not.',
      'Costs are classified into three types. Fixed costs (rent, salaries, depreciation) stay constant in total regardless of output. Variable costs (materials, wages) change in direct proportion to output. Semi-variable (mixed) costs (power, maintenance) have both a fixed and a variable element and must be split before the budget can flex.',
      'The standard tool for splitting a semi-variable cost is the high-low method: take the highest and lowest activity levels, and because fixed cost is unchanged between them, the difference in total cost must be entirely variable. That gives the variable cost per unit; the fixed portion is then found by back-substitution.',
    ],
    keyTerms: [
      { term: 'Fixed cost', def: 'Constant in total over a range of activity; per-unit fixed cost falls as output rises.' },
      { term: 'Variable cost', def: 'Changes in total in direct proportion to activity; per-unit variable cost is constant.' },
      { term: 'Semi-variable (mixed) cost', def: 'Contains both a fixed and a variable component (e.g. a standing charge plus a usage charge).' },
      { term: 'Activity level / capacity', def: 'The output, often expressed as a % of full capacity or in units/hours, at which the budget is drawn.' },
      { term: 'High-low method', def: 'A technique that uses the highest and lowest activity observations to separate a semi-variable cost into its fixed and variable parts.' },
    ],
    formulas: [
      {
        name: 'Variable cost per unit (high-low)',
        expr: '(Cost at high level − Cost at low level) ÷ (Units at high level − Units at low level)',
      },
      { name: 'Fixed cost', expr: 'Total cost at a level − (Variable cost per unit × Units at that level)' },
      { name: 'Budgeted cost at any level', expr: 'Fixed cost + (Variable cost per unit × Units at that level)' },
    ],
    procedure: {
      heading: 'Preparing a flexible budget',
      steps: [
        { title: '1 · Classify every cost', detail: 'Mark each cost as fixed, variable or semi-variable based on how it behaves with output.' },
        { title: '2 · Split the semi-variable costs', detail: 'Use the high-low method (or the given % of variability) to separate each mixed cost into its fixed and variable parts.' },
        { title: '3 · Restate at each required level', detail: 'For every activity level asked: keep fixed costs unchanged, scale variable costs by the new output, and add the two parts of each semi-variable cost.' },
        { title: '4 · Total and (if asked) find profit', detail: 'Sum the costs at each level; where sales are given, deduct total cost from sales to forecast profit at that level.' },
      ],
    },
    examTips: [
      'State per-unit variable cost and total fixed cost clearly as separate workings before building the columns.',
      'Per-unit fixed cost changes with volume — never assume the per-unit total cost is constant.',
      'When a question gives “% variable” for each cost, split it directly: variable part = cost × %, fixed part = the remainder.',
    ],
    pitfalls: [
      'Scaling fixed costs up or down with activity — they stay constant in total within the relevant range.',
      'Forgetting to add back the fixed element of a semi-variable cost after computing its variable part.',
      'Using total cost (instead of the change in cost) in the high-low numerator.',
    ],
    references: [
      { label: 'High-low method — definition & formula', url: 'https://corporatefinanceinstitute.com/resources/accounting/high-low-method/', kind: 'article', source: 'CFI' },
      { label: 'Flexible budgets (managerial accounting)', url: 'https://biz.libretexts.org/Bookshelves/Accounting/Managerial_Accounting_(OpenStax)/07%3A_Budgeting', kind: 'article', source: 'LibreTexts' },
    ],
    workedExample: {
      title: 'Splitting a semi-variable cost with the high-low method',
      problem:
        'At 100% capacity (1,000 units) sales expenses are ₹38,000; at 60% capacity (600 units) they are ₹30,000. Find the sales expenses budgeted at 80% capacity (800 units).',
      source: 'Past exam — T.Y.B.Com (April 2014)',
      steps: [
        { label: 'Variable cost per unit = (Cost at high − Cost at low) ÷ (Units at high − Units at low)', formula: '(38,000 − 30,000) ÷ (1,000 − 600)', result: '₹20 per unit' },
        { label: 'Fixed cost = Total cost − (Variable per unit × Units)', formula: '38,000 − (20 × 1,000)', result: '₹18,000' },
        { label: 'Sales expenses at 800 units = Fixed + (Variable per unit × Units)', formula: '18,000 + (20 × 800)', result: '₹34,000' },
      ],
      answer: 'Budgeted sales expenses at 80% capacity = ₹34,000 (fixed ₹18,000 + variable ₹16,000).',
    },
    practice: [
      {
        q: 'As output rises, the fixed cost per unit:',
        options: ['Rises', 'Falls', 'Stays constant'],
        answer: 'Falls — the constant total fixed cost is spread over more units.',
      },
      {
        q: 'Why is a fixed budget poor for judging performance when actual output differs from plan?',
        answer:
          'It is set for a single activity level; comparing it with actuals at a different level is misleading. A flexible budget first restates costs to the actual level.',
      },
      {
        q: 'Maintenance cost is ₹5,000 at 600 units and ₹5,600 at 1,000 units. Find the variable cost per unit (high-low).',
        answer: '(5,600 − 5,000) ÷ (1,000 − 600) = ₹1.50 per unit.',
      },
    ],
    calc: 'flexible-budget',
  },

  /* ============================================================ Cost Accounting */
  {
    id: 'unit-costing',
    title: 'Cost Sheet (Unit Costing)',
    subject: 'Cost Accounting',
    icon: FileSpreadsheet,
    level: 'B.Com · BBA · CA/CMA Foundation',
    blurb:
      'Assemble the total cost of output stage by stage — prime cost, works cost, cost of production and cost of sales — and read off the cost per unit.',
    readingMinutes: 10,
    tags: ['cost sheet', 'cost statement', 'prime cost', 'works cost', 'cost of production', 'cost of sales', 'tender', 'output costing'],
    overview: [
      'A cost sheet (or cost statement) is a statement prepared periodically that sets out, in a logical sequence, the various elements of cost of a product or service. It does more than show the total cost: it builds the cost up in stages — prime cost, works cost, cost of production and cost of sales — so management can see exactly where money is being spent and control each element.',
      'The elements of cost are first classified as direct or indirect. Direct material, direct labour and direct expenses can be traced to the product and together form the prime cost. Indirect costs — overheads — are grouped by function into factory, administration, and selling & distribution overheads, and are added in that order.',
      'The cost sheet is the basis for fixing selling prices and quoting tenders. Because it builds cost in stages, it also lets a firm value closing stocks of raw material, work-in-progress and finished goods consistently, and compare cost per unit period to period.',
    ],
    keyTerms: [
      { term: 'Direct cost', def: 'A cost that can be conveniently identified with a particular product, job or process (direct material, direct wages, direct/chargeable expenses).' },
      { term: 'Prime cost', def: 'The total of all direct costs = direct material + direct wages + direct expenses.' },
      { term: 'Overhead', def: 'The total of indirect material, indirect labour and indirect expenses; grouped as factory, office/administration and selling & distribution overheads.' },
      { term: 'Works (factory) cost', def: 'Prime cost + factory overheads, after adjusting opening and closing work-in-progress.' },
      { term: 'Cost of production', def: 'Works cost + office & administration overheads.' },
      { term: 'Cost of sales', def: 'Cost of goods sold + selling & distribution overheads; Sales − Cost of sales = Profit.' },
    ],
    formulas: [
      { name: 'Materials consumed', expr: 'Opening stock + Purchases + Carriage inward − Returns − Closing stock' },
      { name: 'Prime Cost', expr: 'Direct material + Direct wages + Direct expenses' },
      { name: 'Works (Factory) Cost', expr: 'Prime cost + Factory overheads + Opening WIP − Closing WIP' },
      { name: 'Cost of Production', expr: 'Works cost + Office & administration overheads' },
      { name: 'Cost of Goods Sold', expr: 'Cost of production + Opening finished goods − Closing finished goods' },
      { name: 'Cost of Sales', expr: 'Cost of goods sold + Selling & distribution overheads' },
      { name: 'Profit', expr: 'Sales − Cost of sales', note: 'A negative figure is a loss.' },
    ],
    procedure: {
      heading: 'Building the cost sheet',
      steps: [
        { title: '1 · Direct material consumed', detail: 'Opening raw material + purchases + carriage inward − purchase returns − closing raw material. Carriage/freight on incoming material is part of material cost.' },
        { title: '2 · Add direct wages & direct expenses → Prime Cost', detail: 'Direct wages are paid to workers who convert material into product; direct expenses are chargeable expenses such as hire of special plant or royalty on output.' },
        { title: '3 · Add factory overheads, adjust WIP → Works Cost', detail: 'Indirect factory costs (factory rent, power, depreciation of plant, works manager’s salary). Add opening WIP and subtract closing WIP, both valued at works cost.' },
        { title: '4 · Add administration overheads → Cost of Production', detail: 'Office salaries, office rent, directors’ remuneration, legal and audit fees.' },
        { title: '5 · Adjust finished goods, add selling & distribution OH → Cost of Sales', detail: 'Finished-goods stock is valued at cost of production. Then add advertisement, salesmen’s salaries, showroom rent, carriage outward.' },
        { title: '6 · Compare with sales → Profit', detail: 'Sales − Cost of sales = profit (or loss). Per-unit figures = stage total ÷ units produced.' },
      ],
    },
    examTips: [
      'Keep purely financial items OUT of the cost sheet: interest, income tax, dividends, donations, profit/loss on sale of assets, and writing-off goodwill or preliminary expenses.',
      'Adjust each stock at the stage where it is valued — raw material before prime cost, WIP at works cost, finished goods at cost of production. Mixing them up is the classic error.',
      'Carriage inward is a factory/material cost; carriage outward is a selling & distribution cost — never interchange them.',
    ],
    pitfalls: [
      'Putting office or selling overheads into factory cost (or vice-versa) — it distorts every sub-total below it.',
      'Forgetting the stock adjustments, or applying a finished-goods adjustment at prime-cost stage.',
      'Including non-cost financial items, which inflates cost and understates profit.',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Unit 2 (Cost Concepts & Cost Sheet)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Cost sheet — format, elements & examples', url: 'https://www.accountingnotes.net/cost-accounting/cost-sheet/cost-sheet-meaning-format-and-examples/16013', kind: 'article', source: 'Accounting Notes' },
      { label: 'Cost sheet format & components', url: 'https://cleartax.in/s/cost-sheet', kind: 'article', source: 'ClearTax' },
    ],
    workedExample: {
      title: 'Preparing a cost sheet (Arora, Illustration 2.2)',
      problem:
        'For the month of January: Direct material ₹57,000; Direct wages ₹28,500; Factory rent & rates ₹2,500; Plant repairs ₹1,000; Plant depreciation ₹1,250; Factory heating & lighting ₹400; Factory manager’s salary ₹2,000; Office salaries ₹1,600; Director’s remuneration ₹1,500; Telephone & postage ₹200; Office rent & rates ₹500; Printing & stationery ₹100; Legal charges ₹150; Advertisement ₹1,500; Salesmen’s salaries ₹2,500; Showroom rent ₹500; Sales ₹1,16,000. Prepare the cost sheet.',
      steps: [
        { label: 'Prime Cost = Direct material + Direct wages', formula: '₹57,000 + ₹28,500', result: '₹85,500' },
        { label: 'Factory overheads', formula: '2,500 + 1,000 + 1,250 + 400 + 2,000', result: '₹7,150' },
        { label: 'Works Cost = Prime cost + Factory OH', formula: '₹85,500 + ₹7,150', result: '₹92,650' },
        { label: 'Administration overheads', formula: '1,600 + 1,500 + 200 + 500 + 100 + 150', result: '₹4,050' },
        { label: 'Cost of Production = Works cost + Admin OH', formula: '₹92,650 + ₹4,050', result: '₹96,700' },
        { label: 'Selling & distribution overheads', formula: '1,500 + 2,500 + 500', result: '₹4,500' },
        { label: 'Cost of Sales = Cost of production + S&D OH', formula: '₹96,700 + ₹4,500', result: '₹1,01,200' },
        { label: 'Profit = Sales − Cost of sales', formula: '₹1,16,000 − ₹1,01,200', result: '₹14,800' },
      ],
      answer: 'Prime cost ₹85,500 · Works cost ₹92,650 · Cost of production ₹96,700 · Cost of sales ₹1,01,200 · Profit ₹14,800 (12.76% of sales).',
      source: 'M.N. Arora, Cost Accounting, Illustration 2.2',
    },
    practice: [
      {
        q: 'Where is carriage inward shown in a cost sheet, and where is carriage outward?',
        answer:
          'Carriage inward is added to the cost of materials purchased (material cost). Carriage outward is a selling & distribution overhead, added after cost of production.',
      },
      {
        q: 'Which of these is NOT included in a cost sheet?',
        options: ['Factory rent', 'Income tax', 'Direct wages', 'Advertisement'],
        answer: 'Income tax — it is a financial (appropriation) item, excluded from cost. So are interest, dividends and donations.',
      },
      {
        q: 'Closing stock of finished goods is valued at which figure?',
        answer:
          'At cost of production per unit — because that is the cost at which goods are completed and transferred to the finished-goods store.',
      },
    ],
    calc: 'cost-sheet',
  },
  {
    id: 'material-control',
    title: 'Material Control — EOQ & Stock Levels',
    subject: 'Cost Accounting',
    icon: PackageSearch,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Order the most economical quantity and set scientific re-order, minimum, maximum and danger stock levels to avoid both stock-outs and locked-up capital.',
    readingMinutes: 11,
    tags: ['eoq', 'economic order quantity', 'reorder level', 'minimum level', 'maximum level', 'danger level', 'stock control', 'inventory'],
    overview: [
      'Material is often the largest element of cost, so controlling it is central to cost control. Two opposing dangers must be balanced: over-stocking locks up capital and risks obsolescence, while under-stocking risks stoppage of production. Scientific stock control sets quantity levels for each item so it is automatically held within sensible limits.',
      'The Economic Order Quantity (EOQ) answers “how much to order at a time”. Ordering many small lots raises ordering cost but cuts carrying cost; ordering a few large lots does the reverse. The EOQ is the order size at which the total of ordering and carrying cost is the lowest — and at that point the two costs are equal.',
      'Stock levels answer “when to order” and “between what limits to hold”. The re-order level triggers a fresh purchase; the minimum level is a safety floor; the maximum level is a ceiling that prevents over-investment; the danger level signals that only urgent issues should be made.',
    ],
    keyTerms: [
      { term: 'Ordering cost', def: 'Cost of placing and processing an order — stationery, receiving, inspection, salaries of the buying staff.' },
      { term: 'Carrying (holding) cost', def: 'Cost of holding stock — storage, insurance, interest on capital locked up, deterioration and obsolescence.' },
      { term: 'Economic Order Quantity', def: 'The order size that minimises the total of ordering and carrying cost.' },
      { term: 'Lead time', def: 'The time between raising an order and receiving the material.' },
      { term: 'Re-order level', def: 'The stock level at which a fresh purchase requisition is raised.' },
      { term: 'Danger level', def: 'A level below the minimum at which normal issues stop and material is issued only for urgent jobs.' },
    ],
    formulas: [
      { name: 'Economic Order Quantity', expr: 'EOQ = √(2 × A × O ÷ Cₕ)', note: 'A = annual consumption, O = ordering cost per order, Cₕ = carrying cost per unit per annum.' },
      { name: 'Carrying cost per unit', expr: 'Cₕ = Cost per unit × Carrying % (when given as a % of value)' },
      { name: 'Re-order level', expr: 'Maximum usage × Maximum lead time' },
      { name: 'Minimum level', expr: 'Re-order level − (Normal usage × Average lead time)' },
      { name: 'Maximum level', expr: 'Re-order level + Re-order quantity − (Minimum usage × Minimum lead time)' },
      { name: 'Average stock level', expr: '½ (Minimum level + Maximum level)  —  or  Minimum level + ½ Re-order quantity' },
      { name: 'Danger level', expr: 'Normal usage × Emergency lead time' },
    ],
    procedure: {
      heading: 'Setting EOQ and stock levels',
      steps: [
        { title: '1 · Gather the data', detail: 'Annual consumption, ordering cost per order and carrying cost (per unit, or as a % of unit value). For levels: minimum/normal/maximum usage and lead time, and the re-order (EOQ) quantity.' },
        { title: '2 · Compute EOQ', detail: 'Apply EOQ = √(2AO ÷ Cₕ). Verify by checking that at the EOQ, total ordering cost ≈ total carrying cost.' },
        { title: '3 · Re-order level', detail: 'Maximum usage × maximum lead time — the worst-case demand over the longest delay, so stock never runs out before fresh supply arrives.' },
        { title: '4 · Minimum & maximum levels', detail: 'Minimum = ROL − (normal usage × average lead time). Maximum = ROL + ROQ − (minimum usage × minimum lead time).' },
        { title: '5 · Average & danger levels', detail: 'Average = ½(min + max). Danger = normal usage × emergency (top-priority) lead time.' },
      ],
    },
    examTips: [
      'Keep usage and lead time in the SAME period units (both per week, or both per month) before multiplying.',
      'At the EOQ, ordering cost equals carrying cost — a quick way to self-check your answer.',
      'For maximum level use minimum usage × minimum lead time (the best case leaves the most stock); for re-order level use maximum usage × maximum lead time (the worst case).',
    ],
    pitfalls: [
      'Mixing the carrying cost as a percentage with the carrying cost per unit — convert to ₹ per unit first (unit cost × %).',
      'Using average rather than maximum figures for the re-order level (or vice-versa for the maximum level).',
      'Forgetting that EOQ assumes constant demand, price and ordering cost — quantity discounts can shift the economic size.',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Unit 3 (Material Cost Control)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Economic order quantity (EOQ) — formula & meaning', url: 'https://corporatefinanceinstitute.com/resources/accounting/economic-order-quantity-eoq/', kind: 'article', source: 'CFI' },
      { label: 'Stock levels — re-order, minimum, maximum, danger', url: 'https://www.accountingnotes.net/cost-accounting/material-control/levels-of-stock/16125', kind: 'article', source: 'Accounting Notes' },
    ],
    workedExample: {
      title: 'EOQ and stock levels (Arora, Illustrations 3.1 & 3.2)',
      problem:
        'EOQ: annual requirement 600 units, cost per unit ₹20, ordering cost ₹12 per order, carrying cost 20% of average inventory. Stock levels for material A: minimum usage 50, normal usage 100, maximum usage 150 units per week; re-order quantity 600 units; delivery (lead) time 4 to 6 weeks. Find the EOQ and the stock levels.',
      steps: [
        { label: 'Carrying cost per unit = 20% × ₹20', result: '₹4 per unit p.a.' },
        { label: 'EOQ = √(2 × A × O ÷ Cₕ)', formula: '√(2 × 600 × 12 ÷ 4) = √3,600', result: '60 units' },
        { label: 'Re-order level = Max usage × Max lead time', formula: '150 × 6', result: '900 units' },
        { label: 'Minimum level = ROL − (Normal usage × Avg lead time)', formula: '900 − (100 × 5)', result: '400 units' },
        { label: 'Maximum level = ROL + ROQ − (Min usage × Min lead time)', formula: '900 + 600 − (50 × 4)', result: '1,300 units' },
        { label: 'Average stock level = ½ (Min + Max)', formula: '½ (400 + 1,300)', result: '850 units' },
      ],
      answer: 'EOQ 60 units. Material A: re-order level 900, minimum 400, maximum 1,300, average 850 units.',
      source: 'M.N. Arora, Cost Accounting, Illustrations 3.1 & 3.2',
    },
    practice: [
      {
        q: 'At the economic order quantity, what is the relationship between ordering cost and carrying cost?',
        answer: 'They are equal. The EOQ is the point at which their total is minimised, and the two cost curves cross.',
      },
      {
        q: 'If annual demand quadruples (×4), what happens to the EOQ?',
        answer:
          'EOQ rises with the square root of demand, so it doubles (√4 = 2), not quadruples. The same logic applies to ordering cost.',
      },
      {
        q: 'Why is the maximum level computed using minimum usage and minimum lead time?',
        answer:
          'Because the highest stock occurs in the best case — slowest consumption during the shortest delay — when fresh supply arrives with the most old stock still on hand.',
      },
    ],
    calc: 'eoq-stock-levels',
  },
  {
    id: 'labour-costing',
    title: 'Labour Cost — Wage Systems & Turnover',
    subject: 'Cost Accounting',
    icon: Users,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Compute earnings under time, piece and the Halsey & Rowan premium-bonus plans, and measure labour turnover by the separation, replacement and flux methods.',
    readingMinutes: 11,
    tags: ['labour cost', 'halsey', 'rowan', 'incentive', 'premium bonus', 'time rate', 'piece rate', 'labour turnover', 'separation', 'flux'],
    overview: [
      'Labour is the second major element of cost. Its control has two sides: paying workers in a way that rewards efficiency (the method of remuneration), and keeping the workforce stable (controlling labour turnover).',
      'The two basic methods are time rate (pay for hours worked — secure but no incentive to be quick) and piece rate (pay per unit produced — strong incentive but no security and a risk to quality). Premium-bonus plans blend the two: they guarantee time wages and add a bonus for time saved, sharing the gain between worker and employer. The best-known are the Halsey plan (bonus = 50% of time saved) and the Rowan plan (bonus proportionate to the time saved).',
      'Labour turnover is the rate at which workers leave and are replaced. Some turnover is normal, but a high rate is costly — recruitment, training, lower productivity of new hires and spoilage. It is measured by the separation, replacement or flux method, and one method should be used consistently for comparison.',
    ],
    keyTerms: [
      { term: 'Time rate system', def: 'Wages = hours worked × rate per hour. Guarantees pay but gives no direct incentive to produce more.' },
      { term: 'Piece rate system', def: 'Wages = units produced × rate per unit. Rewards output but offers no security and may hurt quality.' },
      { term: 'Time saved', def: 'Standard (allowed) time − actual time taken. Premium-bonus plans pay a bonus only when time is saved.' },
      { term: 'Halsey plan', def: 'Guaranteed time wages + 50% of (time saved × rate). The other 50% of the saving stays with the employer.' },
      { term: 'Rowan plan', def: 'Guaranteed time wages + (time saved ÷ standard time) × time wages. The bonus can never exceed the time wages.' },
      { term: 'Labour turnover', def: 'The rate of change in the composition of the workforce over a period, expressed as a percentage.' },
    ],
    formulas: [
      { name: 'Time wages', expr: 'Actual time × Rate per hour' },
      { name: 'Halsey bonus', expr: '50% × (Time saved × Rate)', note: 'Halsey–Weir uses 30% instead of 50%.' },
      { name: 'Halsey earnings', expr: 'Time wages + Halsey bonus' },
      { name: 'Rowan bonus', expr: '(Time saved ÷ Standard time) × Time wages' },
      { name: 'Rowan earnings', expr: 'Time wages + Rowan bonus' },
      { name: 'Separation rate', expr: 'Separations ÷ Average workers × 100' },
      { name: 'Replacement rate', expr: 'Replacements ÷ Average workers × 100' },
      { name: 'Flux rate', expr: '(Separations + Replacements) ÷ Average workers × 100' },
    ],
    procedure: {
      heading: 'Incentive earnings & turnover',
      steps: [
        { title: '1 · Find the time saved', detail: 'Time saved = standard (allowed) time − actual time. If none is saved, only the guaranteed time wages are paid.' },
        { title: '2 · Time wages', detail: 'Actual time × rate per hour — the guaranteed floor under both Halsey and Rowan.' },
        { title: '3 · Halsey bonus & earnings', detail: 'Bonus = 50% of (time saved × rate). Earnings = time wages + bonus.' },
        { title: '4 · Rowan bonus & earnings', detail: 'Bonus = (time saved ÷ standard time) × time wages. Earnings = time wages + bonus.' },
        { title: '5 · Labour turnover', detail: 'Average workers = (opening + closing) ÷ 2. Then apply the separation, replacement and flux formulas. Exclude expansion hires from these rates.' },
      ],
    },
    examTips: [
      'Bonus accrues only on time SAVED. If the worker takes the standard time or longer, both plans simply pay the guaranteed time wages.',
      'Halsey gives the bigger bonus when more than half the time is saved; Rowan gives the bigger bonus when less than half is saved (and caps the bonus at 100% of time wages).',
      'In turnover, workers hired for an expansion programme are NOT replacements — exclude them from the separation, replacement and flux rates; count them only in accessions.',
    ],
    pitfalls: [
      'Calculating bonus on actual time or on standard time instead of on time saved.',
      'Using the wrong base for the Rowan bonus — it is a proportion of the time wages (actual time × rate), not of the standard wages.',
      'Including expansion recruitment in the replacement or flux rate, which overstates turnover.',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Unit 5 (Labour Cost Control)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Halsey & Rowan premium bonus plans (illustrated)', url: 'https://www.accountingnotes.net/cost-accounting/labour-cost/incentive-plans/incentive-plans-of-wage-payment/16290', kind: 'article', source: 'Accounting Notes' },
      { label: 'Labour turnover — meaning, methods & cost', url: 'https://www.yourarticlelibrary.com/cost-accounting/labour-turnover/labour-turnover-meaning-causes-and-effects/53129', kind: 'article', source: 'Article Library' },
    ],
    workedExample: {
      title: 'Halsey & Rowan earnings; labour turnover (Arora, Unit 5)',
      problem:
        'Wages: standard time 50 hours, actual time taken 42 hours, rate ₹3 per hour. Compute earnings under the Halsey and Rowan plans. Turnover: workers at the beginning 900, at the end 1,100; during the month 50 workers left and 150 were recruited, of whom 25 filled vacancies and 125 were for expansion. Compute the separation, replacement and flux rates.',
      steps: [
        { label: 'Time saved = 50 − 42', result: '8 hours' },
        { label: 'Time wages = 42 × ₹3', result: '₹126' },
        { label: 'Halsey: bonus = 50% × (8 × ₹3)', formula: '₹126 + ₹12', result: '₹138' },
        { label: 'Rowan: bonus = (8 ÷ 50) × ₹126', formula: '₹126 + ₹20.16', result: '₹146.16' },
        { label: 'Average workers = (900 + 1,100) ÷ 2', result: '1,000' },
        { label: 'Separation rate = 50 ÷ 1,000 × 100', result: '5%' },
        { label: 'Replacement rate = 25 ÷ 1,000 × 100', result: '2.5%' },
        { label: 'Flux rate = (50 + 25) ÷ 1,000 × 100', result: '7.5%' },
      ],
      answer: 'Halsey earnings ₹138, Rowan earnings ₹146.16. Turnover — separation 5%, replacement 2.5%, flux 7.5%.',
      source: 'M.N. Arora, Cost Accounting, Unit 5 (Illustration 5.1 & wage examples)',
    },
    practice: [
      {
        q: 'A worker saves 60% of the standard time. Will Halsey or Rowan give the higher bonus?',
        answer:
          'Halsey. When more than 50% of the time is saved, the Halsey 50%-of-saving bonus exceeds the Rowan proportionate bonus. Below 50% saved, Rowan pays more.',
      },
      {
        q: 'Standard time 10 h, actual 8 h, rate ₹5. Find the Rowan bonus.',
        answer: 'Time saved 2 h; time wages = 8 × 5 = ₹40; bonus = (2 ÷ 10) × 40 = ₹8. Earnings ₹48.',
      },
      {
        q: 'Why are workers recruited for an expansion programme excluded from the labour-turnover rate?',
        answer:
          'They do not replace anyone who left — they are additions to the workforce, not a change in its composition due to separation. They appear only in the accession figures.',
      },
    ],
    calc: 'wage-systems',
  },
  {
    id: 'overhead-costing',
    title: 'Overhead Absorption',
    subject: 'Cost Accounting',
    icon: Layers,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Spread indirect costs onto products — allocation, apportionment, the six absorption methods (incl. machine-hour rate), and under-/over-absorption.',
    readingMinutes: 11,
    tags: ['overhead', 'absorption', 'machine hour rate', 'apportionment', 'under absorption', 'over absorption', 'recovery rate'],
    overview: [
      'Overheads are the indirect costs — indirect material, indirect labour and indirect expenses — that cannot be traced to a single product. Because they are shared, they must be spread fairly across cost units in three steps: allocation, apportionment, and absorption.',
      'Allocation charges a whole cost item to one department (e.g. a department’s own supervisor’s salary). Apportionment splits a shared cost across departments on an equitable basis (rent on floor area, power on machine kW-hours). Service-department costs are then re-apportioned to production departments (secondary distribution).',
      'Finally, each production department’s overhead is absorbed into the cost units passing through it using a predetermined rate. Six rates are common; the machine-hour rate suits machine-intensive work, the labour-hour rate suits labour-intensive work. Because the rate is set in advance, the amount absorbed rarely equals the actual overhead — the gap is under- or over-absorption.',
    ],
    keyTerms: [
      { term: 'Allocation', def: 'Charging an entire item of overhead to a single cost centre that wholly incurred it.' },
      { term: 'Apportionment', def: 'Splitting a shared overhead across cost centres on an equitable basis (area, value, headcount).' },
      { term: 'Absorption', def: 'Charging a department’s overhead to the cost units passing through it via a predetermined rate.' },
      { term: 'Machine-hour rate', def: 'Overhead ÷ machine hours; used where work is machine-paced.' },
      { term: 'Under-absorption', def: 'Actual overhead exceeds the amount absorbed — costs under-recovered.' },
      { term: 'Over-absorption', def: 'Absorbed overhead exceeds the actual — costs over-recovered.' },
    ],
    formulas: [
      { name: '% of direct material', expr: 'Overheads ÷ Direct material cost × 100' },
      { name: '% of direct labour', expr: 'Overheads ÷ Direct labour cost × 100' },
      { name: '% of prime cost', expr: 'Overheads ÷ Prime cost × 100' },
      { name: 'Labour-hour rate', expr: 'Overheads ÷ Direct labour hours' },
      { name: 'Machine-hour rate', expr: 'Overheads ÷ Machine hours' },
      { name: 'Rate per unit', expr: 'Overheads ÷ Units produced' },
      { name: 'Under-/over-absorption', expr: 'Actual overhead − Absorbed overhead', note: 'Absorbed = predetermined rate × actual base. Positive = under-absorbed.' },
    ],
    procedure: {
      heading: 'Overhead distribution & absorption',
      steps: [
        { title: '1 · Primary distribution', detail: 'Allocate and apportion all overheads to production and service departments on equitable bases.' },
        { title: '2 · Secondary distribution', detail: 'Re-apportion service-department costs to production departments (step-ladder or, for mutual services, simultaneous-equation/repeated-distribution).' },
        { title: '3 · Compute the absorption rate', detail: 'For each production department, rate = department overhead ÷ chosen base (machine hours, labour hours, etc.). Pick the base that drives the overhead.' },
        { title: '4 · Absorb into cost units', detail: 'Overhead absorbed = rate × actual units of the base in the job/unit.' },
        { title: '5 · Under-/over-absorption', detail: 'Compare actual overhead with absorbed. Clear the difference to the costing P&L, or use a supplementary rate if large and due to normal causes.' },
      ],
    },
    examTips: [
      'Use a predetermined (budgeted ÷ budgeted) rate — that is exactly why under-/over-absorption arises.',
      'Match the base to the cost driver: a machine shop → machine-hour rate; an assembly line → labour-hour rate. The % methods ignore time and can mislead.',
      'Under-absorption due to abnormal idle capacity is written off to P&L; if due to normal fluctuations, a supplementary rate may be used to adjust cost.',
    ],
    pitfalls: [
      'Confusing allocation (whole item, one department) with apportionment (split on a basis).',
      'Forgetting to re-apportion service-department costs before striking the absorption rate.',
      'Treating over-absorption as profit — it is merely a recovery of cost that must be adjusted.',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Unit 6 (Overhead Cost Control)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Overhead absorption rate — methods', url: 'https://www.accountingnotes.net/cost-accounting/overheads/absorption-of-overheads/16413', kind: 'article', source: 'Accounting Notes' },
      { label: 'Absorption costing & overheads', url: 'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f2/technical-articles/absorption-costing.html', kind: 'official', source: 'ACCA' },
    ],
    workedExample: {
      title: 'Absorption rates & under-absorption (Arora §6.4 / §6.6)',
      problem:
        'Budgeted production overheads ₹40,000; direct material ₹2,00,000; direct labour ₹1,00,000 (prime cost ₹3,00,000); direct labour hours 2,500; machine hours 2,000; units 1,000. Actual overhead incurred ₹42,000 against 2,000 actual machine hours. Find the absorption rates and the under-/over-absorption on a machine-hour basis.',
      steps: [
        { label: '% of direct material', formula: '₹40,000 ÷ ₹2,00,000 × 100', result: '20%' },
        { label: '% of direct labour', formula: '₹40,000 ÷ ₹1,00,000 × 100', result: '40%' },
        { label: 'Machine-hour rate', formula: '₹40,000 ÷ 2,000', result: '₹20 per hour' },
        { label: 'Overhead absorbed', formula: '₹20 × 2,000 actual hours', result: '₹40,000' },
        { label: 'Under-absorption', formula: '₹42,000 actual − ₹40,000 absorbed', result: '₹2,000 under-absorbed' },
      ],
      answer: 'Rates: 20% of material, 40% of labour, ₹20 machine-hour. Absorbed ₹40,000 vs actual ₹42,000 → ₹2,000 under-absorbed, charged to the costing P&L.',
      source: 'M.N. Arora, Cost Accounting, Unit 6 (§6.4 & §6.6)',
    },
    practice: [
      {
        q: 'Why does under-/over-absorption arise at all?',
        answer: 'Because overheads are absorbed on a predetermined rate (budgeted ÷ budgeted). Actual overhead and actual activity differ from budget, so the absorbed amount rarely equals the actual.',
      },
      {
        q: 'A machine shop with little direct labour should use which absorption base?',
        options: ['% of direct labour', 'Machine-hour rate', '% of direct material', 'Rate per unit'],
        answer: 'Machine-hour rate — overhead is driven by machine running time, not labour.',
      },
      {
        q: 'Absorbed overhead ₹50,000; actual ₹46,000. Under- or over-absorbed, and by how much?',
        answer: 'Over-absorbed by ₹4,000 (absorbed exceeds actual) — the excess is credited back / adjusted.',
      },
    ],
    calc: 'overhead-absorption',
  },
  {
    id: 'job-batch-costing',
    title: 'Job & Batch Costing',
    subject: 'Cost Accounting',
    icon: ClipboardList,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Cost a one-off job on a job cost card and quote a cost-plus price; for repeated lots, find the Economic Batch Quantity.',
    readingMinutes: 9,
    tags: ['job costing', 'batch costing', 'ebq', 'economic batch quantity', 'job cost sheet', 'quotation', 'specific order costing'],
    overview: [
      'Job costing and batch costing are forms of specific-order costing, used where production is to customer order rather than continuous. Each cost object is identifiable and its costs are accumulated separately — unlike process costing, where identical units flow continuously.',
      'In job costing, every job (a printing order, a repair, a custom machine) gets its own job cost card: direct material, direct wages and direct expenses are charged directly; overheads are absorbed using a predetermined rate; and a profit mark-up gives the quotation price.',
      'Batch costing treats a batch of identical units as one job, then divides by the number of units for a cost per unit. The key question is the optimum batch size: large batches cut set-up cost per unit but raise carrying cost. The Economic Batch Quantity (EBQ) — the batch twin of EOQ — balances the two.',
    ],
    keyTerms: [
      { term: 'Job cost card', def: 'The document that accumulates all costs of a specific job — the unique record of job costing.' },
      { term: 'Cost-plus pricing', def: 'Selling price = total cost + an agreed profit mark-up on cost.' },
      { term: 'Batch', def: 'A group of identical units produced together and costed as a single job.' },
      { term: 'Set-up cost', def: 'The fixed cost of preparing machines/tools for a production run; fixed per batch, so falls per unit as batch size rises.' },
      { term: 'Economic Batch Quantity', def: 'The batch size that minimises total set-up plus carrying cost.' },
    ],
    formulas: [
      { name: 'Prime cost', expr: 'Direct material + Direct wages + Direct expenses' },
      { name: 'Works cost', expr: 'Prime cost + Factory overhead absorbed' },
      { name: 'Total cost', expr: 'Works cost + Administration overhead' },
      { name: 'Quotation price', expr: 'Total cost + Profit mark-up' },
      { name: 'Economic Batch Quantity', expr: 'EBQ = √(2 × U × S ÷ C)', note: 'U = annual units, S = set-up cost per batch, C = carrying cost per unit p.a.' },
      { name: 'Production runs per year', expr: 'Annual units ÷ EBQ' },
    ],
    procedure: {
      heading: 'Job card & batch size',
      steps: [
        { title: '1 · Charge direct costs', detail: 'Post direct material, direct wages and direct expenses straight to the job/batch.' },
        { title: '2 · Absorb overheads', detail: 'Apply factory overhead (often a % of wages or a labour/machine-hour rate) and administration overhead (often a % of works cost).' },
        { title: '3 · Add profit → price', detail: 'For a quotation, add the profit mark-up on total cost (cost-plus).' },
        { title: '4 · Batch size', detail: 'For repeated production, compute EBQ = √(2US/C); the number of runs = annual units ÷ EBQ.' },
      ],
    },
    examTips: [
      'EBQ uses the same logic as EOQ — set-up cost replaces ordering cost, carrying cost stays the same.',
      'Be clear whether profit is a % of cost (mark-up) or a % of selling price (margin) — they give different prices.',
      'For batch costing, always state cost per unit = total batch cost ÷ units in the batch.',
    ],
    pitfalls: [
      'Mixing up profit on cost vs profit on sales when quoting.',
      'Forgetting that set-up cost is per batch (fixed), so cost per unit falls as the batch grows.',
      'Applying the wrong overhead base in the job card (using % of material where a labour-hour rate is intended).',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Units 8 & 12 (Job & Batch Costing)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Job costing — meaning & procedure', url: 'https://www.accountingnotes.net/cost-accounting/job-costing/job-costing/16210', kind: 'article', source: 'Accounting Notes' },
      { label: 'Economic batch quantity', url: 'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f2.html', kind: 'official', source: 'ACCA' },
    ],
    workedExample: {
      title: 'Economic Batch Quantity (Arora §12.2.1)',
      problem:
        'Annual production 12,000 units; set-up cost ₹150 per batch; carrying cost ₹0.20 per unit per annum. Find the economic batch quantity and the number of production runs per year.',
      steps: [
        { label: 'EBQ = √(2 × U × S ÷ C)', formula: '√(2 × 12,000 × 150 ÷ 0.20) = √1,80,00,000', result: '≈ 4,243 units' },
        { label: 'Production runs per year', formula: '12,000 ÷ 4,243', result: '≈ 2.83 runs' },
      ],
      answer: 'Economic batch quantity ≈ 4,243 units, giving about 2.8 production runs a year.',
      source: 'M.N. Arora, Cost Accounting, §12.2.1 (Economic Batch Quantity)',
    },
    practice: [
      {
        q: 'How does EBQ differ from EOQ?',
        answer: 'They share the same √(2 × demand × cost-per-event ÷ carrying-cost) formula. EOQ uses ordering cost for purchased material; EBQ uses set-up cost for produced batches.',
      },
      {
        q: 'A job has prime cost ₹4,500, factory overhead ₹1,500, admin overhead ₹600. Profit is 25% on cost. Find the price.',
        answer: 'Total cost = 4,500 + 1,500 + 600 = ₹6,600; profit = 25% × 6,600 = ₹1,650; price = ₹8,250.',
      },
      {
        q: 'Why does cost per unit fall as batch size increases?',
        answer: 'Set-up cost is fixed per batch, so spreading it over more units lowers set-up cost per unit (until rising carrying cost offsets it — hence EBQ).',
      },
    ],
    calc: 'job-batch-costing',
  },
  {
    id: 'contract-costing',
    title: 'Contract Costing',
    subject: 'Cost Accounting',
    icon: HardHat,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Cost long-duration contracts — the contract account, work certified/uncertified, notional profit, and the prudence rules for profit on incomplete contracts.',
    readingMinutes: 11,
    tags: ['contract costing', 'notional profit', 'work certified', 'retention money', 'cash ratio', 'incomplete contract'],
    overview: [
      'Contract costing applies to large, long-duration jobs carried out at a site — construction, civil engineering, shipbuilding. Each contract is a cost unit with its own contract account, to which all direct costs (materials, labour, plant, direct expenses) are charged. Because most costs are direct, it is essentially job costing on a big scale.',
      'When a contract spans more than one year, the problem is how much profit to recognise on the unfinished work. Taking all the profit only on completion would distort year-to-year results; taking too much on incomplete work breaches prudence. So a notional profit is struck each year and only a conservative portion is credited to the P&L.',
      'Two valuations matter at the year-end: work certified (approved by the contractee’s architect, valued at contract price, so it includes profit) and work uncertified (not yet approved, valued at cost only). The contractee usually pays a cash ratio of the work certified and holds back the rest as retention money.',
    ],
    keyTerms: [
      { term: 'Work certified', def: 'Work-in-progress approved by the architect, valued at contract price (includes profit).' },
      { term: 'Work uncertified', def: 'Completed work not yet approved, valued at cost only (no profit).' },
      { term: 'Retention money', def: 'The part of work certified withheld by the contractee as security; cash ratio is the part paid.' },
      { term: 'Notional profit', def: 'The contract account’s balancing figure = value of work certified + cost of uncertified − cost to date.' },
      { term: 'Estimated profit', def: 'Contract price − estimated total cost; used when a contract is near completion.' },
    ],
    formulas: [
      { name: 'Notional profit', expr: '(Work certified + Work uncertified) − Cost of work to date' },
      { name: 'Stage of completion', expr: 'Work certified ÷ Contract price' },
      { name: 'Cash ratio', expr: 'Cash received ÷ Work certified' },
      { name: 'Profit (¼ ≤ stage < ½)', expr: '⅓ × Notional profit × Cash ratio' },
      { name: 'Profit (½ ≤ stage < 9⁄10)', expr: '⅔ × Notional profit × Cash ratio' },
    ],
    procedure: {
      heading: 'Profit on an incomplete contract',
      steps: [
        { title: '1 · Prepare the contract account', detail: 'Debit all costs (materials, labour, plant, expenses, overheads). Credit closing materials/plant at site, work uncertified, and work certified.' },
        { title: '2 · Find notional profit', detail: 'It is the balancing figure of the account. If costs exceed the credits, it is a notional loss.' },
        { title: '3 · Judge the stage', detail: 'Stage = work certified ÷ contract price. Below ¼ → take no profit.' },
        { title: '4 · Apply the prudence rule', detail: '¼–½ → ⅓ × notional profit × cash ratio; ½–9⁄10 → ⅔ × notional profit × cash ratio; near completion → use estimated profit.' },
        { title: '5 · Carry the reserve', detail: 'The portion not taken to P&L is held back as a reserve against future contingencies; a notional loss goes to P&L in full.' },
      ],
    },
    examTips: [
      'Work certified carries profit (valued at contract price); work uncertified is at cost. Never value uncertified work at selling price.',
      'Multiply by the cash ratio (cash received ÷ work certified) — the “more common practice” — to be doubly prudent.',
      'A notional loss is transferred to P&L in full, regardless of the stage of completion.',
    ],
    pitfalls: [
      'Entering cash received in the contract account — it goes to the contractee’s personal account, not the contract account.',
      'Forgetting to credit closing plant/material at site, which understates notional profit.',
      'Taking the whole notional profit to P&L while the contract is incomplete.',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Unit 10 (Contract Costing)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Contract costing — profit on incomplete contracts', url: 'https://www.accountingnotes.net/cost-accounting/contract-costing/contract-costing/16260', kind: 'article', source: 'Accounting Notes' },
      { label: 'Profit on incomplete contracts', url: 'https://www.yourarticlelibrary.com/cost-accounting/contract-costing/profit-on-incomplete-contracts/55617', kind: 'article', source: 'Article Library' },
    ],
    workedExample: {
      title: 'Notional profit & profit transfer (Arora, Illustration 10.1)',
      problem:
        'Contract price ₹10,00,000. To date: materials ₹50,000, labour ₹3,00,000, plant ₹20,000. Materials costing ₹5,000 were damaged. Plant depreciated 25% → ₹15,000 at site. Cash received ₹3,60,000 = 90% of work certified; work uncertified at cost ₹10,000. Find the notional profit and the profit to credit to P&L.',
      steps: [
        { label: 'Work certified = cash ÷ cash ratio', formula: '₹3,60,000 ÷ 90%', result: '₹4,00,000' },
        { label: 'Debits (cost) = materials + labour + plant', formula: '50,000 + 3,00,000 + 20,000', result: '₹3,70,000' },
        { label: 'Credits = damaged + plant at site + certified + uncertified', formula: '5,000 + 15,000 + 4,00,000 + 10,000', result: '₹4,30,000' },
        { label: 'Notional profit = credits − debits', formula: '₹4,30,000 − ₹3,70,000', result: '₹60,000' },
        { label: 'Stage = 4,00,000 ÷ 10,00,000 = 40% → ⅓ rule', formula: '⅓ × ₹60,000 × 90% cash ratio', result: '₹18,000' },
      ],
      answer: 'Notional profit ₹60,000; stage 40% (¼–½ band) → ⅓ × 60,000 × 90% = ₹18,000 credited to P&L, ₹42,000 carried as reserve.',
      source: 'M.N. Arora, Cost Accounting, Illustration 10.1',
    },
    practice: [
      {
        q: 'Why is only part of the notional profit taken to P&L on an incomplete contract?',
        answer: 'Prudence — the contract is unfinished and future losses/contingencies may arise, so a reserve is held back. The further along and the more cash collected, the larger the share recognised.',
      },
      {
        q: 'At what stage is no profit transferred?',
        answer: 'When work certified is less than ¼ of the contract price — the contract has not advanced far enough to recognise profit reliably.',
      },
      {
        q: 'How is a notional loss treated?',
        answer: 'Transferred to the P&L account in full, regardless of the stage of completion.',
      },
    ],
    calc: 'contract-costing',
  },
  {
    id: 'process-costing',
    title: 'Process Costing',
    subject: 'Cost Accounting',
    icon: GitBranch,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Cost continuous production process by process — normal loss, abnormal loss and abnormal gain, and the cost per unit that good output carries.',
    readingMinutes: 11,
    tags: ['process costing', 'normal loss', 'abnormal loss', 'abnormal gain', 'process account', 'equivalent units', 'scrap'],
    overview: [
      'Process costing is used where production is continuous and the output is uniform — chemicals, sugar, paper, paint, oil refining. The material passes through a series of processes, and the output of one process becomes the input of the next. Because the units are identical, cost is averaged: cost per unit = total process cost ÷ units produced.',
      'A defining feature is loss in process. Normal loss is the unavoidable loss expected under efficient conditions (evaporation, shrinkage); its cost is borne by the good output, and only its scrap value is credited to the process. Abnormal loss is the excess over normal — due to carelessness, breakdown, defective material — and is NOT charged to good output; it goes to the costing P&L so the cost of good production stays stable.',
      'Sometimes the actual loss is less than expected, so output exceeds the normal output — an abnormal gain. It is valued at the same cost per unit, debited to the process account and credited to an Abnormal Gain account. Where there is opening/closing work-in-progress, the equivalent-units method converts part-finished units into equivalent whole units before averaging cost.',
    ],
    keyTerms: [
      { term: 'Normal loss', def: 'Unavoidable loss expected under efficient working; its cost is absorbed by good output. Scrap value is credited to the process.' },
      { term: 'Abnormal loss', def: 'Loss in excess of normal, valued at the normal cost per unit and transferred to the costing P&L.' },
      { term: 'Abnormal gain', def: 'When actual output exceeds expected (normal) output; valued at cost per unit, debited to the process, credited to Abnormal Gain A/c.' },
      { term: 'Cost per unit', def: '(Total process cost − scrap value of normal loss) ÷ (input units − normal loss units).' },
      { term: 'Equivalent units', def: 'Part-finished units expressed as an equivalent number of complete units, used when there is work-in-progress.' },
    ],
    formulas: [
      { name: 'Normal loss units', expr: 'Input units × Normal loss %' },
      { name: 'Cost per unit', expr: '(Total cost − Scrap value of normal loss) ÷ (Input − Normal loss units)' },
      { name: 'Abnormal loss/gain (units)', expr: 'Expected output − Actual output', note: 'Positive = abnormal loss; negative = abnormal gain.' },
      { name: 'Value of abnormal loss/gain', expr: 'Cost per unit × Abnormal units' },
      { name: 'Cost of good output', expr: 'Cost per unit × Actual good output' },
    ],
    procedure: {
      heading: 'Costing a process with loss',
      steps: [
        { title: '1 · Total the process cost', detail: 'Add cost of units introduced + materials + labour + overheads charged to the process.' },
        { title: '2 · Allow for normal loss', detail: 'Normal loss units = input × normal-loss %. Credit the process with its scrap value only.' },
        { title: '3 · Cost per unit', detail: '(Total cost − scrap value) ÷ (input − normal loss). This is the rate every good unit carries.' },
        { title: '4 · Abnormal loss or gain', detail: 'Compare actual output with expected output. Value the difference at the cost per unit; take it to the costing P&L (abnormal loss credited out of, abnormal gain debited into, the process).' },
        { title: '5 · Equivalent units (if WIP)', detail: 'Where work-in-progress exists, convert it to equivalent complete units (separately for material, labour, overheads) before computing cost per equivalent unit.' },
      ],
    },
    examTips: [
      'Normal loss carries NO cost (only scrap value) — its cost is automatically absorbed by good units through the cost-per-unit formula.',
      'Always compute cost per unit on (input − normal loss) units, never on full input — that is how the normal-loss cost transfers to good output.',
      'Abnormal gain is debited to the process account (it looks odd, but it restores the good-output cost to normal).',
    ],
    pitfalls: [
      'Dividing total cost by full input units (forgetting to remove normal loss) — understates cost per unit.',
      'Charging abnormal loss to good output — it must go to the costing P&L.',
      'Forgetting to deduct the scrap value of normal loss before computing the cost per unit.',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Unit 9 (Process Costing)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Process costing — normal & abnormal loss', url: 'https://www.accountingnotes.net/cost-accounting/process-costing/process-costing/16236', kind: 'article', source: 'Accounting Notes' },
      { label: 'Process costing technical article', url: 'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f2/technical-articles/process-costing.html', kind: 'official', source: 'ACCA' },
    ],
    workedExample: {
      title: 'Normal & abnormal loss (Arora, Unit 9 — Process A)',
      problem:
        '10,000 units are introduced into Process A at ₹1 each (₹10,000). Added: materials ₹1,000, labour ₹5,000, expenses ₹1,050. Normal loss is 3% of input with a scrap value of ₹0.25 per unit. Actual output is 9,500 units. Find the cost per unit and the abnormal loss.',
      steps: [
        { label: 'Total process cost', formula: '10,000 + 1,000 + 5,000 + 1,050', result: '₹17,050' },
        { label: 'Normal loss = 3% × 10,000', formula: '300 units; scrap 300 × ₹0.25', result: '300 units · scrap ₹75' },
        { label: 'Cost per unit = (17,050 − 75) ÷ (10,000 − 300)', formula: '16,975 ÷ 9,700', result: '₹1.75 per unit' },
        { label: 'Abnormal loss = expected − actual', formula: '(10,000 − 300) − 9,500 = 200 units × ₹1.75', result: '₹350' },
        { label: 'Cost of good output', formula: '9,500 × ₹1.75', result: '₹16,625' },
      ],
      answer: 'Cost per unit ₹1.75; abnormal loss 200 units = ₹350; good output transferred ₹16,625.',
      source: 'M.N. Arora, Cost Accounting, Unit 9 (Process A)',
    },
    practice: [
      {
        q: 'Why is the cost of normal loss not separately charged anywhere?',
        answer: 'Because it is absorbed by good output: dividing cost by (input − normal loss) raises the cost per unit so the good units automatically bear the normal-loss cost.',
      },
      {
        q: 'Actual output exceeds the expected (normal) output. What is this, and how is it treated?',
        answer: 'An abnormal gain — valued at the normal cost per unit, debited to the process account and credited to the Abnormal Gain account (→ costing P&L).',
      },
      {
        q: 'Input 1,000 units, cost ₹9,500; normal loss 5% with no scrap value. Find the cost per unit.',
        answer: 'Cost per unit = 9,500 ÷ (1,000 − 50) = 9,500 ÷ 950 = ₹10.',
      },
    ],
    calc: 'process-costing',
  },
  {
    id: 'operating-costing',
    title: 'Operating / Service Costing',
    subject: 'Cost Accounting',
    icon: Bus,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Cost services rather than products — the cost per km and the composite tonne-km / passenger-km used by transport and other service undertakings.',
    readingMinutes: 9,
    tags: ['operating costing', 'service costing', 'transport costing', 'cost per km', 'tonne-km', 'passenger-km', 'composite unit'],
    overview: [
      'Operating (or service) costing is used by undertakings that provide a service rather than make a product — transport, hospitals, hotels, canteens, power houses, cinemas. The aim is the cost per unit of service, which is then used to fix fares, charges or hire rates.',
      'Choosing the cost unit is the crux. A simple unit (per km, per 1,000 litres, per meal) suits some services; but transport usually needs a composite unit that rolls two factors into one — a tonne-km (1 tonne carried 1 km) for goods, or a passenger-km for passengers. This reflects that both the load and the distance drive cost.',
      'Costs are grouped as standing (fixed) charges — insurance, tax, garage, salaries — which do not vary with distance; running (variable) charges — fuel, oil, tyres — which vary with km run; and maintenance, which is semi-variable. Dividing total cost by the number of service units gives the cost per unit.',
    ],
    keyTerms: [
      { term: 'Operating costing', def: 'Costing method for undertakings rendering services, to find the cost per unit of service.' },
      { term: 'Simple cost unit', def: 'A single-factor unit — per km, per 1,000 litres, per bed-day.' },
      { term: 'Composite cost unit', def: 'A two-factor unit — tonne-km (goods) or passenger-km (passengers).' },
      { term: 'Standing charges', def: 'Fixed costs incurred regardless of distance run (tax, insurance, garage, salaries).' },
      { term: 'Running charges', def: 'Variable costs that change with distance (fuel, oil, tyres).' },
    ],
    formulas: [
      { name: 'Total operating cost', expr: 'Standing charges + Running charges + Maintenance' },
      { name: 'Cost per km', expr: 'Total operating cost ÷ Distance run (km)' },
      { name: 'Composite units', expr: 'Distance (km) × Average load (tonnes or passengers)' },
      { name: 'Cost per tonne-km / passenger-km', expr: 'Total operating cost ÷ Composite units' },
      { name: 'Rate to charge', expr: 'Cost per unit × (1 + Profit %)' },
    ],
    procedure: {
      heading: 'Building the operating cost sheet',
      steps: [
        { title: '1 · Classify the costs', detail: 'Group into standing (fixed), running (variable) and maintenance (semi-variable) charges.' },
        { title: '2 · Total the cost', detail: 'Add all three groups for the period’s total operating cost.' },
        { title: '3 · Count service units', detail: 'Cost per km uses distance; the composite unit uses distance × average load (tonne-km or passenger-km).' },
        { title: '4 · Cost per unit & rate', detail: 'Divide total cost by service units; add the profit margin to fix the fare or freight rate.' },
      ],
    },
    examTips: [
      'For a composite unit, multiply distance by the average load — a tonne-km is 1 tonne moved 1 km.',
      'Absolute tonne-km totals each leg separately (distance × load on that leg); commercial tonne-km uses total distance × average load.',
      'Keep standing and running charges separate — it is the basis for comparing own-vehicle vs hired-transport cost.',
    ],
    pitfalls: [
      'Dividing by distance alone when the question asks for cost per tonne-km (you must include the load).',
      'Treating fuel as a standing charge or insurance as a running charge.',
      'Ignoring return-trip empty running when computing average load.',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Unit 11 (Operating Costing)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Operating costing — transport (illustrated)', url: 'https://www.accountingnotes.net/cost-accounting/operating-costing/operating-costing/16320', kind: 'article', source: 'Accounting Notes' },
      { label: 'Service costing technical article', url: 'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f2.html', kind: 'official', source: 'ACCA' },
    ],
    workedExample: {
      title: 'Cost per tonne-km',
      problem:
        'A truck’s monthly costs are: standing charges ₹9,000, running charges ₹8,000, maintenance ₹3,000. It runs 10,000 km in the month carrying an average load of 5 tonnes. Find the total operating cost, the cost per km, and the cost per tonne-km.',
      steps: [
        { label: 'Total operating cost', formula: '₹9,000 + ₹8,000 + ₹3,000', result: '₹20,000' },
        { label: 'Cost per km', formula: '₹20,000 ÷ 10,000 km', result: '₹2.00 per km' },
        { label: 'Tonne-km = distance × average load', formula: '10,000 × 5', result: '50,000 tonne-km' },
        { label: 'Cost per tonne-km', formula: '₹20,000 ÷ 50,000', result: '₹0.40 per tonne-km' },
      ],
      answer: 'Total operating cost ₹20,000; cost ₹2.00 per km and ₹0.40 per tonne-km.',
    },
    practice: [
      {
        q: 'Why does a goods-transport business use tonne-km rather than km as its cost unit?',
        answer: 'Because cost depends on both the load carried and the distance. A tonne-km (1 tonne × 1 km) captures both, so cost comparison and pricing are fairer.',
      },
      {
        q: 'A bus runs 4,000 km carrying on average 40 passengers. What are the passenger-kms?',
        answer: '4,000 × 40 = 1,60,000 passenger-km.',
      },
      {
        q: 'Are tyres a standing charge or a running charge?',
        answer: 'A running (variable) charge — tyre wear depends on distance run.',
      },
    ],
    calc: 'operating-costing',
  },
  {
    id: 'standard-costing',
    title: 'Standard Costing & Variances',
    subject: 'Cost Accounting',
    icon: SlidersHorizontal,
    level: 'B.Com · BBA · CA/CMA Inter',
    blurb:
      'Set standard costs, then explain the gap to actuals — material and labour variances split into price/rate and usage/efficiency.',
    readingMinutes: 11,
    tags: ['standard costing', 'variance analysis', 'material variance', 'labour variance', 'price variance', 'efficiency variance', 'favourable adverse'],
    overview: [
      'Standard costing sets a predetermined cost for each unit — the standard cost — built from standard quantities and standard prices. Actual results are then compared with these standards, and the differences (variances) are analysed by cause. It is a tool of control: it pinpoints where, and by how much, performance departed from plan.',
      'A variance is favourable (F) when it saves cost — actual is less than standard — and adverse (A) when it costs more. The total cost variance for an element is split into a price/rate variance (the effect of paying a different price) and a usage/efficiency variance (the effect of using a different quantity or time). The two sub-variances always reconcile to the total.',
      'The same logic applies to material and labour. For material: price variance isolates the price paid, usage variance the quantity used. For labour: rate variance isolates the wage rate, efficiency variance the hours worked. Responsibility usually differs — purchasing owns price; production owns usage and efficiency.',
    ],
    keyTerms: [
      { term: 'Standard cost', def: 'A predetermined cost = standard quantity × standard price (per unit of output).' },
      { term: 'Variance', def: 'Difference between standard cost (of actual output) and actual cost. F = favourable, A = adverse.' },
      { term: 'Material price variance', def: '(SP − AP) × AQ — the effect of paying a different price.' },
      { term: 'Material usage variance', def: '(SQ − AQ) × SP — the effect of using a different quantity.' },
      { term: 'Labour rate variance', def: '(SR − AR) × AH — the effect of a different wage rate.' },
      { term: 'Labour efficiency variance', def: '(SH − AH) × SR — the effect of taking different hours.' },
    ],
    formulas: [
      { name: 'Material cost variance', expr: '(SQ × SP) − (AQ × AP)' },
      { name: 'Material price variance', expr: '(SP − AP) × AQ' },
      { name: 'Material usage variance', expr: '(SQ − AQ) × SP', note: 'Price + Usage = Cost variance.' },
      { name: 'Labour cost variance', expr: '(SH × SR) − (AH × AR)' },
      { name: 'Labour rate variance', expr: '(SR − AR) × AH' },
      { name: 'Labour efficiency variance', expr: '(SH − AH) × SR', note: 'Rate + Efficiency = Cost variance.' },
    ],
    procedure: {
      heading: 'Computing a variance',
      steps: [
        { title: '1 · Fix the standard for actual output', detail: 'Standard quantity/hours are those allowed for the output actually achieved, at standard price/rate.' },
        { title: '2 · Total cost variance', detail: 'Standard cost − actual cost. Favourable if positive (cost saved).' },
        { title: '3 · Price / rate variance', detail: 'Hold quantity at actual, vary the price: (SP − AP) × AQ for material; (SR − AR) × AH for labour.' },
        { title: '4 · Usage / efficiency variance', detail: 'Hold price at standard, vary the quantity: (SQ − AQ) × SP for material; (SH − AH) × SR for labour.' },
        { title: '5 · Reconcile', detail: 'Price/rate + usage/efficiency must equal the total cost variance — a built-in check.' },
      ],
    },
    examTips: [
      'Label every variance F or A — marks are lost for an unlabelled number, even if the arithmetic is right.',
      'Use AQ for the price variance and SP for the usage variance (and AH/SR for labour) — swapping the multiplier is the commonest mistake.',
      'Standard quantity/hours must be for the ACTUAL output achieved, not the budgeted output.',
    ],
    pitfalls: [
      'Computing the usage variance at actual price instead of standard price.',
      'Forgetting that price + usage must reconcile to the cost variance — if they don’t, a sign is wrong.',
      'Confusing favourable with a positive number blindly — always check the direction (lower actual cost = favourable).',
    ],
    references: [
      { label: 'M.N. Arora, Cost Accounting — Unit 13 (Standard Costing)', url: 'https://www.alagappauniversity.ac.in/', kind: 'textbook', source: 'M.N. Arora' },
      { label: 'Variance analysis — material & labour', url: 'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f2/technical-articles/variance-analysis.html', kind: 'official', source: 'ACCA' },
      { label: 'Standard costing & variances', url: 'https://www.accountingnotes.net/cost-accounting/standard-costing/standard-costing/16480', kind: 'article', source: 'Accounting Notes' },
    ],
    workedExample: {
      title: 'Material & labour variances (Arora, Unit 13)',
      problem:
        'Material: standard quantity for actual output 4,000 kg @ ₹5; actual 4,300 kg @ ₹4.80. Labour: standard 2,000 hrs @ ₹10; actual 2,100 hrs @ ₹9.50. Compute the cost, price/rate and usage/efficiency variances.',
      steps: [
        { label: 'Material price variance = (SP − AP) × AQ', formula: '(5 − 4.80) × 4,300', result: '₹860 (F)' },
        { label: 'Material usage variance = (SQ − AQ) × SP', formula: '(4,000 − 4,300) × 5', result: '₹1,500 (A)' },
        { label: 'Material cost variance = price + usage', formula: '+860 − 1,500', result: '₹640 (A)' },
        { label: 'Labour rate variance = (SR − AR) × AH', formula: '(10 − 9.50) × 2,100', result: '₹1,050 (F)' },
        { label: 'Labour efficiency variance = (SH − AH) × SR', formula: '(2,000 − 2,100) × 10', result: '₹1,000 (A)' },
        { label: 'Labour cost variance = rate + efficiency', formula: '+1,050 − 1,000', result: '₹50 (F)' },
      ],
      answer: 'Material: price ₹860 (F), usage ₹1,500 (A), cost ₹640 (A). Labour: rate ₹1,050 (F), efficiency ₹1,000 (A), cost ₹50 (F).',
      source: 'M.N. Arora, Cost Accounting, Unit 13',
    },
    practice: [
      {
        q: 'A material usage variance is adverse. Who is usually responsible?',
        answer: 'The production department — adverse usage means more material was consumed than the standard allowed (waste, defective material, poor workmanship). Price is the buyer’s responsibility.',
      },
      {
        q: 'SP ₹8, AP ₹8.50, AQ 1,000 kg. Find the material price variance and its nature.',
        answer: '(8 − 8.50) × 1,000 = −₹500 → ₹500 (A), adverse — more was paid than standard.',
      },
      {
        q: 'Why must the price and usage variances add up to the cost variance?',
        answer: 'Because together they decompose the same total difference: one isolates the price effect, the other the quantity effect — their sum is the whole cost variance.',
      },
    ],
    calc: 'standard-costing-variances',
  },
]

export const getResourceTopic = (id: string): ResourceTopic | undefined =>
  resourceTopics.find((t) => t.id === id)
