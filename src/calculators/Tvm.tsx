import { useMemo, useState } from 'react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, formatNum, formatPct, round, toNum } from '../lib/format'
import { futureValue, presentValue, payment, solveRate, solveN } from '../lib/finance'
import { useCalcState } from '../lib/urlState'
import type { Step } from './types'

type Solve = 'fv' | 'pv' | 'pmt' | 'rate' | 'n'

const SOLVE: { value: Solve; label: string }[] = [
  { value: 'fv', label: 'Future value' },
  { value: 'pv', label: 'Present value' },
  { value: 'pmt', label: 'Payment' },
  { value: 'rate', label: 'Rate' },
  { value: 'n', label: 'Periods' },
]

export default function Tvm() {
  const [solveStr, setSolveStr] = useCalcState('solve', 'fv')
  const solve: Solve = SOLVE.some((s) => s.value === solveStr) ? (solveStr as Solve) : 'fv'
  const setSolve = (v: Solve) => setSolveStr(v)
  // Defaults are mutually consistent: PV 10k + PMT 5k @ 8% for 10 periods → FV ≈ 94,022.
  // So switching "Solve for" returns the original value of whichever variable you pick.
  const [pv, setPv] = useCalcState('pv', '10000')
  const [pmt, setPmt] = useCalcState('pmt', '5000')
  const [fv, setFv] = useCalcState('fv', '94022')
  const [rate, setRate] = useCalcState('rate', '8')
  const [n, setN] = useCalcState('n', '10')
  const [dueStr, setDueStr] = useCalcState('due', '0')
  const due = dueStr === '1'
  const setDue = (v: boolean) => setDueStr(v ? '1' : '0')

  const m = useMemo(() => {
    const PV = toNum(pv)
    const PMT = toNum(pmt)
    const FV = toNum(fv)
    const r = toNum(rate) / 100
    const N = toNum(n)

    let value = NaN
    let unit: 'inr' | 'pct' | 'periods' = 'inr'
    switch (solve) {
      case 'fv':
        value = futureValue(PV, PMT, r, N, due)
        break
      case 'pv':
        value = presentValue(FV, PMT, r, N, due)
        break
      case 'pmt':
        value = payment(PV, FV, r, N, due)
        break
      case 'rate':
        value = solveRate(PV, PMT, FV, N, due) * 100
        unit = 'pct'
        break
      case 'n':
        value = solveN(PV, PMT, FV, r, due)
        unit = 'periods'
        break
    }
    const valid = Number.isFinite(value)
    return { PV, PMT, FV, r, N, value: valid ? value : NaN, unit, valid }
  }, [solve, pv, pmt, fv, rate, n, due])

  const fmt = (v: number) =>
    m.unit === 'pct' ? formatPct(v, 3) : m.unit === 'periods' ? `${formatNum(v, 2)} periods` : formatINR(round(v))

  const heroLabel = SOLVE.find((s) => s.value === solve)!.label
  const timing = due ? 'beginning (annuity due)' : 'end (ordinary annuity)'

  const steps: Step[] = m.valid
    ? [
        {
          label: 'The TVM relationship',
          formula: 'FV = PV × (1 + r)ⁿ + PMT × [((1 + r)ⁿ − 1) ÷ r]' + (due ? ' × (1 + r)' : ''),
          note: `Payments are at the ${timing}. r is the rate per period; n is the number of periods.`,
        },
        {
          label: `Rearranged to solve for ${heroLabel.toLowerCase()}`,
          formula:
            solve === 'fv'
              ? `FV = ${formatINR(m.PV)} × (1 + ${formatPct(m.r * 100, 4)})^${m.N} + ${formatINR(m.PMT)} × factor`
              : solve === 'pv'
                ? 'PV = [FV − PMT × factor] ÷ (1 + r)ⁿ'
                : solve === 'pmt'
                  ? 'PMT = [FV − PV × (1 + r)ⁿ] ÷ factor'
                  : solve === 'rate'
                    ? 'r solved numerically (the equation cannot be rearranged for r)'
                    : 'n solved numerically (n sits in the exponent)',
          note:
            solve === 'rate' || solve === 'n'
              ? 'Found by bisection — repeatedly narrowing the range until both sides balance.'
              : undefined,
        },
        {
          label: `${heroLabel} =`,
          result: fmt(m.value),
        },
      ]
    : []

  // which fields to show as editable inputs (all except the one being solved)
  const fieldShown = (f: Solve) => f !== solve

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ResultPanel title="Inputs">
          <div className="space-y-4">
            <div>
              <span className="text-sm font-semibold text-slate-700">Solve for</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {SOLVE.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSolve(s.value)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      solve === s.value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            {fieldShown('pv') && <CalcField label="Present value (PV)" prefix="₹" value={pv} onChange={setPv} hint="Amount you hold today (0 if none)" />}
            {fieldShown('pmt') && <CalcField label="Payment per period (PMT)" prefix="₹" value={pmt} onChange={setPmt} hint="Level deposit each period (0 if none)" />}
            {fieldShown('fv') && <CalcField label="Future value (FV)" prefix="₹" value={fv} onChange={setFv} hint="Target amount at the end" />}
            {fieldShown('rate') && <CalcField label="Rate per period" suffix="%" value={rate} onChange={setRate} hint="e.g. annual ÷ 12 for monthly" />}
            {fieldShown('n') && <CalcField label="Number of periods (n)" value={n} onChange={setN} />}
            <div>
              <span className="text-sm font-semibold text-slate-700">Payment timing</span>
              <div className="mt-1.5 inline-flex rounded-xl bg-slate-100 p-1">
                {[
                  { v: false, label: 'End of period' },
                  { v: true, label: 'Beginning' },
                ].map((o) => (
                  <button
                    key={String(o.v)}
                    onClick={() => setDue(o.v)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      due === o.v ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        {m.valid ? (
          <>
            <HeroResult label={heroLabel} value={fmt(m.value)} sub={`with payments at the ${timing}`} />
            <ResultPanel title="All five variables">
              <ResultRow label="Present value (PV)" value={formatINR(solve === 'pv' ? round(m.value) : m.PV)} strong={solve === 'pv'} />
              <ResultRow label="Payment (PMT)" value={formatINR(solve === 'pmt' ? round(m.value) : m.PMT)} strong={solve === 'pmt'} />
              <ResultRow label="Future value (FV)" value={formatINR(solve === 'fv' ? round(m.value) : m.FV)} strong={solve === 'fv'} />
              <ResultRow label="Rate per period" value={formatPct(solve === 'rate' ? m.value : m.r * 100, 3)} strong={solve === 'rate'} />
              <ResultRow label="Periods (n)" value={formatNum(solve === 'n' ? m.value : m.N, 2)} strong={solve === 'n'} />
            </ResultPanel>
          </>
        ) : (
          <ResultPanel>
            <p className="text-sm text-slate-600">
              No solution for these inputs. For rate or periods, make sure the future value is reachable
              from the present value and payments you entered (e.g. FV larger than PV when both are positive).
            </p>
          </ResultPanel>
        )}
        <CalcSteps steps={steps} />
      </div>
    </div>
  )
}
