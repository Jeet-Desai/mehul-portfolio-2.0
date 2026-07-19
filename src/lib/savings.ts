import { round } from './format'
import type { Step } from '../calculators/types'

/* ----------------------------------------------------------------------------
   Small-savings & deposit maturity math — PPF, bank FD, RD, EPF.

   RATES ARE INPUTS, not constants: small-savings rates are re-notified every
   quarter and the EPF rate every year. Defaults in the UI were web-verified
   Jul 2026 (PPF 7.1% for Q2 FY 2026-27 — 9th unchanged quarter; EPF 8.25%
   notified for FY 2025-26) but the tool must keep working when they change.

   Models follow the standard published methods:
   - PPF  : yearly deposit at the start of the year, interest compounded
            annually on the running balance (matches India Post calculators).
   - FD   : compound interest at a chosen frequency (banks: quarterly).
   - RD   : monthly deposits, interest compounded QUARTERLY (India Post / bank
            method) — implemented via the effective monthly factor
            x = (1 + r/4)^(1/3), deposits at the start of each month.
   - EPF  : interest accrues monthly on the running balance but is CREDITED
            once at year end (EPFO method — no intra-year compounding).
            Employer 12% is split: 8.33% of pensionable wage (capped ₹15,000)
            goes to EPS; the balance reaches the EPF account.
---------------------------------------------------------------------------- */

/* --------------------------------------------------------------------- PPF */

export type PpfInputs = {
  yearlyDeposit: number
  ratePct: number
  years: number
}

export type YearRow = {
  year: number
  opening: number
  deposit: number
  interest: number
  closing: number
}

export type PpfResult = {
  maturity: number
  invested: number
  interest: number
  rows: YearRow[]
  steps: Step[]
}

export const PPF_MAX_YEARLY = 150_000

export function computePpf(inp: PpfInputs): PpfResult {
  const years = Math.min(Math.max(Math.floor(inp.years), 0), 50)
  const r = inp.ratePct / 100
  const rows: YearRow[] = []
  let bal = 0
  for (let y = 1; y <= years; y++) {
    const opening = bal
    const interest = (opening + inp.yearlyDeposit) * r
    bal = opening + inp.yearlyDeposit + interest
    rows.push({ year: y, opening: round(opening), deposit: inp.yearlyDeposit, interest: round(interest), closing: round(bal) })
  }
  const invested = inp.yearlyDeposit * years
  const maturity = round(bal)
  const interest = round(maturity - invested)

  const steps: Step[] = [
    {
      label: 'Deposit pattern',
      formula: `₹${fmt(inp.yearlyDeposit)} at the start of each year for ${years} years`,
      result: `₹${fmt(invested)} invested`,
      note: inp.yearlyDeposit > PPF_MAX_YEARLY ? 'Note: the PPF limit is ₹1,50,000 per financial year.' : undefined,
    },
    {
      label: 'Each year the balance grows once',
      formula: `Closing = (Opening + Deposit) × (1 + ${inp.ratePct}%)`,
      note: 'PPF interest is compounded annually. Depositing before 5 April earns the whole year’s interest.',
    },
    {
      label: `Balance after ${years} years`,
      formula: rows.length ? `Year ${years}: (₹${fmt(rows[rows.length - 1].opening)} + ₹${fmt(inp.yearlyDeposit)}) × ${(1 + r).toFixed(3)}` : '—',
      result: `₹${fmt(maturity)}`,
    },
    {
      label: 'Interest earned',
      formula: `₹${fmt(maturity)} − ₹${fmt(invested)}`,
      result: `₹${fmt(interest)}`,
      note: 'PPF is EEE — the deposit (80C), the interest and the maturity are all tax-free.',
    },
  ]
  return { maturity, invested, interest, rows, steps }
}

/* ---------------------------------------------------------------------- FD */

export type FdFrequency = 1 | 2 | 4 | 12

export type FdInputs = {
  principal: number
  ratePct: number
  years: number
  frequency: FdFrequency
}

export type FdResult = {
  maturity: number
  interest: number
  effectiveYieldPct: number
  simpleInterest: number
  steps: Step[]
}

const FREQ_NAME: Record<FdFrequency, string> = {
  1: 'yearly',
  2: 'half-yearly',
  4: 'quarterly',
  12: 'monthly',
}

export function computeFd(inp: FdInputs): FdResult {
  const { principal: P, frequency: m } = inp
  const r = inp.ratePct / 100
  const n = m * inp.years
  const maturity = round(P * Math.pow(1 + r / m, n))
  const interest = round(maturity - P)
  const effectiveYieldPct = round((Math.pow(1 + r / m, m) - 1) * 100)
  const simpleInterest = round(P * r * inp.years)

  const steps: Step[] = [
    {
      label: 'Periodic rate and number of periods',
      formula: `r = ${inp.ratePct}% ÷ ${m} = ${round((r / m) * 100, 4)}% per period · n = ${m} × ${fmtNum(inp.years)} = ${fmtNum(n)} periods`,
      note: `Compounded ${FREQ_NAME[m]} — Indian banks typically compound FDs quarterly.`,
    },
    {
      label: 'Maturity value',
      formula: `A = P(1 + r/m)^(m·t) = ₹${fmt(P)} × ${(1 + r / m).toFixed(5)}^${fmtNum(n)}`,
      result: `₹${fmt(maturity)}`,
    },
    {
      label: 'Interest earned',
      formula: `₹${fmt(maturity)} − ₹${fmt(P)}`,
      result: `₹${fmt(interest)}`,
      note: `Simple interest for the same period would be ₹${fmt(simpleInterest)} — compounding adds ₹${fmt(round(interest - simpleInterest))}.`,
    },
    {
      label: 'Effective annual yield',
      formula: `(1 + r/m)^m − 1 = ${(1 + r / m).toFixed(5)}^${m} − 1`,
      result: `${fmtNum(effectiveYieldPct)}%`,
      note: 'The single yearly rate that would give the same growth — always ≥ the nominal rate.',
    },
  ]
  return { maturity, interest, effectiveYieldPct, simpleInterest, steps }
}

/* ---------------------------------------------------------------------- RD */

export type RdInputs = {
  monthlyDeposit: number
  ratePct: number
  months: number
}

export type RdResult = {
  maturity: number
  invested: number
  interest: number
  steps: Step[]
}

export function computeRd(inp: RdInputs): RdResult {
  const N = Math.min(Math.max(Math.floor(inp.months), 0), 600)
  const R = inp.monthlyDeposit
  const i = inp.ratePct / 100 / 4 // quarterly rate
  const x = Math.pow(1 + i, 1 / 3) // effective monthly factor
  // deposits at the start of months 1..N, valued at the end of month N
  const maturity = round(x === 1 ? R * N : (R * x * (Math.pow(x, N) - 1)) / (x - 1))
  const invested = R * N
  const interest = round(maturity - invested)

  const steps: Step[] = [
    {
      label: 'Deposit pattern',
      formula: `₹${fmt(R)} at the start of each month for ${N} months (${fmtNum(round(N / 12, 1))} years)`,
      result: `₹${fmt(invested)} invested`,
    },
    {
      label: 'Quarterly rate → monthly growth factor',
      formula: `i = ${inp.ratePct}% ÷ 4 = ${round(i * 100, 4)}% per quarter · x = (1 + i)^(1/3) = ${x.toFixed(6)}`,
      note: 'RD interest is compounded quarterly (India Post / bank method); x spreads it evenly over the 3 months.',
    },
    {
      label: 'Maturity value',
      formula: `M = R · x · (xⁿ − 1) ÷ (x − 1) = ₹${fmt(R)} × ${x.toFixed(4)} × (${x.toFixed(4)}^${N} − 1) ÷ ${(x - 1).toFixed(6)}`,
      result: `₹${fmt(maturity)}`,
    },
    {
      label: 'Interest earned',
      formula: `₹${fmt(maturity)} − ₹${fmt(invested)}`,
      result: `₹${fmt(interest)}`,
      note: 'Bank RD interest is fully taxable as “income from other sources”; TDS applies past the 194A threshold.',
    },
  ]
  return { maturity, invested, interest, steps }
}

/* --------------------------------------------------------------------- EPF */

export type EpfInputs = {
  monthlyWage: number // basic + DA
  employeePct: number // usually 12
  ratePct: number // EPF interest rate (yearly)
  years: number
  salaryGrowthPct: number // annual increment on basic+DA
}

export type EpfYearRow = YearRow & { employee: number; employer: number }

export type EpfResult = {
  maturity: number
  employeeTotal: number
  employerTotal: number
  interestTotal: number
  epsMonthly: number
  rows: EpfYearRow[]
  steps: Step[]
}

export const EPS_WAGE_CAP = 15_000
export const EPS_PCT = 8.33

export function computeEpf(inp: EpfInputs): EpfResult {
  const years = Math.min(Math.max(Math.floor(inp.years), 0), 45)
  const rMonthly = inp.ratePct / 100 / 12
  let wage = inp.monthlyWage
  let bal = 0
  let employeeTotal = 0
  let employerTotal = 0
  const rows: EpfYearRow[] = []
  let firstEps = 0

  for (let y = 1; y <= years; y++) {
    const employeeM = (wage * inp.employeePct) / 100
    const epsM = (Math.min(wage, EPS_WAGE_CAP) * EPS_PCT) / 100
    const employerM = (wage * 12) / 100 - epsM // employer 12% minus the EPS diversion
    if (y === 1) firstEps = epsM

    const opening = bal
    let interest = opening * rMonthly * 12 // opening balance earns all 12 months
    // each month's contribution earns interest for the months remaining in the year
    for (let m = 1; m <= 12; m++) {
      interest += (employeeM + employerM) * rMonthly * (12 - m)
    }
    const contrib = (employeeM + employerM) * 12
    bal = opening + contrib + interest

    employeeTotal += employeeM * 12
    employerTotal += employerM * 12
    rows.push({
      year: y,
      opening: round(opening),
      deposit: round(contrib),
      employee: round(employeeM * 12),
      employer: round(employerM * 12),
      interest: round(interest),
      closing: round(bal),
    })
    wage *= 1 + inp.salaryGrowthPct / 100
  }

  const maturity = round(bal)
  const interestTotal = round(maturity - employeeTotal - employerTotal)
  const employeeM0 = (inp.monthlyWage * inp.employeePct) / 100
  const employerM0 = (inp.monthlyWage * 12) / 100 - firstEps

  const steps: Step[] = [
    {
      label: 'Monthly contributions (year 1)',
      formula: `You: ${inp.employeePct}% × ₹${fmt(inp.monthlyWage)} = ₹${fmt(round(employeeM0))} · Employer to EPF: 12% × ₹${fmt(inp.monthlyWage)} − EPS ₹${fmt(round(firstEps))} = ₹${fmt(round(employerM0))}`,
      note: `EPS takes ${EPS_PCT}% of basic+DA capped at ₹${fmt(EPS_WAGE_CAP)} (max ₹1,250/month) — it builds your pension, not this balance.`,
    },
    {
      label: 'How interest works',
      formula: `${inp.ratePct}% ÷ 12 = ${round(rMonthly * 100, 4)}% per month on the running balance`,
      note: 'Interest accrues monthly but is credited once on 31 March — so it does not compound within the year.',
    },
    {
      label: `Balance after ${years} years`,
      formula: `Contributions ₹${fmt(round(employeeTotal + employerTotal))} + interest ₹${fmt(interestTotal)}${inp.salaryGrowthPct > 0 ? ` (salary stepped up ${inp.salaryGrowthPct}% each year)` : ''}`,
      result: `₹${fmt(maturity)}`,
    },
  ]
  return { maturity, employeeTotal: round(employeeTotal), employerTotal: round(employerTotal), interestTotal, epsMonthly: round(firstEps), rows, steps }
}

/* ----------------------------------------------------------------- helpers */

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n))
const fmtNum = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)
