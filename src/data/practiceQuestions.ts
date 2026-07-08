/* ----------------------------------------------------------------------------
   Practice Questions — long-form / numerical, with worked solutions.

   Source: Dr. Mehulkumar Desai's own college question banks
   (Udhna Citizen Commerce College — T.Y.B.Com. Sem-5, Advanced Accounting &
   Auditing). Every question is transcribed verbatim from the source papers and
   every worked solution is the professor's own answer, cross-checked to tie out
   before being entered here. NOTHING is invented — where the source solution had
   an obvious arithmetic typo in a total, the corrected total is shown (the
   component figures are the source's own and are noted).

   These render inside the Practice tab as reveal-solution study questions —
   distinct from the auto-graded MCQ engine (src/data/quizzes.ts).
---------------------------------------------------------------------------- */

export const PRACTICE_SOURCE =
  "From the question banks of Dr. Mehulkumar Desai · Udhna Citizen Commerce College · T.Y.B.Com. (Sem. 5), Advanced Accounting & Auditing"

export type QTable = {
  caption?: string
  /** optional column headers; if omitted the table renders header-less */
  head?: string[]
  rows: string[][]
}

export type PracticeQuestion = {
  id: string
  setId: string
  /** the real exam the question is drawn from, e.g. "March 2009" */
  exam?: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  /** the question stem */
  prompt: string
  /** data tables given in the question paper (verbatim) */
  given?: QTable[]
  /** "Additional information" bullet points from the paper */
  info?: string[]
  /** what the student is asked to prepare */
  requirement?: string
  /** worked-solution tables (revealed on demand) */
  solution: QTable[]
  /** narrative working notes shown with the solution */
  notes?: string[]
  /** one-line final answer / result summary */
  answer: string
}

export type PracticeSetMeta = {
  id: string
  title: string
  blurb: string
  /** if a matching calculator exists in the registry, its slug lights up a CTA */
  calculatorSlug?: string
}

export const practiceSets: PracticeSetMeta[] = [
  {
    id: 'cash-flow',
    title: 'Cash Flow Statement (AS 3)',
    blurb: 'Past-exam numericals — cash from operating / investing / financing activities and full statements.',
    calculatorSlug: 'cash-flow',
  },
  {
    id: 'fund-flow',
    title: 'Fund Flow Statement',
    blurb: 'Past-exam numericals — schedule of changes in working capital, funds from operations and fund flow statements.',
    calculatorSlug: 'fund-flow',
  },
]

export const practiceQuestions: PracticeQuestion[] = [
  /* ============================ CASH FLOW ============================ */
  {
    id: 'cfq1',
    setId: 'cash-flow',
    exam: 'M.A. 2007',
    difficulty: 'Medium',
    prompt: 'Calculate cash flow from operating activities from the following details:',
    given: [
      {
        head: ['Particulars', '1.4.05 (₹)', '31.3.06 (₹)'],
        rows: [
          ['Profit and Loss Account', '60,000', '70,000'],
          ['General reserve', '20,000', '30,000'],
          ['Provision for depreciation on plant', '60,000', '70,000'],
          ['Expenses outstanding', '10,000', '6,000'],
          ['Goodwill', '40,000', '20,000'],
          ['Debtors', '80,000', '70,000'],
        ],
      },
    ],
    info: ['One item of plant costing ₹40,000 having book value ₹28,000 was sold for ₹36,000 during the year.'],
    solution: [
      {
        caption: 'Provision for Depreciation Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Plant A/c (on plant sold)', '12,000', 'By Opening balance', '60,000'],
          ['To Closing balance', '70,000', 'By P&L A/c (dep. for year)', '22,000'],
          ['', '82,000', '', '82,000'],
        ],
      },
      {
        caption: 'Cash Flow from Operating Activities',
        head: ['Particulars', '₹', '₹'],
        rows: [
          ['Difference in profit (70,000 − 60,000)', '', '10,000'],
          ['Add: Transfer to General reserve', '10,000', ''],
          ['Add: Depreciation for the year', '22,000', ''],
          ['Add: Goodwill written off', '20,000', '52,000'],
          ['', '', '62,000'],
          ['Less: Profit on sale of plant (36,000 − 28,000)', '', '8,000'],
          ['', '', '54,000'],
          ['Add: Decrease in Debtors', '10,000', ''],
          ['Less: Decrease in Expenses outstanding', '4,000', '6,000'],
          ['Cash flow from Operating Activities', '', '60,000'],
        ],
      },
    ],
    notes: [
      'Accumulated depreciation on the plant sold = cost ₹40,000 − book value ₹28,000 = ₹12,000; this is removed from the provision account, so depreciation charged for the year = 70,000 − 60,000 + 12,000 = ₹22,000.',
      'A decrease in debtors is an inflow (add); a decrease in outstanding expenses is an outflow (subtract) — the two net to +₹6,000.',
    ],
    answer: 'Cash flow from Operating Activities = ₹60,000.',
  },
  {
    id: 'cfq2',
    setId: 'cash-flow',
    difficulty: 'Easy',
    prompt: 'Calculate cash flow from operating activities from the following details:',
    given: [
      {
        head: ['Particulars', '31.3.19 (₹)', '31.3.20 (₹)'],
        rows: [
          ['Debtors', '40,000', '36,000'],
          ['Creditors', '16,000', '22,000'],
          ['Bills receivable', '8,000', '10,500'],
          ['Bills payable', '6,000', '5,000'],
          ['Outstanding expenses', '1,200', '1,600'],
          ['Stock', '25,000', '30,000'],
        ],
      },
    ],
    solution: [
      {
        caption: 'Cash Flow from Operating Activities',
        head: ['Particulars', '₹', '₹'],
        rows: [
          ['Add: Decrease in Debtors', '4,000', ''],
          ['Add: Increase in Creditors', '6,000', ''],
          ['Add: Increase in Outstanding expenses', '400', '10,400'],
          ['Less: Increase in Bills receivable', '2,500', ''],
          ['Less: Decrease in Bills payable', '1,000', ''],
          ['Less: Increase in Stock', '5,000', '8,500'],
          ['Cash flow from Operating Activities', '', '1,900'],
        ],
      },
    ],
    notes: [
      'Increases in current assets (bills receivable, stock) and decreases in current liabilities (bills payable) reduce operating cash; decreases in current assets (debtors) and increases in current liabilities (creditors, outstanding expenses) raise it.',
    ],
    answer: 'Cash flow from Operating Activities = ₹1,900.',
  },
  {
    id: 'cfq3',
    setId: 'cash-flow',
    difficulty: 'Easy',
    prompt:
      'Calculate cash flow from investing activities: Investment on 1st April 2019 ₹1,25,000; Investment on 31.3.2020 ₹5,25,000. During the year, investments worth ₹5,40,000 were purchased and some investments were sold at a 20% loss on their book value.',
    solution: [
      {
        caption: 'Investment Account (to find book value of investments sold)',
        head: ['Particulars', '₹'],
        rows: [
          ['Opening balance', '1,25,000'],
          ['Add: Purchases', '5,40,000'],
          ['', '6,65,000'],
          ['Less: Closing balance', '5,25,000'],
          ['Book value of investments sold', '1,40,000'],
        ],
      },
      {
        caption: 'Cash Flow from Investing Activities',
        head: ['Particulars', '₹', '₹'],
        rows: [
          ['Sale of investments (1,40,000 − 20% loss)', '1,12,000', ''],
          ['Less: Purchase of investments', '5,40,000', ''],
          ['Net cash used in Investing Activities', '', '(4,28,000)'],
        ],
      },
    ],
    notes: [
      'Book value of investments sold = opening + purchases − closing = 1,25,000 + 5,40,000 − 5,25,000 = ₹1,40,000. Sold at 20% loss ⇒ proceeds = 80% × 1,40,000 = ₹1,12,000.',
    ],
    answer: 'Net cash used in Investing Activities = ₹4,28,000 (outflow).',
  },
  {
    id: 'cfq4',
    setId: 'cash-flow',
    exam: 'M.A. 2009',
    difficulty: 'Hard',
    prompt: 'Following are the balance sheets of Heena Ltd. as on 31st March. Prepare the cash flow statement, cash from operations and necessary accounts.',
    given: [
      {
        caption: 'Balance Sheet',
        head: ['Particulars', '31.03.2007 (₹)', '31.03.2008 (₹)'],
        rows: [
          ['Equity Share capital (₹10)', '1,00,000', '1,50,000'],
          ['General Reserve', '60,000', '20,000'],
          ['Profit and Loss A/c', '10,000', '12,000'],
          ['10% Debentures', '—', '50,000'],
          ['Creditors', '45,000', '51,000'],
          ['Provision for taxation', '15,000', '17,000'],
          ['Total', '2,30,000', '3,00,000'],
          ['Fixed Assets', '1,30,000', '2,23,000'],
          ['Preliminary Expenses', '8,000', '6,000'],
          ['Current investments', '15,000', '12,000'],
          ['Inventories', '10,000', '15,000'],
          ['Debtors', '55,000', '35,000'],
          ['Cash and Bank balance', '12,000', '9,000'],
          ['Total', '2,30,000', '3,00,000'],
        ],
      },
    ],
    info: [
      'On 1-4-07 bonus shares at one share for every two shares were issued by capitalizing General Reserve.',
      'Income Tax ₹14,000 paid during the year.',
      'Interim dividend of ₹9,000 paid during the year.',
      'Depreciation ₹5,000 was provided on fixed assets.',
      'Investments costing ₹5,000 were sold at a profit of ₹1,000, which profit was credited to the P&L account.',
    ],
    solution: [
      {
        caption: 'Fixed Asset Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Opening balance', '1,30,000', 'By P&L A/c (Depreciation)', '5,000'],
          ['To Bank A/c (purchase)', '98,000', 'By Closing balance', '2,23,000'],
          ['', '2,28,000', '', '2,28,000'],
        ],
      },
      {
        caption: 'Investment Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Opening balance', '15,000', 'By Bank A/c (sale)', '6,000'],
          ['To P&L A/c (profit)', '1,000', 'By Closing balance', '12,000'],
          ['To Bank A/c (purchase)', '2,000', '', ''],
          ['', '18,000', '', '18,000'],
        ],
      },
      {
        caption: 'Cash Flow Statement',
        head: ['Particulars', '₹', '₹'],
        rows: [
          ['Difference in Profit (12,000 − 10,000)', '', '2,000'],
          ['Add: General Reserve (bonus adj.)', '10,000', ''],
          ['Add: Provision for taxation', '16,000', ''],
          ['Add: Depreciation', '5,000', ''],
          ['Add: Preliminary expenses written off', '2,000', ''],
          ['Add: Interim dividend', '9,000', '42,000'],
          ['', '', '44,000'],
          ['Less: Profit on sale of Investment', '', '1,000'],
          ['Profit before working-capital changes', '', '43,000'],
          ['Add: Decrease in Debtors', '20,000', ''],
          ['Add: Increase in Creditors', '6,000', '26,000'],
          ['Less: Increase in Stock', '', '5,000'],
          ['', '', '64,000'],
          ['Less: Tax paid', '', '14,000'],
          ['(A) Cash Flow from Operating Activities', '', '50,000'],
          ['(B) Cash Flow from Investing Activities:', '', ''],
          ['Sale of Investment', '6,000', ''],
          ['Less: Purchase of Fixed Assets', '98,000', ''],
          ['Less: Purchase of Investments', '2,000', '(94,000)'],
          ['(C) Cash Flow from Financing Activities:', '', ''],
          ['Issue of Debentures', '50,000', ''],
          ['Less: Interim Dividend', '9,000', '41,000'],
          ['Net decrease in cash & cash equivalents', '', '(3,000)'],
          ['Add: Opening balance of Cash', '', '12,000'],
          ['Closing balance of Cash', '', '9,000'],
        ],
      },
    ],
    notes: [
      'Bonus issue: equity capital rose 1,00,000 → 1,50,000 (₹50,000) by capitalizing General Reserve, so it is a non-cash item — the ₹50,000 share increase is not a financing inflow, and General Reserve falls from 60,000 to 20,000 (₹40,000, being ₹50,000 bonus less ₹10,000 transfer).',
      'Provision for taxation is added back (₹16,000 = current-year provision) and tax actually paid (₹14,000) deducted separately.',
    ],
    answer:
      'Cash from Operating Activities ₹50,000; Investing (₹94,000); Financing ₹41,000 → net decrease ₹3,000; closing cash ₹9,000 (ties to the balance sheet).',
  },

  /* ============================ FUND FLOW ============================ */
  {
    id: 'ffq1',
    setId: 'fund-flow',
    difficulty: 'Medium',
    prompt:
      'The stock in a balance sheet was ₹72,000 on 31.3.2017 and ₹90,000 on 31.3.2018. The company had valued the previous year’s stock at 10% below cost, but at the beginning of the year that stock was written back to its original cost. The closing stock of the current year is valued at cost. How would you show this information in the fund flow statement?',
    solution: [
      {
        caption: 'Restating opening stock to cost',
        head: ['Particulars', '₹'],
        rows: [
          ['Stock on 31.3.2017 (valued at 90% of cost)', '72,000'],
          ['Cost of that stock (72,000 × 100 ÷ 90)', '80,000'],
          ['Stock on 31.3.2018 (at cost)', '90,000'],
          ['Increase in stock (at cost)', '10,000'],
        ],
      },
    ],
    notes: [
      'The previous stock of ₹72,000 was 90% of cost, so its cost = 72,000 × 100 ÷ 90 = ₹80,000. Comparing like-with-like at cost, stock rose from ₹80,000 to ₹90,000.',
    ],
    answer: 'Stock (at cost) increases by ₹10,000 — shown as an increase in current assets (application of funds / increase in working capital).',
  },
  {
    id: 'ffq2',
    setId: 'fund-flow',
    difficulty: 'Medium',
    prompt:
      'The balances of the Machinery Account and Depreciation Fund Account were: on 1.1.2018 — Machinery ₹7,00,000, Depreciation Fund ₹2,00,000; on 31.12.2018 — Machinery ₹8,00,000, Depreciation Fund ₹2,40,000. A machinery (cost ₹1,00,000, provision for depreciation ₹60,000) was sold at a loss of ₹10,000 on 31.12.2018. Prepare the Machinery Account and Depreciation Fund Account and find the purchase of machinery and the depreciation provided during the year.',
    solution: [
      {
        caption: 'Machinery Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Opening balance', '7,00,000', 'By Depreciation Fund A/c', '60,000'],
          ['To Bank A/c (purchases, bal. fig.)', '2,00,000', 'By Cash A/c (sale)', '30,000'],
          ['', '', 'By P&L A/c (loss on sale)', '10,000'],
          ['', '', 'By Closing balance', '8,00,000'],
          ['', '9,00,000', '', '9,00,000'],
        ],
      },
      {
        caption: 'Depreciation Fund Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Machinery A/c (on machine sold)', '60,000', 'By Opening balance', '2,00,000'],
          ['To Closing balance', '2,40,000', 'By P&L A/c (dep. for year, bal. fig.)', '1,00,000'],
          ['', '3,00,000', '', '3,00,000'],
        ],
      },
      {
        caption: 'Sale proceeds (working)',
        head: ['Particulars', '₹'],
        rows: [
          ['Cost of machine sold', '1,00,000'],
          ['Less: Provision for depreciation', '60,000'],
          ['Written-down value', '40,000'],
          ['Less: Loss on sale', '10,000'],
          ['Sale proceeds', '30,000'],
        ],
      },
    ],
    notes: [
      'Purchase of machinery is the balancing figure of the Machinery Account = ₹2,00,000; depreciation for the year is the balancing figure of the Depreciation Fund Account = ₹1,00,000.',
    ],
    answer: 'Purchase of machinery = ₹2,00,000; depreciation provided during the year = ₹1,00,000.',
  },
  {
    id: 'ffq3',
    setId: 'fund-flow',
    exam: 'M.A. 2008',
    difficulty: 'Hard',
    prompt: 'From the following balance sheet of Unmesh Ltd. and other information, prepare the fund flow statement with necessary related accounts.',
    given: [
      {
        caption: 'Balance Sheet',
        head: ['Particulars', '31.03.2006 (₹)', '31.03.2007 (₹)'],
        rows: [
          ['Equity Share capital', '3,00,000', '4,00,000'],
          ['General Reserve', '80,000', '1,00,000'],
          ['Profit and Loss A/c', '30,000', '50,000'],
          ['15% Debentures', '1,50,000', '1,00,000'],
          ['Sundry Creditors', '90,000', '70,000'],
          ['Provision for income tax', '50,000', '40,000'],
          ['Proposed dividend', '30,000', '40,000'],
          ['Total', '7,30,000', '8,00,000'],
          ['Plant and Machinery', '2,98,000', '4,29,250'],
          ['Goodwill', '1,00,000', '90,000'],
          ['Non-Current Investments', '1,00,000', '60,000'],
          ['Debenture Discount', '8,000', '5,000'],
          ['Inventories', '50,000', '80,000'],
          ['Debtors', '1,60,000', '1,10,000'],
          ['Cash and Bank', '10,000', '20,000'],
          ['Prepaid expenses', '4,000', '5,750'],
          ['Total', '7,30,000', '8,00,000'],
        ],
      },
    ],
    info: [
      '₹10,000 profit was earned on sale of investment.',
      '15% debentures were redeemed at a 5% premium.',
      '₹45,000 income-tax was paid during the year.',
      'A machine costing ₹50,000 (depreciated value ₹20,000) was sold for ₹35,000.',
      'A machine costing ₹10,000 (written-down value ₹3,000) was discarded.',
      '15% depreciation was charged on plant and machinery.',
    ],
    solution: [
      {
        caption: 'Schedule of Changes in Working Capital',
        head: ['Particulars', '2006 (₹)', '2007 (₹)', 'Increase (₹)', 'Decrease (₹)'],
        rows: [
          ['Current Assets:', '', '', '', ''],
          ['Stock', '50,000', '80,000', '30,000', '—'],
          ['Debtors', '1,60,000', '1,10,000', '—', '50,000'],
          ['Cash', '10,000', '20,000', '10,000', '—'],
          ['Prepaid expenses', '4,000', '5,750', '1,750', '—'],
          ['Current Liabilities:', '', '', '', ''],
          ['Creditors', '90,000', '70,000', '20,000', '—'],
          ['Increase in Working Capital', '', '', '', '11,750'],
          ['', '', '', '61,750', '61,750'],
        ],
      },
      {
        caption: 'Adjusted Profit & Loss Account (to find Funds from Operations)',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Loss on discard of machine', '3,000', 'By Opening balance', '30,000'],
          ['To Depreciation on machinery', '75,750', 'By Profit on investment', '10,000'],
          ['To General reserve', '20,000', 'By Profit on machine', '15,000'],
          ['To Proposed dividend', '40,000', 'By Funds from Operations', '1,84,250'],
          ['To Goodwill written off', '10,000', '', ''],
          ['To Debenture discount written off', '3,000', '', ''],
          ['To Premium on redemption', '2,500', '', ''],
          ['To Provision for tax', '35,000', '', ''],
          ['To Closing balance', '50,000', '', ''],
          ['', '2,39,250', '', '2,39,250'],
        ],
      },
      {
        caption: 'Fund Flow Statement',
        head: ['Sources', '₹', 'Applications', '₹'],
        rows: [
          ['Sale of investments', '50,000', 'Increase in working capital', '11,750'],
          ['Sale of machinery', '35,000', 'Redemption of debentures (with 5% premium)', '52,500'],
          ['Issue of equity shares', '1,00,000', 'Tax paid', '45,000'],
          ['Funds from Operations', '1,84,250', 'Purchase of machinery', '2,30,000'],
          ['', '', 'Dividend paid', '30,000'],
          ['', '3,69,250', '', '3,69,250'],
        ],
      },
    ],
    notes: [
      'Depreciation on machinery ₹75,750 = ₹41,250 on old machinery (15% on opening WDV net of items sold/discarded) + ₹34,500 on the new machine purchased during the year.',
      'Purchase of machinery ₹2,30,000 is derived from the Machinery Account after accounting for the sale (₹35,000), discard (₹3,000) and depreciation (₹75,750) against the rise from ₹2,98,000 to ₹4,29,250.',
      'Provision for tax and proposed dividend are treated as non-current (appropriations), so only creditors appear as a current liability in the working-capital schedule.',
    ],
    answer: 'Total sources = total applications = ₹3,69,250; Funds from Operations ₹1,84,250; increase in working capital ₹11,750.',
  },

  /* ============================ CASH FLOW ============================ */
  {
    id: 'cfq5',
    setId: 'cash-flow',
    exam: 'M.A. 2008',
    difficulty: 'Hard',
    prompt:
      'The following are the balance sheets of Kailaspati Ltd. for the years 2006 and 2007. Prepare a cash flow statement as per Accounting Standard No. 3.',
    given: [
      {
        caption: 'Balance Sheet',
        head: ['Particulars', '31.12.2006 (₹)', '31.12.2007 (₹)'],
        rows: [
          ['Equity Share capital (₹10 each)', '12,00,000', '21,00,000'],
          ['General Reserve', '8,40,000', '5,40,000'],
          ['Capital Reserve', '–', '60,000'],
          ['Profit and Loss A/c', '3,60,000', '4,50,000'],
          ['15% Debentures', '–', '6,00,000'],
          ['Sundry Creditors', '2,70,000', '3,60,000'],
          ['Bills payable', '2,40,000', '1,08,000'],
          ['Staff pension fund', '30,000', '60,000'],
          ['Provision for income tax', '2,40,000', '2,76,000'],
          ['Proposed dividend', '2,10,000', '3,00,000'],
          ['Total', '33,90,000', '48,54,000'],
          ['Land and Building', '12,30,000', '8,40,000'],
          ['Plant and Machinery', '3,60,000', '7,80,000'],
          ['Goodwill', '3,00,000', '2,82,000'],
          ['Non-Current Investments', '1,20,000', '3,00,000'],
          ['Preliminary Expenses', '42,000', '30,000'],
          ['Debenture Discount', '–', '36,000'],
          ['Inventories', '4,20,000', '10,50,000'],
          ['Debtors', '4,80,000', '9,48,000'],
          ['Bills receivable', '78,000', '2,52,000'],
          ['Cash and Bank balance', '3,60,000', '3,36,000'],
          ['Total', '33,90,000', '48,54,000'],
        ],
      },
    ],
    info: [
      'Land & Building of original cost ₹4,20,000 and written-down value ₹3,00,000 was sold for ₹4,80,000. Of the profit on sale, the capital profit was transferred to Capital Reserve and the revenue profit was credited to Profit & Loss A/c.',
      'Machinery costing ₹5,10,000 was purchased during the year.',
      'Debentures were issued at a 10% discount.',
      'Bonus shares were issued to existing shareholders by capitalising the required sum from General Reserve in the proportion 5:2.',
      'Paid the last year’s proposed dividend and also paid an interim dividend of ₹72,000.',
      'Paid ₹2,16,000 as tax for the last year.',
    ],
    requirement: 'Prepare the Cash Flow Statement as per AS 3.',
    solution: [
      {
        caption: 'Land & Building Account (to find depreciation and sale)',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Opening balance', '12,30,000', 'By Bank (sale)', '4,80,000'],
          ['To Capital Reserve (capital profit)', '60,000', 'By Depreciation', '90,000'],
          ['To P&L A/c (revenue profit)', '1,20,000', 'By Closing balance', '8,40,000'],
          ['', '14,10,000', '', '14,10,000'],
        ],
      },
      {
        caption: 'Provision for Taxation Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Bank (tax paid)', '2,16,000', 'By Opening balance', '2,40,000'],
          ['To Closing balance', '2,76,000', 'By P&L A/c', '2,52,000'],
          ['', '4,92,000', '', '4,92,000'],
        ],
      },
      {
        caption: 'Cash Flow Statement (AS 3)',
        head: ['Particulars', '₹', '₹'],
        rows: [
          ['Difference in profit (4,50,000 − 3,60,000)', '', '90,000'],
          ['Add: Transfer to General Reserve', '1,80,000', ''],
          ['Add: Provision for taxation', '2,52,000', ''],
          ['Add: Depreciation — Land & Building', '90,000', ''],
          ['Add: Depreciation — Plant', '90,000', ''],
          ['Add: Proposed dividend', '3,00,000', ''],
          ['Add: Debenture discount written off', '24,000', ''],
          ['Add: Goodwill written off', '18,000', ''],
          ['Add: Preliminary expenses written off', '12,000', ''],
          ['Add: Interim dividend', '72,000', '10,38,000'],
          ['', '', '11,28,000'],
          ['Less: Profit on sale of Land & Building', '', '1,20,000'],
          ['Profit before working-capital changes', '', '10,08,000'],
          ['Add: Increase in Staff pension fund', '30,000', ''],
          ['Add: Increase in Creditors', '90,000', '1,20,000'],
          ['', '', '11,28,000'],
          ['Less: Increase in Stock', '6,30,000', ''],
          ['Less: Increase in Debtors', '4,68,000', ''],
          ['Less: Increase in Bills receivable', '1,74,000', ''],
          ['Less: Decrease in Bills payable', '1,32,000', '14,04,000'],
          ['', '', '(2,76,000)'],
          ['Less: Tax paid', '', '2,16,000'],
          ['(A) Cash flow from Operating Activities', '', '(4,92,000)'],
          ['(B) Cash flow from Investing Activities', '', ''],
          ['Sale of Land & Building', '4,80,000', ''],
          ['Less: Purchase of Plant', '5,10,000', ''],
          ['Less: Purchase of Investments', '1,80,000', ''],
          ['(B) Net cash used in Investing Activities', '', '(2,10,000)'],
          ['(C) Cash flow from Financing Activities', '', ''],
          ['Issue of Debentures', '5,40,000', ''],
          ['Issue of Equity shares', '4,20,000', ''],
          ['Less: Dividend paid', '2,10,000', ''],
          ['Less: Interim dividend', '72,000', ''],
          ['(C) Cash flow from Financing Activities', '', '6,78,000'],
          ['Net decrease in cash & cash equivalents', '', '(24,000)'],
          ['Add: Opening balance of cash', '', '3,60,000'],
          ['Closing balance of cash', '', '3,36,000'],
        ],
      },
    ],
    notes: [
      'Working note — profit on sale of Land & Building: sold ₹4,80,000; original cost ₹4,20,000; WDV ₹3,00,000. Capital profit = 4,80,000 − 4,20,000 = ₹60,000 (to Capital Reserve). Revenue profit = 4,20,000 − 3,00,000 = ₹1,20,000 (to P&L). Total profit = ₹1,80,000.',
      'The depreciation add-back on Land & Building is ₹90,000 — the balancing figure of the Land & Building account — NOT ₹1,20,000. The ₹1,20,000 is the revenue profit on sale credited to P&L; using it as depreciation would double-count. (Some copies of the source solution mislabel this add-back as ₹1,20,000, but the operating subtotal there already uses ₹90,000.)',
      'Debentures ₹6,00,000 were issued at a 10% discount, so cash raised = ₹5,40,000 and debenture discount ₹60,000 arises (₹24,000 written off during the year, ₹36,000 carried forward).',
      'Bonus shares of ₹4,80,000 were issued from General Reserve (non-cash); the balance of the equity increase, ₹4,20,000, is the cash issue shown under financing.',
    ],
    answer: 'Closing balance of cash & cash equivalents = ₹3,36,000 (a net decrease of ₹24,000 for the year).',
  },

  /* ============================ FUND FLOW ============================ */
  {
    id: 'ffq4',
    setId: 'fund-flow',
    exam: 'M.A. 2008',
    difficulty: 'Easy',
    prompt:
      'State whether each of the following transactions results in a source of funds, an application of funds, or does not affect funds.',
    given: [
      {
        caption: 'Transactions',
        rows: [
          ['Sale of goods for cash ₹25,000'],
          ['Non-trading income ₹5,000'],
          ['Goods returned to suppliers ₹10,000'],
        ],
      },
    ],
    solution: [
      {
        caption: 'Classification',
        head: ['Transaction', 'Treatment'],
        rows: [
          ['Sale of goods for cash ₹25,000', 'Does not affect funds'],
          ['Non-trading income ₹5,000', 'Source of funds'],
          ['Goods returned to suppliers ₹10,000', 'Does not affect funds'],
        ],
      },
    ],
    notes: [
      'Cash sales convert one current asset (stock) into another (cash) — no change in working capital, so no flow of funds.',
      'Goods returned to suppliers reduce a current asset (stock) and a current liability (creditors) equally — no flow of funds.',
      'Non-trading income is a non-operating receipt that increases funds, hence a source of funds.',
    ],
    answer: 'Cash sales and goods returned to suppliers do not affect funds; non-trading income (₹5,000) is a source of funds.',
  },
  {
    id: 'ffq5',
    setId: 'fund-flow',
    exam: 'March/April 2007',
    difficulty: 'Hard',
    prompt:
      'The following are the balance sheets of Janki Ltd. as on 31st March 2005 and 31st March 2006. Prepare a statement showing changes in working capital and a statement of sources and application of funds.',
    given: [
      {
        caption: 'Balance Sheet',
        head: ['Particulars', '31.03.2005 (₹)', '31.03.2006 (₹)'],
        rows: [
          ['Equity Share capital', '65,000', '1,00,000'],
          ['Profit and Loss A/c', '25,000', '37,400'],
          ['Accumulated depreciation — Land and Buildings', '12,000', '9,000'],
          ['Accumulated depreciation — Furniture', '6,000', '5,600'],
          ['Accumulated depreciation — Motor vehicle', '9,000', '17,000'],
          ['Sundry Creditors', '99,999', '1,11,111'],
          ['Bills payable', '20,001', '18,889'],
          ['Total', '2,37,000', '2,99,000'],
          ['Land and Buildings at cost', '29,000', '45,000'],
          ['Furniture at cost', '16,000', '11,000'],
          ['Motor vehicle at cost', '20,000', '41,000'],
          ['Non-Current Investments', '52,100', '40,600'],
          ['Share issue expenses', '–', '6,000'],
          ['Inventories', '62,500', '97,600'],
          ['Debtors', '39,900', '34,100'],
          ['Cash', '17,500', '23,700'],
          ['Total', '2,37,000', '2,99,000'],
        ],
      },
    ],
    info: [
      'A building costing ₹19,000 (accumulated depreciation thereon ₹8,000) was sold for ₹25,000.',
      'No furniture was purchased during the year; part of the furniture on which accumulated depreciation of ₹1,000 was provided was sold for ₹2,500.',
      'Investments are recorded at cost; part of the investments, being worthless, was written off during the year.',
      'One-third of the share issue expenses was written off during the year.',
    ],
    requirement: 'Prepare (1) a Statement of Changes in Working Capital and (2) a Fund Flow Statement.',
    solution: [
      {
        caption: 'Schedule of Changes in Working Capital',
        head: ['Particulars', '31.03.05 (₹)', '31.03.06 (₹)', 'Increase (₹)', 'Decrease (₹)'],
        rows: [
          ['Stock', '62,500', '97,600', '35,100', '–'],
          ['Debtors', '39,900', '34,100', '–', '5,800'],
          ['Cash', '17,500', '23,700', '6,200', '–'],
          ['Creditors', '99,999', '1,11,111', '–', '11,112'],
          ['Bills payable', '20,001', '18,889', '1,112', '–'],
          ['Increase in Working Capital', '', '', '', '25,500'],
          ['', '', '', '42,412', '42,412'],
        ],
      },
      {
        caption: 'Land and Building Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Opening balance', '29,000', 'By Depreciation Fund', '8,000'],
          ['To P&L A/c (profit on sale)', '14,000', 'By Bank (sale)', '25,000'],
          ['To Bank (purchase)', '35,000', 'By Closing balance', '45,000'],
          ['', '78,000', '', '78,000'],
        ],
      },
      {
        caption: 'Furniture Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Opening balance', '16,000', 'By Depreciation Fund', '1,000'],
          ['', '', 'By Bank (sale)', '2,500'],
          ['', '', 'By P&L A/c (loss on sale)', '1,500'],
          ['', '', 'By Closing balance', '11,000'],
          ['', '16,000', '', '16,000'],
        ],
      },
      {
        caption: 'Adjusted Profit and Loss Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Depreciation — Land & Building', '5,000', 'By Opening balance', '25,000'],
          ['To Loss on sale of Furniture', '1,500', 'By Profit on Land & Building', '14,000'],
          ['To Depreciation — Furniture', '600', 'By Adjusted Profit', '28,000'],
          ['To Depreciation — Motor Vehicle', '8,000', '', ''],
          ['To Investment written off', '11,500', '', ''],
          ['To Share issue expenses written off', '3,000', '', ''],
          ['To Closing balance', '37,400', '', ''],
          ['', '67,000', '', '67,000'],
        ],
      },
      {
        caption: 'Fund Flow Statement',
        head: ['Sources of funds', '₹', 'Application of funds', '₹'],
        rows: [
          ['Sale of Land & Building', '25,000', 'Purchase of Land & Building', '35,000'],
          ['Sale of Furniture', '2,500', 'Purchase of Motor Vehicle', '21,000'],
          ['Issue of Equity Shares', '35,000', 'Share issue expenses', '9,000'],
          ['Adjusted Profit', '28,000', 'Increase in Working Capital', '25,500'],
          ['', '90,500', '', '90,500'],
        ],
      },
    ],
    notes: [
      'Depreciation charged for the year is the balancing figure of each depreciation-fund account: Land & Building ₹5,000, Furniture ₹600, Motor Vehicle ₹8,000.',
      'Profit on sale of building = ₹25,000 − (cost ₹19,000 − accumulated depreciation ₹8,000) = ₹25,000 − ₹11,000 = ₹14,000.',
      'Investment written off = 52,100 − 40,600 = ₹11,500 (no other investment movement given).',
      'Share issue expenses written off = one-third of ₹9,000 = ₹3,000; balance ₹6,000 remains on the balance sheet.',
    ],
    answer: 'Both sides of the Fund Flow Statement total ₹90,500 (with an increase in working capital of ₹25,500).',
  },
  {
    id: 'ffq6',
    setId: 'fund-flow',
    exam: 'March/April 2009',
    difficulty: 'Hard',
    prompt:
      'The balance sheets of Sailesh Ltd. as on 31-3-2007 and 31-3-2008 are given below. Prepare a fund flow statement with the necessary related statement and accounts.',
    given: [
      {
        caption: 'Balance Sheet',
        head: ['Particulars', '31.03.2007 (₹)', '31.03.2008 (₹)'],
        rows: [
          ['Equity Share capital (₹100)', '2,40,000', '4,00,000'],
          ['10% Pref. share capital (₹10 each, ₹7.5 paid up)', '90,000', '–'],
          ['General Reserve', '1,00,000', '90,000'],
          ['Share Premium', '20,000', '8,000'],
          ['Profit and Loss A/c', '40,000', '87,000'],
          ['15% Debentures', '–', '1,00,000'],
          ['Creditors', '60,000', '35,000'],
          ['Bank overdraft', '50,000', '–'],
          ['Provision for taxation', '25,000', '30,000'],
          ['Proposed Dividend', '25,000', '50,000'],
          ['Total', '6,50,000', '8,00,000'],
          ['Land and Buildings', '1,50,000', '2,00,000'],
          ['Machinery', '1,20,000', '2,50,000'],
          ['Goodwill', '1,60,000', '80,000'],
          ['Non-Current Investments', '60,000', '–'],
          ['Inventories', '40,000', '70,000'],
          ['Debtors', '80,000', '50,000'],
          ['Bills receivable', '20,000', '30,000'],
          ['Cash', '20,000', '30,000'],
          ['Bank balance', '–', '90,000'],
          ['Total', '6,50,000', '8,00,000'],
        ],
      },
    ],
    info: [
      'Investment was sold at a 25% profit on the sale proceeds.',
      'Depreciation written off: Land & Building ₹25,000; Machinery ₹20,000.',
      'Preference shares were redeemed at a 10% premium; ₹1,20,000 was transferred from General Reserve to Capital Redemption Reserve for this purpose.',
      'Bonus shares were issued to existing equity shareholders from Capital Redemption Reserve in the proportion 2:1.',
      'Debentures were issued at a 4% discount.',
      '₹30,000 was paid as tax for the last year.',
    ],
    requirement: 'Prepare the Schedule of Changes in Working Capital, the Adjusted P&L A/c and the Fund Flow Statement.',
    solution: [
      {
        caption: 'Schedule of Changes in Working Capital',
        head: ['Particulars', '31.03.07 (₹)', '31.03.08 (₹)', 'Increase (₹)', 'Decrease (₹)'],
        rows: [
          ['Stock', '40,000', '70,000', '30,000', '–'],
          ['Debtors', '80,000', '50,000', '–', '30,000'],
          ['Bills receivable', '20,000', '30,000', '10,000', '–'],
          ['Cash', '20,000', '30,000', '10,000', '–'],
          ['Bank', '–', '90,000', '90,000', '–'],
          ['Bank overdraft', '50,000', '–', '50,000', '–'],
          ['Creditors', '60,000', '35,000', '25,000', '–'],
          ['Increase in Working Capital', '', '', '', '1,85,000'],
          ['', '', '', '2,15,000', '2,15,000'],
        ],
      },
      {
        caption: 'Adjusted Profit and Loss Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Provision for income tax', '35,000', 'By Opening balance', '40,000'],
          ['To Depreciation — Land & Building', '25,000', 'By Profit on Investment', '20,000'],
          ['To Depreciation — Machinery', '20,000', 'By Adjusted Profit', '3,51,000'],
          ['To Transfer to General Reserve', '1,10,000', '', ''],
          ['To Debenture discount written off', '4,000', '', ''],
          ['To Goodwill written off', '80,000', '', ''],
          ['To Proposed dividend', '50,000', '', ''],
          ['To Closing balance', '87,000', '', ''],
          ['', '4,11,000', '', '4,11,000'],
        ],
      },
      {
        caption: 'Fund Flow Statement',
        head: ['Sources of funds', '₹', 'Application of funds', '₹'],
        rows: [
          ['Sale of Investment', '80,000', 'Purchase of Land & Building', '75,000'],
          ['Instalment on Preference shares', '30,000', 'Purchase of Machinery', '1,50,000'],
          ['Issue of Equity Shares', '40,000', 'Payment of taxes', '30,000'],
          ['Adjusted Profit', '3,51,000', 'Increase in Working Capital', '1,85,000'],
          ['Issue of Debentures', '96,000', 'Payment of dividend', '25,000'],
          ['', '', 'Payment to Preference shareholders', '1,32,000'],
          ['', '5,97,000', '', '5,97,000'],
        ],
      },
    ],
    notes: [
      'Investment sold at a 25% profit on sale proceeds: book value ₹60,000 = 75% of sale ⇒ sale = ₹80,000, profit ₹20,000.',
      'Debentures ₹1,00,000 issued at a 4% discount ⇒ cash raised ₹96,000 and debenture discount ₹4,000 (written off through P&L).',
      'Preference redemption at 10% premium: capital ₹1,20,000 + premium ₹12,000 = ₹1,32,000 paid to preference shareholders (premium met from Share Premium).',
      'Purchases: Land & Building ₹75,000 and Machinery ₹1,50,000 are the balancing figures after charging depreciation of ₹25,000 and ₹20,000 respectively.',
    ],
    answer: 'Both sides of the Fund Flow Statement total ₹5,97,000 (with an increase in working capital of ₹1,85,000).',
  },
  {
    id: 'ffq7',
    setId: 'fund-flow',
    exam: 'March/April 2010',
    difficulty: 'Hard',
    prompt:
      'The following are the balance sheets of Aum Co. Ltd. Prepare the Schedule of Changes in Working Capital and the Fund Flow Statement.',
    given: [
      {
        caption: 'Balance Sheet',
        head: ['Particulars', '31.03.2008 (₹)', '31.03.2009 (₹)'],
        rows: [
          ['Equity Share capital', '2,00,000', '4,00,000'],
          ['10% Pref. share capital (₹100 each, ₹80 paid up)', '2,00,000', '40,000'],
          ['General Reserve', '75,000', '88,000'],
          ['Share Premium', '25,000', '7,500'],
          ['Profit and Loss A/c', '80,000', '1,00,000'],
          ['10% Debentures', '50,000', '–'],
          ['Creditors', '40,000', '62,500'],
          ['Bills payable', '30,000', '15,000'],
          ['Provision for taxation', '35,000', '45,000'],
          ['Proposed Dividend', '25,000', '42,000'],
          ['Total', '7,60,000', '8,00,000'],
          ['Land and Buildings', '2,00,000', '2,40,000'],
          ['Machinery', '2,30,000', '3,00,000'],
          ['Goodwill', '50,000', '40,000'],
          ['Non-Current Investments', '80,000', '–'],
          ['Preliminary Expenses', '15,000', '5,000'],
          ['Inventories', '25,000', '70,000'],
          ['Debtors', '45,000', '31,000'],
          ['Bills receivable', '25,000', '14,000'],
          ['Bank balance', '90,000', '1,00,000'],
          ['Total', '7,60,000', '8,00,000'],
        ],
      },
    ],
    info: [
      'It was decided to redeem the preference shares at a 15% premium; calls in arrears were called up for this purpose and the money was received except on 500 shares. After fully utilising General Reserve, equity shares for the necessary amount were issued at a 10% premium (fully paid). The reserve so created while redeeming the preference shares was utilised in giving bonus shares.',
      'Investments were sold at a profit of 20% on the selling price.',
      'Depreciation written off: Land & Building ₹30,000; Machinery ₹45,000.',
      'A machine costing ₹1,00,000 (depreciation to date ₹60,000) was sold for ₹45,000.',
      'Debentures were redeemed at a 10% premium.',
      '₹30,000 was paid as tax for the last year and the previous year’s proposed dividend was also paid.',
    ],
    requirement: 'Prepare the Schedule of Changes in Working Capital, the Adjusted P&L A/c and the Fund Flow Statement.',
    solution: [
      {
        caption: 'Schedule of Changes in Working Capital',
        head: ['Particulars', '31.03.08 (₹)', '31.03.09 (₹)', 'Increase (₹)', 'Decrease (₹)'],
        rows: [
          ['Stock', '25,000', '70,000', '45,000', '–'],
          ['Debtors', '45,000', '31,000', '–', '14,000'],
          ['Bills receivable', '25,000', '14,000', '–', '11,000'],
          ['Bank', '90,000', '1,00,000', '10,000', '–'],
          ['Creditors', '40,000', '62,500', '–', '22,500'],
          ['Bills payable', '30,000', '15,000', '15,000', '–'],
          ['Increase in Working Capital', '', '', '', '22,500'],
          ['', '', '', '70,000', '70,000'],
        ],
      },
      {
        caption: 'Adjusted Profit and Loss Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Transfer to General Reserve', '88,000', 'By Opening balance', '80,000'],
          ['To Provision for income tax', '40,000', 'By Profit on Machinery', '5,000'],
          ['To Proposed dividend', '42,000', 'By Profit on Investment', '20,000'],
          ['To Goodwill written off', '10,000', 'By Adjusted Profit', '2,65,000'],
          ['To Depreciation — Land', '30,000', '', ''],
          ['To Depreciation — Machinery', '45,000', '', ''],
          ['To Debenture redemption premium', '5,000', '', ''],
          ['To Preliminary expenses written off', '10,000', '', ''],
          ['To Closing balance', '1,00,000', '', ''],
          ['', '3,70,000', '', '3,70,000'],
        ],
      },
      {
        caption: 'Fund Flow Statement',
        head: ['Sources of funds', '₹', 'Application of funds', '₹'],
        rows: [
          ['Sale of Investment', '1,00,000', 'Purchase of Machinery', '1,55,000'],
          ['Sale of Machinery', '45,000', 'Payment of Debentures', '55,000'],
          ['Issue of Equity Shares', '1,25,000', 'Payment of taxes', '30,000'],
          ['Securities Premium', '12,500', 'Increase in Working Capital', '22,500'],
          ['Instalment on Preference shares', '40,000', 'Payment of dividend', '25,000'],
          ['Adjusted Profit', '2,65,000', 'Payment to Preference shareholders', '2,30,000'],
          ['', '', 'Purchase of Land', '70,000'],
          ['', '5,87,500', '', '5,87,500'],
        ],
      },
    ],
    notes: [
      'Machine sold: cost ₹1,00,000 − depreciation ₹60,000 = WDV ₹40,000; sold for ₹45,000 ⇒ profit ₹5,000.',
      'Investment sold at 20% profit on selling price: book value ₹80,000 = 80% of sale ⇒ sale = ₹1,00,000, profit ₹20,000.',
      'Preference redemption at 15% premium: capital ₹2,00,000 + premium ₹30,000 = ₹2,30,000 paid; the ₹40,000 call money received on the partly-paid shares is the instalment shown as a source.',
      'Debentures ₹50,000 redeemed at a 10% premium ⇒ ₹55,000 paid to debenture holders (premium ₹5,000 charged to P&L).',
    ],
    answer: 'Both sides of the Fund Flow Statement total ₹5,87,500 (with an increase in working capital of ₹22,500).',
  },
  {
    id: 'ffq8',
    setId: 'fund-flow',
    exam: 'March/April 2011',
    difficulty: 'Hard',
    prompt:
      'The following are the balance sheets of Sai Ram Co. Ltd. as on 31st March. Prepare the Fund Flow Statement.',
    given: [
      {
        caption: 'Balance Sheet',
        head: ['Particulars', '31.03.2009 (₹)', '31.03.2010 (₹)'],
        rows: [
          ['Equity Share capital (₹100)', '2,00,000', '4,00,000'],
          ['Pref. share capital (₹10 each, ₹8 paid up)', '80,000', '4,000'],
          ['General Reserve', '1,20,000', '1,25,000'],
          ['Share Premium', '3,750', '–'],
          ['Profit and Loss A/c', '60,000', '1,10,000'],
          ['Capital Reserve', '2,000', '20,000'],
          ['Depreciation fund (machinery)', '20,000', '30,000'],
          ['Other current liabilities', '41,250', '43,000'],
          ['Provision for Tax', '40,000', '52,000'],
          ['Total', '5,67,000', '7,84,000'],
          ['Land and Buildings', '2,20,000', '2,70,000'],
          ['Machinery', '80,000', '1,50,000'],
          ['Vehicles', '33,000', '69,000'],
          ['Patents', '62,000', '50,000'],
          ['Underwriting Commission', '15,000', '10,000'],
          ['Other Current Assets', '1,57,000', '2,35,000'],
          ['Total', '5,67,000', '7,84,000'],
        ],
      },
    ],
    info: [
      'On 1.6.09 it was decided to redeem the preference shares at a 15% premium. The final call was made; all the call money except on 500 shares was received. On 31.12.09 the preference shares were redeemed and the reserve so created was utilised for issuing bonus shares to equity shareholders.',
      'A piece of land costing ₹30,000 was sold at a 30% profit and the profit on sale was credited to Capital Reserve.',
      'During the year a vehicle costing ₹45,000 was purchased and no vehicle was sold.',
      'A machine costing ₹40,000, on which accumulated depreciation was ₹12,000, was sold for ₹18,000.',
      'Tax liability for 2008-09 was ₹35,000; it was paid and the excess provision was transferred to General Reserve.',
      'Equity share dividend of the previous year was paid at 18%. During the year new equity shares were issued at a 10% premium.',
    ],
    requirement: 'Prepare the Schedule of Changes in Working Capital, the Adjusted P&L A/c and the Fund Flow Statement.',
    solution: [
      {
        caption: 'Schedule of Changes in Working Capital',
        head: ['Particulars', '31.03.09 (₹)', '31.03.10 (₹)', 'Increase (₹)', 'Decrease (₹)'],
        rows: [
          ['Total Current Assets', '1,57,000', '2,35,000', '78,000', '–'],
          ['Other current liabilities', '41,250', '43,000', '–', '1,750'],
          ['Increase in Working Capital', '', '', '', '76,250'],
          ['', '', '', '78,000', '78,000'],
        ],
      },
      {
        caption: 'Adjusted Profit and Loss Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Capital Redemption Reserve', '95,000', 'By Opening balance', '60,000'],
          ['To Capital Reserve (land profit)', '9,000', 'By Adjusted Profit', '3,00,000'],
          ['To Loss on sale of Machinery', '10,000', '', ''],
          ['To Depreciation — Machinery', '22,000', '', ''],
          ['To Depreciation — Vehicle', '9,000', '', ''],
          ['To Provision for tax', '52,000', '', ''],
          ['To Patent written off', '12,000', '', ''],
          ['To Underwriting commission written off', '5,000', '', ''],
          ['To Equity dividend', '36,000', '', ''],
          ['To Closing balance', '1,10,000', '', ''],
          ['', '3,60,000', '', '3,60,000'],
        ],
      },
      {
        caption: 'Fund Flow Statement',
        head: ['Sources of funds', '₹', 'Application of funds', '₹'],
        rows: [
          ['Sale of Land', '39,000', 'Increase in Working Capital', '76,250'],
          ['Sale of Machinery', '18,000', 'Purchase of Vehicle', '45,000'],
          ['Issue of Equity Shares', '1,05,000', 'Payment of taxes', '35,000'],
          ['Securities Premium', '10,500', 'Purchase of Machinery', '1,10,000'],
          ['Instalment on Preference shares', '19,000', 'Payment of Equity dividend', '36,000'],
          ['Adjusted Profit', '3,00,000', 'Payment to Preference shareholders', '1,09,250'],
          ['', '', 'Purchase of Land', '80,000'],
          ['', '4,91,500', '', '4,91,500'],
        ],
      },
    ],
    notes: [
      'Land sold: cost ₹30,000 at 30% profit ⇒ sale ₹39,000, profit ₹9,000 (credited to Capital Reserve).',
      'Machine sold: cost ₹40,000 − accumulated depreciation ₹12,000 = WDV ₹28,000; sold for ₹18,000 ⇒ loss ₹10,000.',
      'Depreciation on machinery for the year = ₹22,000 (balancing figure of the depreciation fund: opening 20,000 − transfer on sale 12,000 + current-year 22,000 = closing 30,000).',
      'Equity dividend = 18% on opening equity ₹2,00,000 = ₹36,000.',
      'Preference redemption at 15% premium: capital ₹95,000 + premium ₹14,250 = ₹1,09,250 paid; call money ₹19,000 received on partly-paid shares is a source. The ₹5,000 write-off is on Underwriting Commission (15,000 − 10,000); the source paper labels it "preliminary expenses" but the balance-sheet asset is underwriting commission.',
    ],
    answer: 'Both sides of the Fund Flow Statement total ₹4,91,500 (with an increase in working capital of ₹76,250).',
  },
  {
    id: 'ffq9',
    setId: 'fund-flow',
    exam: 'February March 2012',
    difficulty: 'Hard',
    prompt:
      'The balance sheets of Khyati Ltd. as on 31.3.2010 and 31.3.2011, together with the Statement of Profit and Loss for the year ended 31.3.2011, are given below. Prepare a statement showing changes in working capital and a statement of sources and application of funds for the year ended 31.3.2011.',
    given: [
      {
        caption: 'Balance Sheet',
        head: ['Particulars', '31.03.2010 (₹)', '31.03.2011 (₹)'],
        rows: [
          ['Equity Share capital', '5,00,000', '5,50,000'],
          ['Profit and Loss A/c', '2,00,000', '2,50,000'],
          ['Creditors', '2,50,000', '2,30,000'],
          ['Bank Overdraft', '–', '1,00,000'],
          ['Outstanding expenses', '10,000', '8,000'],
          ['Provision for income tax', '1,00,000', '1,20,000'],
          ['Total', '10,60,000', '12,58,000'],
          ['Land and Buildings (at cost / at market price)', '2,70,000', '3,30,000'],
          ['Machinery (less provision for depreciation)', '1,80,000', '4,60,000'],
          ['Furniture', '–', '33,000'],
          ['Non-Current Investments', '1,40,000', '1,60,000'],
          ['Inventories', '2,60,000', '1,00,000'],
          ['Debtors', '1,80,000', '1,50,000'],
          ['Cash & Bank', '30,000', '25,000'],
          ['Total', '10,60,000', '12,58,000'],
        ],
      },
      {
        caption: 'Statement of Profit and Loss for the year ended 31.3.2011',
        head: ['Particulars', '₹'],
        rows: [
          ['Sales', '30,45,000'],
          ['Less: Cost of goods sold and admin/selling/finance expenses (incl. depreciation ₹50,000 on machinery)', '28,90,000'],
          ['', '1,55,000'],
          ['Add: Profit on sale of machinery (cost of machinery sold ₹90,000)', '15,000'],
          ['', '1,70,000'],
          ['Add: Profit on re-valuation of Land & Building', '60,000'],
          ['', '2,30,000'],
          ['Less: Loss on sale of investments (cost of investments sold ₹70,000)', '10,000'],
          ['', '2,20,000'],
          ['Less: Provision for Income tax', '1,10,000'],
          ['', '1,10,000'],
          ['Add: Balance of previous year', '2,00,000'],
          ['', '3,10,000'],
          ['Less: Dividend paid', '60,000'],
          ['Balance carried forward', '2,50,000'],
        ],
      },
    ],
    info: [
      'Accumulated depreciation on machinery: ₹1,30,000 on 1.4.2010 and ₹1,25,000 on 31.3.2011.',
      'Land & Building was carried at cost ₹2,70,000 and is shown at market price ₹3,30,000 at year-end (revaluation profit ₹60,000).',
    ],
    requirement: 'Prepare (1) a Statement of Changes in Working Capital and (2) a Fund Flow Statement.',
    solution: [
      {
        caption: 'Schedule of Changes in Working Capital',
        head: ['Particulars', '31.03.10 (₹)', '31.03.11 (₹)', 'Increase (₹)', 'Decrease (₹)'],
        rows: [
          ['Debtors', '1,80,000', '1,50,000', '–', '30,000'],
          ['Stock', '2,60,000', '1,00,000', '–', '1,60,000'],
          ['Cash', '30,000', '25,000', '–', '5,000'],
          ['Creditors', '2,50,000', '2,30,000', '20,000', '–'],
          ['Bank Overdraft', '–', '1,00,000', '–', '1,00,000'],
          ['Outstanding expenses', '10,000', '8,000', '2,000', '–'],
          ['Decrease in Working Capital', '', '', '2,73,000', '–'],
          ['', '', '', '2,95,000', '2,95,000'],
        ],
      },
      {
        caption: 'Machinery Account (gross: net + provision for depreciation)',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Opening balance (1,80,000 + 1,30,000)', '3,10,000', 'By Depreciation (transfer on sale)', '55,000'],
          ['To P&L A/c (profit on sale)', '15,000', 'By Bank (sale)', '50,000'],
          ['To Bank (purchase)', '3,65,000', 'By Closing balance (4,60,000 + 1,25,000)', '5,85,000'],
          ['', '6,90,000', '', '6,90,000'],
        ],
      },
      {
        caption: 'Investment Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Opening balance', '1,40,000', 'By Bank (sale)', '60,000'],
          ['To Bank (purchase)', '90,000', 'By P&L A/c (loss)', '10,000'],
          ['', '', 'By Closing balance', '1,60,000'],
          ['', '2,30,000', '', '2,30,000'],
        ],
      },
      {
        caption: 'Adjusted Profit and Loss Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Depreciation on Machinery', '50,000', 'By Opening balance', '2,00,000'],
          ['To Loss on sale of Investment', '10,000', 'By Profit on Machinery', '15,000'],
          ['To Provision for income tax', '1,10,000', 'By Profit on Land & Building', '60,000'],
          ['To Dividend', '60,000', 'By Adjusted Profit', '2,05,000'],
          ['To Closing balance', '2,50,000', '', ''],
          ['', '4,80,000', '', '4,80,000'],
        ],
      },
      {
        caption: 'Fund Flow Statement',
        head: ['Sources of funds', '₹', 'Application of funds', '₹'],
        rows: [
          ['Issue of Equity Share Capital', '50,000', 'Purchase of Machinery', '3,65,000'],
          ['Adjusted Profit', '2,05,000', 'Purchase of Investment', '90,000'],
          ['Decrease in Working Capital', '2,73,000', 'Purchase of Furniture', '33,000'],
          ['Sale of Plant (machinery)', '50,000', 'Tax paid', '90,000'],
          ['Sale of Investment', '60,000', 'Dividend', '60,000'],
          ['', '6,38,000', '', '6,38,000'],
        ],
      },
    ],
    notes: [
      'Machinery is shown net of the provision for depreciation, so gross figures are used in the machinery account: opening 1,80,000 + 1,30,000 = ₹3,10,000; closing 4,60,000 + 1,25,000 = ₹5,85,000.',
      'Depreciation transferred out on the machine sold = opening 1,30,000 + current-year 50,000 − closing 1,25,000 = ₹55,000. WDV of the machine sold = cost 90,000 − 55,000 = ₹35,000; sold for ₹50,000 (₹35,000 + profit ₹15,000).',
      'Investment sold: cost ₹70,000 − loss ₹10,000 = sale ₹60,000; purchase ₹90,000 is the balancing figure.',
      'The net decrease in working capital of ₹2,73,000 is shown on the sources side of the fund flow statement.',
    ],
    answer: 'Both sides of the Fund Flow Statement total ₹6,38,000 (with a decrease in working capital of ₹2,73,000 shown as a source).',
  },
  {
    id: 'ffq10',
    setId: 'fund-flow',
    exam: 'February March 2013',
    difficulty: 'Medium',
    prompt:
      'Following is an extract from the balance sheet of Adarsh Co. Ltd. Calculate the funds from business operations.',
    given: [
      {
        caption: 'Extract from Balance Sheet',
        head: ['Particulars', '31.3.11 (₹)', '31.3.12 (₹)'],
        rows: [
          ['Profit and Loss Account (credit)', '17,50,000', '28,00,000'],
          ['Provision for taxation', '3,50,000', '5,25,000'],
          ['Proposed dividend', '1,75,000', '3,50,000'],
        ],
      },
    ],
    info: [
      'During the year tax of ₹87,500 was paid.',
      'During the year dividend for 2010-11 of ₹35,000 was paid.',
    ],
    requirement: 'Calculate the funds from business operations.',
    solution: [
      {
        caption: 'Provision for Income Tax Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Bank (tax paid)', '87,500', 'By Opening balance', '3,50,000'],
          ['To Closing balance', '5,25,000', 'By P&L A/c', '2,62,500'],
          ['', '6,12,500', '', '6,12,500'],
        ],
      },
      {
        caption: 'Proposed Dividend Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Bank (dividend paid)', '35,000', 'By Opening balance', '1,75,000'],
          ['To Closing balance', '3,50,000', 'By P&L A/c', '2,10,000'],
          ['', '3,85,000', '', '3,85,000'],
        ],
      },
      {
        caption: 'Adjusted Profit and Loss Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Provision for income tax', '2,62,500', 'By Opening balance', '17,50,000'],
          ['To Proposed dividend', '2,10,000', 'By Adjusted Profit (funds from operations)', '15,22,500'],
          ['To Closing balance', '28,00,000', '', ''],
          ['', '32,72,500', '', '32,72,500'],
        ],
      },
    ],
    notes: [
      'Provision for tax charged to P&L = closing 5,25,000 + tax paid 87,500 − opening 3,50,000 = ₹2,62,500.',
      'Proposed dividend charged to P&L = closing 3,50,000 + dividend paid 35,000 − opening 1,75,000 = ₹2,10,000.',
      'Funds from operations = closing P&L 28,00,000 + tax provision 2,62,500 + proposed dividend 2,10,000 − opening P&L 17,50,000 = ₹15,22,500.',
    ],
    answer: 'Funds from business operations = ₹15,22,500.',
  },
  {
    id: 'ffq11',
    setId: 'fund-flow',
    exam: 'February March 2013',
    difficulty: 'Hard',
    prompt:
      'Prepare a fund flow statement from the following balance sheets and other information of Meet Ltd.',
    given: [
      {
        caption: 'Balance Sheet',
        head: ['Particulars', '31.03.2011 (₹)', '31.03.2012 (₹)'],
        rows: [
          ['Equity Share capital', '6,00,000', '8,00,000'],
          ['12% Preference share capital', '2,00,000', '1,00,000'],
          ['Reserves', '52,000', '70,000'],
          ['Securities premium', '10,000', '30,000'],
          ['Profit and Loss A/c', '1,75,000', '1,50,000'],
          ['6% Debentures', '1,25,000', '1,00,000'],
          ['Sundry Creditors', '1,02,000', '1,33,000'],
          ['Interim Dividend unpaid', '–', '2,000'],
          ['Provision for income tax', '38,000', '48,000'],
          ['Total', '13,02,000', '14,33,000'],
          ['Land and Buildings', '2,02,000', '2,16,000'],
          ['Plant and Machinery', '4,20,000', '5,10,000'],
          ['Goodwill', '85,000', '80,000'],
          ['Patent', '30,000', '24,000'],
          ['Non-Current Investments', '1,00,000', '75,000'],
          ['Debenture Discount', '6,000', '5,000'],
          ['Inventories', '2,85,000', '3,37,000'],
          ['Debtors', '1,30,800', '1,46,400'],
          ['Prepaid expenses', '3,200', '4,600'],
          ['Advance Income tax', '40,000', '35,000'],
          ['Total', '13,02,000', '14,33,000'],
        ],
      },
    ],
    info: [
      'Preference share redemption was carried out on 31st March 2012.',
      'Dividend at 12% p.a. was paid on preference shares, and interim dividend on equity shares of ₹43,000 was paid in 2011-12.',
      'Depreciation of ₹26,000 and ₹79,000 was provided on land & building and plant respectively in 2011-12.',
      'Plant costing ₹60,000, purchased on 1st April 2009 and depreciated at 20% on W.D.V., was sold on 1st April 2011 for ₹30,000.',
      'Investments having a book value of ₹57,000 were sold for ₹49,000.',
      'Income tax assessment for the year ended 31st March 2011 was completed in June 2011 for a gross demand of ₹45,000; the balance after adjusting advance tax (2010-11) was paid in June 2011.',
    ],
    requirement: 'Prepare the Schedule of Changes in Working Capital, the Adjusted P&L A/c and the Fund Flow Statement.',
    solution: [
      {
        caption: 'Schedule of Changes in Working Capital',
        head: ['Particulars', '31.03.11 (₹)', '31.03.12 (₹)', 'Increase (₹)', 'Decrease (₹)'],
        rows: [
          ['Stock', '2,85,000', '3,37,000', '52,000', '–'],
          ['Debtors', '1,30,800', '1,46,400', '15,600', '–'],
          ['Prepaid expenses', '3,200', '4,600', '1,400', '–'],
          ['Creditors', '1,02,000', '1,33,000', '–', '31,000'],
          ['Increase in Working Capital', '', '', '', '38,000'],
          ['', '', '', '69,000', '69,000'],
        ],
      },
      {
        caption: 'Plant and Machinery Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Opening balance', '4,20,000', 'By Bank (sale)', '30,000'],
          ['To Bank (purchase)', '2,07,400', 'By P&L A/c (loss on sale)', '8,400'],
          ['', '', 'By P&L A/c (depreciation)', '79,000'],
          ['', '', 'By Closing balance', '5,10,000'],
          ['', '6,27,400', '', '6,27,400'],
        ],
      },
      {
        caption: 'Provision for Income Tax Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Advance Income Tax A/c', '40,000', 'By Opening balance', '38,000'],
          ['To Bank', '5,000', 'By P&L A/c', '55,000'],
          ['To Closing balance', '48,000', '', ''],
          ['', '93,000', '', '93,000'],
        ],
      },
      {
        caption: 'Adjusted Profit and Loss Account',
        head: ['Particulars', '₹', 'Particulars', '₹'],
        rows: [
          ['To Loss on sale of plant', '8,400', 'By Opening balance', '1,75,000'],
          ['To Provision for income tax', '55,000', 'By Adjusted Profit', '2,50,400'],
          ['To Interim dividend (43,000 + 2,000)', '45,000', '', ''],
          ['To Preference dividend', '24,000', '', ''],
          ['To Goodwill written off', '5,000', '', ''],
          ['To Patent written off', '6,000', '', ''],
          ['To Depreciation — Machinery', '79,000', '', ''],
          ['To Depreciation — Land', '26,000', '', ''],
          ['To Loss on sale of investment', '8,000', '', ''],
          ['To Transfer to Reserves', '18,000', '', ''],
          ['To Debenture discount written off', '1,000', '', ''],
          ['To Closing balance', '1,50,000', '', ''],
          ['', '4,25,400', '', '4,25,400'],
        ],
      },
      {
        caption: 'Fund Flow Statement',
        head: ['Sources of funds', '₹', 'Application of funds', '₹'],
        rows: [
          ['Issue of Equity Share Capital', '2,20,000', 'Increase in Working Capital', '38,000'],
          ['Adjusted Profit', '2,50,400', 'Purchase of Machinery', '2,07,400'],
          ['Sale of Plant', '30,000', 'Purchase of Land', '40,000'],
          ['Sale of Investment', '49,000', 'Purchase of Investment', '32,000'],
          ['', '', 'Payment to Preference shareholders', '1,00,000'],
          ['', '', 'Tax paid (35,000 + 5,000)', '40,000'],
          ['', '', 'Payment to Debenture holders', '25,000'],
          ['', '', 'Interim Dividend', '43,000'],
          ['', '', 'Preference dividend', '24,000'],
          ['', '5,49,400', '', '5,49,400'],
        ],
      },
    ],
    notes: [
      'Plant sold: cost ₹60,000; depreciation 1.4.09–31.3.10 (20%) ₹12,000 ⇒ ₹48,000; depreciation 1.4.10–31.3.11 (20% on WDV) ₹9,600 ⇒ WDV ₹38,400; sold for ₹30,000 ⇒ loss ₹8,400.',
      'Issue of equity = equity capital increase ₹2,00,000 + securities premium increase ₹20,000 = ₹2,20,000.',
      'Preference dividend = 12% on ₹2,00,000 = ₹24,000; interim dividend charged = ₹43,000 paid + ₹2,000 still unpaid = ₹45,000.',
      'Tax paid in cash = advance tax paid during the year ₹35,000 + balance of demand ₹5,000 = ₹40,000.',
    ],
    answer: 'Both sides of the Fund Flow Statement total ₹5,49,400 (with an increase in working capital of ₹38,000).',
  },
]

export const questionsForSet = (setId: string) => practiceQuestions.filter((q) => q.setId === setId)
