/* ----------------------------------------------------------------------------
   Ask CommerceLab — frequently-asked doubts with worked answers.
   Data-driven; answered doubts from students can be promoted into this list.
---------------------------------------------------------------------------- */

export type Faq = {
  id: string
  category: string
  question: string
  answer: string
}

export const faqCategories = ['Accounting', 'Costing', 'Taxation', 'Finance', 'Exams'] as const

export const faqs: Faq[] = [
  {
    id: 'f1',
    category: 'Accounting',
    question: 'What is the difference between capital expenditure and revenue expenditure?',
    answer:
      'Capital expenditure gives a benefit lasting more than one year — buying machinery, a building or a vehicle — and is shown on the balance sheet as an asset. Revenue expenditure is for day-to-day running — rent, salaries, repairs — and is charged in full to the profit & loss account of the same year. Rule of thumb: if it creates or enhances an asset, it is capital; if it merely maintains earning capacity, it is revenue.',
  },
  {
    id: 'f2',
    category: 'Accounting',
    question: 'Straight-line vs written-down value depreciation — what changes?',
    answer:
      'SLM charges the same amount every year: (Cost − Salvage) ÷ Useful life. WDV charges a fixed percentage on the reducing book value, so the charge is high early on and falls each year. SLM suits assets that wear evenly; WDV suits assets that lose more value early (and matches higher repair costs later). Total depreciation over the life is the same — only the timing differs.',
  },
  {
    id: 'f3',
    category: 'Accounting',
    question: 'What does a current ratio of 2:1 actually mean?',
    answer:
      'Current ratio = Current assets ÷ Current liabilities. A 2:1 ratio means the firm has ₹2 of short-term assets for every ₹1 of short-term dues — generally considered comfortable liquidity. Too low (below 1) signals possible trouble paying bills; too high may mean idle cash or slow-moving stock. Always read it with the quick ratio, which strips out inventory.',
  },
  {
    id: 'f4',
    category: 'Costing',
    question: 'How do I calculate the break-even point?',
    answer:
      'First find contribution per unit = Selling price − Variable cost per unit. Then BEP (units) = Fixed cost ÷ Contribution per unit, and BEP (₹) = Fixed cost ÷ P/V ratio, where P/V ratio = Contribution ÷ Sales. Example: fixed cost ₹50,000, price ₹100, variable ₹60 → contribution ₹40 → BEP = 50,000 ÷ 40 = 1,250 units.',
  },
  {
    id: 'f5',
    category: 'Costing',
    question: 'Why do marginal and absorption costing show different profits?',
    answer:
      'They treat fixed manufacturing overhead differently. Marginal costing writes it off in full as a period cost; absorption costing attaches it to each unit, so some sits inside closing stock. When production exceeds sales (stock rises), absorption shows higher profit because fixed cost is "carried forward" in inventory. The difference = change in stock units × fixed overhead per unit.',
  },
  {
    id: 'f6',
    category: 'Taxation',
    question: 'What is the difference between CGST, SGST and IGST?',
    answer:
      'For a sale within the same state (intra-state), GST splits into CGST (to the Central government) and SGST (to the State) — half each. For a sale across states (inter-state), a single IGST is charged instead, which the Centre later shares with the destination state. So the same 18% is either 9% + 9% (CGST + SGST) or 18% IGST, depending on where the buyer is.',
  },
  {
    id: 'f7',
    category: 'Taxation',
    question: 'Old vs new income-tax regime — how do I decide?',
    answer:
      'The new regime has lower slab rates but removes most deductions and exemptions; the old regime has higher rates but lets you claim 80C, HRA, home-loan interest and more. The thumb rule: if you invest heavily and claim large deductions, the old regime may win; if you claim few deductions, the new regime is usually simpler and cheaper. Compute both — the Income Tax calculator in the Learn Hub shows the cheaper option side by side.',
  },
  {
    id: 'f8',
    category: 'Finance',
    question: 'What is the difference between NPV and IRR?',
    answer:
      'NPV is the rupee value a project adds after discounting its cash flows at your cost of capital — accept if NPV > 0. IRR is the discount rate at which NPV becomes zero — accept if IRR > cost of capital. NPV is an absolute amount; IRR is a percentage. For ranking mutually-exclusive projects, NPV is more reliable because IRR can mislead when project sizes or cash-flow patterns differ.',
  },
  {
    id: 'f9',
    category: 'Exams',
    question: 'How should I prepare for accountancy and costing exams?',
    answer:
      'Practise problems with a pen, not just by reading — accountancy is a skill. Master the format (journal, ledger, final accounts, cost sheets) so presentation marks come easily. Always show your working step by step; examiners award method marks even if the final figure slips. Time each question to its marks, and revise theory (concepts, differences, definitions) the day before — they are easy scoring areas.',
  },
]
