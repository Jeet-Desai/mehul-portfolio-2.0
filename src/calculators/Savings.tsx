import { useMemo } from 'react'
import { Info } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, formatNum, formatPct, toNum } from '../lib/format'
import {
  computePpf,
  computeFd,
  computeRd,
  computeEpf,
  PPF_MAX_YEARLY,
  type FdFrequency,
  type YearRow,
  type EpfYearRow,
} from '../lib/savings'
import { useCalcState } from '../lib/urlState'

type Tab = 'ppf' | 'fd' | 'rd' | 'epf'

/* Defaults web-verified Jul 2026: PPF 7.1% (Q2 FY 2026-27, unchanged), EPF 8.25%
   (notified for FY 2025-26). Both are EDITABLE — small-savings rates are
   re-notified every quarter and the EPF rate every year. */

export default function Savings() {
  const [tab, setTab] = useCalcState('tab', 'ppf')

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:bg-white">
        {([
          ['ppf', 'PPF'],
          ['fd', 'Fixed Deposit'],
          ['rd', 'Recurring Deposit'],
          ['epf', 'EPF'],
        ] as [Tab, string][]).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => setTab(v)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === v ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'ppf' && <Ppf />}
      {tab === 'fd' && <Fd />}
      {tab === 'rd' && <Rd />}
      {tab === 'epf' && <Epf />}

      <div className="flex items-start gap-2 rounded-xl bg-sun-500/10 p-3 text-xs text-slate-600">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sun-600" />
        <span>
          <strong>Rates change.</strong> Small-savings rates (PPF) are re-notified every quarter and the EPF rate
          every year; FD/RD rates vary by bank. Defaults here were checked in July 2026 — always confirm the current
          rate on the official India Post / EPFO / bank page before deciding.
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- schedule --- */

function ScheduleTable({ rows, contribHead }: { rows: YearRow[]; contribHead: string }) {
  if (!rows.length) return null
  return (
    <ResultPanel title="Year-by-year schedule">
      <div className="max-h-80 overflow-auto">
        <table className="w-full min-w-[30rem] text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-3">Year</th>
              <th className="py-2 px-3 text-right">Opening</th>
              <th className="py-2 px-3 text-right">{contribHead}</th>
              <th className="py-2 px-3 text-right">Interest</th>
              <th className="py-2 pl-3 text-right">Closing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.year}>
                <td className="py-2 pr-3 font-semibold text-slate-700">{r.year}</td>
                <td className="py-2 px-3 text-right tabular-nums text-slate-600">{formatINR(r.opening)}</td>
                <td className="py-2 px-3 text-right tabular-nums text-slate-600">{formatINR(r.deposit)}</td>
                <td className="py-2 px-3 text-right tabular-nums text-slate-600">{formatINR(r.interest)}</td>
                <td className="py-2 pl-3 text-right font-semibold tabular-nums text-brand-700">{formatINR(r.closing)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ResultPanel>
  )
}

/* ------------------------------------------------------------------- PPF --- */

function Ppf() {
  const [dep, setDep] = useCalcState('pd', '150000')
  const [rate, setRate] = useCalcState('pr', '7.1')
  const [yrs, setYrs] = useCalcState('py', '15')

  const res = useMemo(
    () => computePpf({ yearlyDeposit: toNum(dep), ratePct: toNum(rate), years: toNum(yrs) }),
    [dep, rate, yrs],
  )
  const overLimit = toNum(dep) > PPF_MAX_YEARLY

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Public Provident Fund">
          <div className="space-y-3">
            <CalcField
              label="Deposit per year"
              prefix="₹"
              value={dep}
              onChange={setDep}
              hint={overLimit ? '⚠ PPF allows at most ₹1,50,000 per financial year' : 'Min ₹500 · max ₹1,50,000 per financial year (80C)'}
            />
            <CalcField label="Interest rate" suffix="% p.a." value={rate} onChange={setRate} hint="7.1% for Jul–Sep 2026 — re-notified every quarter" />
            <CalcField label="Years" suffix="years" value={yrs} onChange={setYrs} hint="PPF matures in 15 years; extendable in 5-year blocks" />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label="Maturity value"
          value={formatINR(res.maturity)}
          sub={`${formatINR(res.invested)} invested + ${formatINR(res.interest)} tax-free interest`}
          tone="brand"
        />
        <ResultPanel title="Summary">
          <div className="divide-y divide-slate-100">
            <ResultRow label="Total invested" value={formatINR(res.invested)} />
            <ResultRow label="Interest earned (tax-free)" value={formatINR(res.interest)} />
            <ResultRow label="Maturity value" value={formatINR(res.maturity)} strong />
          </div>
        </ResultPanel>
        <ScheduleTable rows={res.rows} contribHead="Deposit" />
        <CalcSteps steps={res.steps} />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------- FD --- */

function Fd() {
  const [p, setP] = useCalcState('fp', '100000')
  const [rate, setRate] = useCalcState('fr', '7')
  const [yrs, setYrs] = useCalcState('fy', '5')
  const [freq, setFreq] = useCalcState('ff', '4')

  const res = useMemo(
    () =>
      computeFd({
        principal: toNum(p),
        ratePct: toNum(rate),
        years: toNum(yrs),
        frequency: ([1, 2, 4, 12].includes(toNum(freq)) ? toNum(freq) : 4) as FdFrequency,
      }),
    [p, rate, yrs, freq],
  )

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Fixed deposit">
          <div className="space-y-3">
            <CalcField label="Deposit amount" prefix="₹" value={p} onChange={setP} />
            <CalcField label="Interest rate" suffix="% p.a." value={rate} onChange={setRate} hint="As offered by your bank — varies by bank and tenure" />
            <CalcField label="Tenure" suffix="years" value={yrs} onChange={setYrs} hint="Decimals work — 2.5 = 2 years 6 months" />
            <label className="block">
              <span className="text-[12.5px] font-semibold text-slate-600">Compounding</span>
              <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                {([['12', 'Mthly'], ['4', 'Qtrly'], ['2', 'Half-yr'], ['1', 'Yearly']] as const).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFreq(v)}
                    className={`rounded-[9px] border px-2 py-2 text-xs font-semibold transition ${
                      freq === v
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-brand-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="mt-1.5 block text-[11px] text-slate-400">Indian banks typically compound quarterly</span>
            </label>
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label="Maturity value"
          value={formatINR(res.maturity)}
          sub={`${formatINR(res.interest)} interest · effective yield ${formatPct(res.effectiveYieldPct)} p.a.`}
          tone="brand"
        />
        <ResultPanel title="Summary">
          <div className="divide-y divide-slate-100">
            <ResultRow label="Principal" value={formatINR(toNum(p))} />
            <ResultRow label="Compound interest" value={formatINR(res.interest)} />
            <ResultRow label="If it were simple interest" value={formatINR(res.simpleInterest)} />
            <ResultRow label="Effective annual yield" value={formatPct(res.effectiveYieldPct)} />
            <ResultRow label="Maturity value" value={formatINR(res.maturity)} strong />
          </div>
        </ResultPanel>
        <CalcSteps steps={res.steps} />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------- RD --- */

function Rd() {
  const [dep, setDep] = useCalcState('rm', '5000')
  const [rate, setRate] = useCalcState('rr', '6.7')
  const [months, setMonths] = useCalcState('rn', '60')

  const res = useMemo(
    () => computeRd({ monthlyDeposit: toNum(dep), ratePct: toNum(rate), months: toNum(months) }),
    [dep, rate, months],
  )

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Recurring deposit">
          <div className="space-y-3">
            <CalcField label="Deposit per month" prefix="₹" value={dep} onChange={setDep} />
            <CalcField label="Interest rate" suffix="% p.a." value={rate} onChange={setRate} hint="Post-office RD is 6.7% (Jul 2026); banks vary" />
            <CalcField label="Tenure" suffix="months" value={months} onChange={setMonths} hint={`${formatNum(toNum(months) / 12, 1)} years — post-office RD runs 60 months`} />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label="Maturity value"
          value={formatINR(res.maturity)}
          sub={`${formatINR(res.invested)} invested + ${formatINR(res.interest)} interest`}
          tone="brand"
        />
        <ResultPanel title="Summary">
          <div className="divide-y divide-slate-100">
            <ResultRow label="Total deposited" value={formatINR(res.invested)} />
            <ResultRow label="Interest earned" value={formatINR(res.interest)} />
            <ResultRow label="Maturity value" value={formatINR(res.maturity)} strong />
          </div>
        </ResultPanel>
        <CalcSteps steps={res.steps} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- EPF --- */

function Epf() {
  const [wage, setWage] = useCalcState('ew', '30000')
  const [pct, setPct] = useCalcState('ec', '12')
  const [rate, setRate] = useCalcState('er', '8.25')
  const [yrs, setYrs] = useCalcState('ey', '20')
  const [growth, setGrowth] = useCalcState('eg', '5')

  const res = useMemo(
    () =>
      computeEpf({
        monthlyWage: toNum(wage),
        employeePct: toNum(pct),
        ratePct: toNum(rate),
        years: toNum(yrs),
        salaryGrowthPct: toNum(growth),
      }),
    [wage, pct, rate, yrs, growth],
  )

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Employees’ Provident Fund">
          <div className="space-y-3">
            <CalcField label="Monthly basic + DA" prefix="₹" value={wage} onChange={setWage} hint="EPF is computed on basic salary + dearness allowance" />
            <CalcField label="Your contribution" suffix="%" value={pct} onChange={setPct} hint="Statutory 12% — you may volunteer more (VPF)" />
            <CalcField label="EPF interest rate" suffix="% p.a." value={rate} onChange={setRate} hint="8.25% notified for FY 2025-26 — re-declared yearly" />
            <CalcField label="Years until withdrawal" suffix="years" value={yrs} onChange={setYrs} />
            <CalcField label="Expected salary growth" suffix="% p.a." value={growth} onChange={setGrowth} hint="Annual increment applied to basic + DA" />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label="Projected EPF corpus"
          value={formatINR(res.maturity)}
          sub={`You ${formatINR(res.employeeTotal)} + employer ${formatINR(res.employerTotal)} + interest ${formatINR(res.interestTotal)}`}
          tone="brand"
        />
        <ResultPanel title="Summary">
          <div className="divide-y divide-slate-100">
            <ResultRow label="Your contributions" value={formatINR(res.employeeTotal)} />
            <ResultRow label="Employer contributions (to EPF)" value={formatINR(res.employerTotal)} />
            <ResultRow label="Diverted to pension (EPS), year 1" value={`${formatINR(res.epsMonthly)} / month`} />
            <ResultRow label="Interest earned" value={formatINR(res.interestTotal)} />
            <ResultRow label="Projected corpus" value={formatINR(res.maturity)} strong />
          </div>
        </ResultPanel>
        <ScheduleTable rows={res.rows as EpfYearRow[]} contribHead="Contributions" />
        <CalcSteps steps={res.steps} />
      </div>
    </div>
  )
}
