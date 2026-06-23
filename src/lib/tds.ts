import { round } from './format'

/* ----------------------------------------------------------------------------
   TDS — section-wise rates & thresholds, India, FY 2025-26 (AY 2026-27).
   For learning only. Verify against the latest Finance Act / a CA before use.

   Rates & thresholds verified June 2026 against ClearTax and TDSMAN charts,
   incorporating the Finance Act, 2025 changes effective 1 April 2025:
   - 194A: threshold ₹50,000 (₹1,00,000 for senior citizens) for bank/PO interest.
   - 194 (dividend): threshold doubled to ₹10,000.
   - 194H / 194D (non-company): rate 2%, threshold ₹20,000.
   - 194J: threshold raised to ₹50,000 (professional 10%, technical 2%).
   - 194-I: threshold ₹50,000 per month (was ₹2,40,000 per year).
   - 194-IB: rate 2% (from 5%, w.e.f. 1 Oct 2024).
   Section 206AA: without PAN, TDS is the higher of the section rate or 20%
   (5% for section 194Q).
---------------------------------------------------------------------------- */

export type RateOption = { label: string; value: number }

export type TdsSection = {
  code: string
  /** short title for the dropdown */
  title: string
  /** full description of the nature of payment */
  nature: string
  /** one or more rate choices (some sections vary by payee type) */
  rates: RateOption[]
  /** primary threshold (rupees) */
  threshold: number
  /** human-readable basis of the threshold */
  basis: string
  /** 194A: higher threshold for senior citizens */
  seniorThreshold?: number
  /** 194C: aggregate annual threshold — TDS if single OR aggregate is crossed */
  aggregateThreshold?: number
  /** 194Q: TDS only on the value above the threshold (default = whole amount) */
  taxableOn?: 'whole' | 'excess'
  /** override for the no-PAN rate (default = higher of the rate or 20%) */
  noPanRate?: number
  notes?: string[]
}

export const TDS_SECTIONS: TdsSection[] = [
  {
    code: '192A',
    title: '192A — Premature EPF withdrawal',
    nature: 'Payment of accumulated provident-fund balance to an employee (premature withdrawal before 5 years of service).',
    rates: [{ label: 'All payees', value: 10 }],
    threshold: 50000,
    basis: 'in a financial year',
    notes: ['No TDS if the taxable withdrawal is below ₹50,000.'],
  },
  {
    code: '193',
    title: '193 — Interest on securities',
    nature: 'Interest on securities such as debentures and government securities.',
    rates: [{ label: 'All payees', value: 10 }],
    threshold: 10000,
    basis: 'in a financial year',
  },
  {
    code: '194',
    title: '194 — Dividend',
    nature: 'Dividend paid by a domestic company to a resident shareholder.',
    rates: [{ label: 'All payees', value: 10 }],
    threshold: 10000,
    basis: 'in a financial year',
    notes: ['Threshold raised from ₹5,000 to ₹10,000 by the Finance Act, 2025.'],
  },
  {
    code: '194A',
    title: '194A — Interest (other than securities)',
    nature: 'Interest from banks, co-operative banks and post-office deposits (and other interest).',
    rates: [{ label: 'All payees', value: 10 }],
    threshold: 50000,
    seniorThreshold: 100000,
    basis: 'in a financial year',
    notes: [
      'Bank / co-op bank / post-office deposits: ₹50,000 (₹1,00,000 for senior citizens).',
      'Interest from others (e.g. company deposits, loans, NBFCs): the threshold is ₹10,000.',
      'Thresholds raised by the Finance Act, 2025.',
    ],
  },
  {
    code: '194C',
    title: '194C — Payment to contractors',
    nature: 'Payment to a resident contractor or sub-contractor for carrying out any work (incl. supply of labour).',
    rates: [
      { label: 'Individual / HUF', value: 1 },
      { label: 'Other (company, firm, etc.)', value: 2 },
    ],
    threshold: 30000,
    aggregateThreshold: 100000,
    basis: 'a single payment of ₹30,000, or ₹1,00,000 in aggregate during the year',
    notes: [
      'TDS applies if a single payment exceeds ₹30,000, OR the aggregate during the year exceeds ₹1,00,000.',
      'No TDS to a transporter (owning ≤ 10 goods carriages) who furnishes a PAN and a declaration.',
    ],
  },
  {
    code: '194D',
    title: '194D — Insurance commission',
    nature: 'Commission or remuneration for soliciting or procuring insurance business.',
    rates: [
      { label: 'Resident (non-company)', value: 2 },
      { label: 'Domestic company', value: 10 },
    ],
    threshold: 20000,
    basis: 'in a financial year',
    notes: ['Rate for non-company payees reduced to 2% and threshold raised to ₹20,000 by the Finance Act, 2025.'],
  },
  {
    code: '194DA',
    title: '194DA — Life insurance maturity',
    nature: 'Taxable payment under a life-insurance policy (the income component, not the whole sum assured).',
    rates: [{ label: 'All payees', value: 2 }],
    threshold: 100000,
    basis: 'in a financial year',
    notes: ['TDS is on the income portion only (amount received less premiums paid). Rate is 2% (from 5%).'],
  },
  {
    code: '194H',
    title: '194H — Commission or brokerage',
    nature: 'Commission or brokerage paid to a resident (other than insurance commission).',
    rates: [{ label: 'All payees', value: 2 }],
    threshold: 20000,
    basis: 'in a financial year',
    notes: ['Rate reduced to 2% and threshold raised to ₹20,000 by the Finance Act, 2025.'],
  },
  {
    code: '194-I',
    title: '194-I — Rent',
    nature: 'Rent for the use of land, building, furniture, plant or machinery (payer liable to tax audit).',
    rates: [
      { label: 'Plant, machinery or equipment', value: 2 },
      { label: 'Land, building or furniture', value: 10 },
    ],
    threshold: 50000,
    basis: 'per month or part of a month',
    notes: ['Threshold changed to ₹50,000 per month (from ₹2,40,000 per year) by the Finance Act, 2025.'],
  },
  {
    code: '194-IA',
    title: '194-IA — Transfer of immovable property',
    nature: 'Purchase of immovable property (other than agricultural land) from a resident.',
    rates: [{ label: 'All payees', value: 1 }],
    threshold: 5000000,
    basis: 'sale consideration / stamp-duty value (whichever is higher)',
    notes: ['TDS @ 1% applies if the consideration or stamp-duty value is ₹50 lakh or more.'],
  },
  {
    code: '194-IB',
    title: '194-IB — Rent by individual / HUF (not under audit)',
    nature: 'Rent paid by an individual or HUF who is not liable to a tax audit.',
    rates: [{ label: 'All payees', value: 2 }],
    threshold: 50000,
    basis: 'per month or part of a month',
    notes: ['Rate reduced to 2% (from 5%) w.e.f. 1 Oct 2024. Deducted once a year (or when the property is vacated).'],
  },
  {
    code: '194J',
    title: '194J — Professional / technical fees',
    nature: 'Fees for professional or technical services, royalty and non-compete fees.',
    rates: [
      { label: 'Professional services / royalty', value: 10 },
      { label: 'Technical services / call-centre', value: 2 },
    ],
    threshold: 50000,
    basis: 'in a financial year',
    notes: ['Threshold raised from ₹30,000 to ₹50,000 by the Finance Act, 2025.'],
  },
  {
    code: '194K',
    title: '194K — Income from mutual-fund units',
    nature: 'Income (dividend) distributed on mutual-fund units to a resident.',
    rates: [{ label: 'All payees', value: 10 }],
    threshold: 10000,
    basis: 'in a financial year',
    notes: ['Applies to dividend/income distribution, not to capital gains on redemption.'],
  },
  {
    code: '194Q',
    title: '194Q — Purchase of goods',
    nature: 'Purchase of goods by a buyer whose turnover exceeds ₹10 crore in the preceding year.',
    rates: [{ label: 'All payees', value: 0.1 }],
    threshold: 5000000,
    basis: 'in a financial year (TDS only on the value above ₹50 lakh)',
    taxableOn: 'excess',
    noPanRate: 5,
    notes: ['TDS @ 0.1% on the purchase value exceeding ₹50 lakh in the year. Without PAN, the rate is 5%.'],
  },
]

export const getTdsSection = (code: string): TdsSection | undefined =>
  TDS_SECTIONS.find((s) => s.code === code)

export type TdsInput = {
  section: TdsSection
  amount: number
  /** chosen rate (one of section.rates[].value) */
  rateValue: number
  hasPan: boolean
  /** 194A — senior-citizen higher threshold */
  seniorCitizen: boolean
  /** 194C — aggregate payments during the year (optional) */
  aggregateAmount?: number
}

export type TdsResult = {
  threshold: number
  applies: boolean
  /** which limb of a dual threshold triggered TDS (194C) */
  crossedBy: 'single' | 'aggregate' | null
  taxableAmount: number
  effectiveRate: number
  noPan: boolean
  tds: number
  net: number
}

/** The default no-PAN rate (§206AA): higher of the section rate or 20%. */
export function noPanRateFor(section: TdsSection, rateValue: number): number {
  return section.noPanRate ?? Math.max(rateValue, 20)
}

export function computeTds(input: TdsInput): TdsResult {
  const { section, amount, rateValue, hasPan, seniorCitizen, aggregateAmount } = input
  const threshold = seniorCitizen && section.seniorThreshold ? section.seniorThreshold : section.threshold

  let applies: boolean
  let crossedBy: 'single' | 'aggregate' | null = null
  if (section.aggregateThreshold != null) {
    const singleCrossed = amount > threshold
    const aggCrossed = (aggregateAmount ?? 0) > section.aggregateThreshold
    applies = singleCrossed || aggCrossed
    crossedBy = singleCrossed ? 'single' : aggCrossed ? 'aggregate' : null
  } else {
    applies = amount > threshold
  }

  const taxableAmount = !applies
    ? 0
    : section.taxableOn === 'excess'
      ? Math.max(0, amount - threshold)
      : amount

  const noPan = !hasPan
  const effectiveRate = noPan ? noPanRateFor(section, rateValue) : rateValue
  const tds = round((taxableAmount * effectiveRate) / 100)
  const net = round(amount - tds)

  return { threshold, applies, crossedBy, taxableAmount, effectiveRate, noPan, tds, net }
}
