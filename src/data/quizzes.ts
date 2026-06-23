import { BookOpen, Calculator, Receipt, TrendingUp, LineChart } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/* ----------------------------------------------------------------------------
   Practice & Quizzes — seed question bank.
   Data-driven: add topics / questions here, the UI picks them up automatically.
   Every answer + explanation is checked for correctness (ships under Dr. Desai's
   name). Keep questions conceptual & stable (avoid year-specific numbers).
---------------------------------------------------------------------------- */

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type Question = {
  id: string
  topic: string
  difficulty: Difficulty
  question: string
  options: string[]
  /** index of the correct option */
  correct: number
  explanation: string
}

export type Topic = {
  id: string
  title: string
  blurb: string
  icon: LucideIcon
}

export const topics: Topic[] = [
  { id: 'accounting', title: 'Accounting Fundamentals', blurb: 'The accounting equation, golden rules, ledgers and final accounts.', icon: BookOpen },
  { id: 'costing', title: 'Cost & Management Accounting', blurb: 'Marginal costing, break-even, contribution and cost behaviour.', icon: Calculator },
  { id: 'taxation', title: 'Taxation (GST & Income Tax)', blurb: 'GST structure, input tax credit, TDS and the basics of income tax.', icon: Receipt },
  { id: 'fm', title: 'Financial Management', blurb: 'NPV/IRR, ratio analysis, cost of capital and working capital.', icon: TrendingUp },
  { id: 'eco-stats', title: 'Economics & Statistics', blurb: 'Elasticity, demand, measures of central tendency and index numbers.', icon: LineChart },
]

export const questions: Question[] = [
  // ---------------- Accounting ----------------
  {
    id: 'acc1',
    topic: 'accounting',
    difficulty: 'Easy',
    question: 'The fundamental accounting equation is:',
    options: ['Assets = Liabilities − Capital', 'Assets = Liabilities + Capital', 'Capital = Assets + Liabilities', 'Assets + Capital = Liabilities'],
    correct: 1,
    explanation: 'Assets are financed by owners (capital) and outsiders (liabilities), so Assets = Liabilities + Capital. This is also the basis of the balance sheet.',
  },
  {
    id: 'acc2',
    topic: 'accounting',
    difficulty: 'Easy',
    question: 'The golden rule for nominal accounts is:',
    options: ['Debit the receiver, credit the giver', 'Debit what comes in, credit what goes out', 'Debit all expenses and losses, credit all incomes and gains', 'Debit the giver, credit the receiver'],
    correct: 2,
    explanation: 'Nominal accounts record expenses, losses, incomes and gains. Rule: debit all expenses & losses, credit all incomes & gains.',
  },
  {
    id: 'acc3',
    topic: 'accounting',
    difficulty: 'Medium',
    question: 'Which of the following is a current asset?',
    options: ['Goodwill', 'Sundry debtors', 'Plant & machinery', 'Patents'],
    correct: 1,
    explanation: 'Sundry debtors (receivables) are expected to be realised within a year, so they are a current asset. The others are non-current/intangible assets.',
  },
  {
    id: 'acc4',
    topic: 'accounting',
    difficulty: 'Medium',
    question: 'Outstanding salary appearing in the adjustments is shown as a:',
    options: ['Current asset', 'Current liability', 'Fixed asset', 'Income'],
    correct: 1,
    explanation: 'Outstanding (unpaid) salary is an expense already incurred but not yet paid — a current liability shown on the balance sheet, and added to salary in the P&L.',
  },
  {
    id: 'acc5',
    topic: 'accounting',
    difficulty: 'Easy',
    question: 'A trial balance is prepared mainly to check the:',
    options: ['Profit for the year', 'Arithmetical accuracy of the ledger', 'Cash in hand', 'Value of closing stock'],
    correct: 1,
    explanation: 'A trial balance lists all ledger balances; if total debits equal total credits, the postings are arithmetically accurate (though some errors can still slip through).',
  },
  {
    id: 'acc6',
    topic: 'accounting',
    difficulty: 'Hard',
    question: 'Under the straight-line method, the annual depreciation charge over an asset’s life is:',
    options: ['Increasing each year', 'Decreasing each year', 'Constant each year', 'Zero in the first year'],
    correct: 2,
    explanation: 'SLM spreads (cost − salvage) evenly across the useful life, so the charge is the same every year — unlike WDV, where it falls each year.',
  },

  // ---------------- Costing ----------------
  {
    id: 'cost1',
    topic: 'costing',
    difficulty: 'Easy',
    question: 'Contribution is equal to:',
    options: ['Sales − Fixed cost', 'Sales − Variable cost', 'Fixed cost + Profit + Variable cost', 'Profit + Variable cost'],
    correct: 1,
    explanation: 'Contribution = Sales − Variable cost. It first covers fixed costs; whatever remains is profit (so Contribution = Fixed cost + Profit).',
  },
  {
    id: 'cost2',
    topic: 'costing',
    difficulty: 'Medium',
    question: 'The break-even point in units is calculated as:',
    options: ['Fixed cost ÷ Selling price per unit', 'Fixed cost ÷ Contribution per unit', 'Contribution ÷ Fixed cost', 'Fixed cost × P/V ratio'],
    correct: 1,
    explanation: 'At break-even, total contribution exactly equals fixed cost, so BEP (units) = Fixed cost ÷ Contribution per unit.',
  },
  {
    id: 'cost3',
    topic: 'costing',
    difficulty: 'Medium',
    question: 'The P/V (profit-volume) ratio is:',
    options: ['(Contribution ÷ Sales) × 100', '(Profit ÷ Sales) × 100', '(Fixed cost ÷ Sales) × 100', '(Sales ÷ Contribution) × 100'],
    correct: 0,
    explanation: 'P/V ratio = (Contribution ÷ Sales) × 100. It shows how much of each rupee of sales is available to cover fixed cost and profit.',
  },
  {
    id: 'cost4',
    topic: 'costing',
    difficulty: 'Hard',
    question: 'In marginal costing, fixed manufacturing overheads are treated as:',
    options: ['A product cost, carried in inventory', 'A period cost, written off in full', 'A variable cost', 'Part of prime cost'],
    correct: 1,
    explanation: 'Marginal costing charges fixed overheads in full against the period (period cost). Only variable cost attaches to product/inventory — the key difference from absorption costing.',
  },
  {
    id: 'cost5',
    topic: 'costing',
    difficulty: 'Easy',
    question: 'Which cost stays constant per unit but changes in total with output?',
    options: ['Fixed cost', 'Variable cost', 'Semi-variable cost', 'Sunk cost'],
    correct: 1,
    explanation: 'Variable cost is constant per unit (e.g. ₹20/unit) but its total rises with output. Fixed cost is the opposite — constant in total, falling per unit as output rises.',
  },
  {
    id: 'cost6',
    topic: 'costing',
    difficulty: 'Medium',
    question: 'Margin of safety is:',
    options: ['BEP sales − Actual sales', 'Actual sales − BEP sales', 'Fixed cost ÷ P/V ratio', 'Contribution − Fixed cost'],
    correct: 1,
    explanation: 'Margin of safety = Actual (or budgeted) sales − Break-even sales. It is the cushion by which sales can fall before the firm makes a loss.',
  },

  // ---------------- Taxation ----------------
  {
    id: 'tax1',
    topic: 'taxation',
    difficulty: 'Easy',
    question: 'GST in India is best described as a:',
    options: ['Origin-based production tax', 'Destination-based consumption tax', 'Direct tax on income', 'Tax only on services'],
    correct: 1,
    explanation: 'GST is a destination-based (consumption) tax — revenue accrues to the state where the goods/services are consumed, not where they are produced.',
  },
  {
    id: 'tax2',
    topic: 'taxation',
    difficulty: 'Easy',
    question: 'An intra-state supply (within the same state) attracts:',
    options: ['IGST only', 'CGST + SGST', 'CGST only', 'SGST + IGST'],
    correct: 1,
    explanation: 'Intra-state supplies attract CGST (to the Centre) and SGST (to the State) in equal halves. Inter-state supplies attract IGST.',
  },
  {
    id: 'tax3',
    topic: 'taxation',
    difficulty: 'Medium',
    question: 'While setting off input tax credit, the credit of IGST must first be used against:',
    options: ['SGST liability', 'CGST liability', 'IGST liability', 'Any liability in any order'],
    correct: 2,
    explanation: 'Per s.49A & Rule 88A, IGST credit is utilised first against IGST liability, and only the remainder against CGST/SGST (in any order) — IGST credit must be fully exhausted before CGST/SGST credit is used.',
  },
  {
    id: 'tax4',
    topic: 'taxation',
    difficulty: 'Medium',
    question: 'TDS under section 194C on a payment to an individual contractor is at:',
    options: ['1%', '2%', '5%', '10%'],
    correct: 0,
    explanation: 'Section 194C deducts 1% when the contractor is an individual/HUF and 2% for other payees, once the threshold is crossed.',
  },
  {
    id: 'tax5',
    topic: 'taxation',
    difficulty: 'Hard',
    question: 'Which of the following levies was NOT subsumed into GST?',
    options: ['Central excise duty', 'Service tax', 'State VAT', 'Basic customs duty'],
    correct: 3,
    explanation: 'Basic customs duty (BCD) on imports remains outside GST. Excise duty, service tax and state VAT were all subsumed into GST.',
  },
  {
    id: 'tax6',
    topic: 'taxation',
    difficulty: 'Easy',
    question: 'Income tax in India is a:',
    options: ['Indirect tax', 'Direct tax', 'Cess only', 'State subject'],
    correct: 1,
    explanation: 'Income tax is a direct tax — its burden falls on the person who earns the income and cannot be shifted to someone else.',
  },

  // ---------------- Financial Management ----------------
  {
    id: 'fm1',
    topic: 'fm',
    difficulty: 'Easy',
    question: 'Under the NPV rule, a project should be accepted when its NPV is:',
    options: ['Less than zero', 'Equal to zero', 'Greater than zero', 'Equal to the initial outlay'],
    correct: 2,
    explanation: 'A positive NPV means the project earns more than the cost of capital and adds value — so accept when NPV > 0.',
  },
  {
    id: 'fm2',
    topic: 'fm',
    difficulty: 'Medium',
    question: 'The internal rate of return (IRR) is the discount rate at which:',
    options: ['NPV is maximum', 'NPV equals zero', 'Payback is shortest', 'Profitability index is zero'],
    correct: 1,
    explanation: 'IRR is the rate that makes the NPV of a project’s cash flows exactly zero. Accept if IRR exceeds the cost of capital.',
  },
  {
    id: 'fm3',
    topic: 'fm',
    difficulty: 'Easy',
    question: 'The current ratio is calculated as:',
    options: ['Current assets ÷ Current liabilities', 'Current liabilities ÷ Current assets', 'Quick assets ÷ Current liabilities', 'Current assets ÷ Total assets'],
    correct: 0,
    explanation: 'Current ratio = Current assets ÷ Current liabilities — a liquidity measure; a ratio around 2:1 is conventionally considered satisfactory.',
  },
  {
    id: 'fm4',
    topic: 'fm',
    difficulty: 'Medium',
    question: 'The quick (acid-test) ratio excludes which item from current assets?',
    options: ['Debtors', 'Cash', 'Inventory', 'Marketable securities'],
    correct: 2,
    explanation: 'The quick ratio removes inventory (and prepaid expenses) because they are the least liquid current assets, giving a stricter test of short-term solvency.',
  },
  {
    id: 'fm5',
    topic: 'fm',
    difficulty: 'Hard',
    question: 'WACC (weighted average cost of capital) represents the:',
    options: ['Cost of equity only', 'Average return demanded by all providers of capital', 'Cost of the cheapest source of finance', 'Risk-free rate'],
    correct: 1,
    explanation: 'WACC blends the cost of equity, debt and preference capital by their weights. It is the minimum return a project must earn to satisfy all capital providers.',
  },
  {
    id: 'fm6',
    topic: 'fm',
    difficulty: 'Medium',
    question: 'A profitability index (PI) greater than 1 indicates that a project should be:',
    options: ['Rejected', 'Accepted', 'Deferred indefinitely', 'Treated as break-even'],
    correct: 1,
    explanation: 'PI = PV of inflows ÷ initial investment. PI > 1 means the present value of benefits exceeds the cost (the same decision as NPV > 0), so accept.',
  },

  // ---------------- Economics & Statistics ----------------
  {
    id: 'eco1',
    topic: 'eco-stats',
    difficulty: 'Easy',
    question: 'The law of demand states that, other things being equal, as price rises the quantity demanded:',
    options: ['Rises', 'Falls', 'Stays the same', 'Becomes zero'],
    correct: 1,
    explanation: 'The law of demand: price and quantity demanded move inversely (ceteris paribus) — a higher price reduces the quantity demanded.',
  },
  {
    id: 'eco2',
    topic: 'eco-stats',
    difficulty: 'Medium',
    question: 'If the price elasticity of demand is 0, demand is said to be:',
    options: ['Perfectly elastic', 'Perfectly inelastic', 'Unit elastic', 'Relatively elastic'],
    correct: 1,
    explanation: 'Elasticity of 0 means quantity demanded does not change at all when price changes — perfectly inelastic demand (a vertical demand curve).',
  },
  {
    id: 'eco3',
    topic: 'eco-stats',
    difficulty: 'Easy',
    question: 'The arithmetic mean of 2, 4, 6, 8 and 10 is:',
    options: ['5', '6', '7', '30'],
    correct: 1,
    explanation: 'Mean = (2+4+6+8+10) ÷ 5 = 30 ÷ 5 = 6.',
  },
  {
    id: 'eco4',
    topic: 'eco-stats',
    difficulty: 'Medium',
    question: 'The median of the values 3, 5, 7, 9, 11 is:',
    options: ['5', '7', '9', '35'],
    correct: 1,
    explanation: 'For an odd, ordered data set the median is the middle value. Here that is the 3rd value, 7.',
  },
  {
    id: 'eco5',
    topic: 'eco-stats',
    difficulty: 'Hard',
    question: 'The Laspeyres price index uses weights based on:',
    options: ['Current-year quantities', 'Base-year quantities', 'Average of base and current quantities', 'Current-year prices'],
    correct: 1,
    explanation: 'The Laspeyres index weights prices by base-year quantities. (The Paasche index uses current-year quantities; Fisher’s is the geometric mean of the two.)',
  },
  {
    id: 'eco6',
    topic: 'eco-stats',
    difficulty: 'Hard',
    question: 'A Giffen good is unusual because its demand curve is:',
    options: ['Downward sloping', 'Upward sloping', 'Horizontal', 'Vertical'],
    correct: 1,
    explanation: 'A Giffen good (a special inferior good) violates the law of demand — quantity demanded rises as price rises, so its demand curve slopes upward.',
  },
]

export const questionsForTopic = (topicId: string): Question[] =>
  questions.filter((q) => q.topic === topicId)
