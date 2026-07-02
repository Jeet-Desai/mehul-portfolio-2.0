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
]

export const questionsForSet = (setId: string) => practiceQuestions.filter((q) => q.setId === setId)
