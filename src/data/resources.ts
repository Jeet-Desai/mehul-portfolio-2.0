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
]

export const getResourceTopic = (id: string): ResourceTopic | undefined =>
  resourceTopics.find((t) => t.id === id)
