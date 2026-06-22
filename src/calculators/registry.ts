import { TrendingUp, Receipt, Landmark, Wallet, Building2 } from 'lucide-react'
import type { Calculator } from './types'

export const calculators: Calculator[] = [
  {
    slug: 'break-even',
    title: 'Break-even / CVP',
    category: 'Costing',
    blurb: 'Find the break-even point, P/V ratio and margin of safety — with a live cost-volume-profit chart.',
    icon: TrendingUp,
    load: () => import('./BreakEven'),
    tags: ['cvp', 'contribution', 'pv ratio', 'margin of safety', 'marginal costing'],
  },
  {
    slug: 'income-tax',
    title: 'Income Tax — Old vs New',
    category: 'Taxation',
    blurb: 'Compare both regimes side by side for FY 2025-26, with slab-wise working and the cheaper option.',
    icon: Landmark,
    load: () => import('./IncomeTax'),
    tags: ['tds', 'slabs', 'regime', '87a', 'rebate'],
  },
  {
    slug: 'gst',
    title: 'GST Calculator',
    category: 'Taxation',
    blurb: 'Add or remove GST and split it into CGST + SGST or IGST, with the full breakdown.',
    icon: Receipt,
    load: () => import('./Gst'),
    tags: ['cgst', 'sgst', 'igst', 'tax', 'invoice'],
  },
  {
    slug: 'emi',
    title: 'EMI / Loan',
    category: 'Finance',
    blurb: 'Calculate the monthly EMI, total interest and payment — with a principal-vs-interest breakup.',
    icon: Wallet,
    load: () => import('./Emi'),
    tags: ['loan', 'interest', 'amortisation', 'installment'],
  },
  {
    slug: 'depreciation',
    title: 'Depreciation — SLM vs WDV',
    category: 'Accounting',
    blurb: 'Straight-line or written-down value, with a full year-by-year depreciation schedule.',
    icon: Building2,
    load: () => import('./Depreciation'),
    tags: ['slm', 'wdv', 'asset', 'schedule', 'book value'],
  },
]

export const getCalculator = (slug: string): Calculator | undefined =>
  calculators.find((c) => c.slug === slug)
