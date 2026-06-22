import { useMemo, useState } from 'react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, round, toNum } from '../lib/format'
import type { Step } from './types'

type City = 'metro' | 'nonmetro'

export default function Hra() {
  const [basic, setBasic] = useState('40000')
  const [hra, setHra] = useState('18000')
  const [rent, setRent] = useState('20000')
  const [city, setCity] = useState<City>('metro')

  const m = useMemo(() => {
    const B = toNum(basic) // Basic + DA (forming part of retirement benefits)
    const H = toNum(hra)
    const R = toNum(rent)
    const pct = city === 'metro' ? 0.5 : 0.4

    // The three legs of the Section 10(13A) "least of" rule (monthly).
    const actual = H
    const rentMinus = Math.max(0, R - 0.1 * B)
    const pctSalary = pct * B

    const exemptM = Math.max(0, Math.min(actual, rentMinus, pctSalary))
    const taxableM = Math.max(0, H - exemptM)
    const valid = B > 0 && H > 0 && R > 0

    // which leg is the binding minimum
    const legs = [
      { key: 'actual', value: actual },
      { key: 'rent', value: rentMinus },
      { key: 'pct', value: pctSalary },
    ]
    const binding = legs.reduce((a, b) => (b.value < a.value ? b : a)).key

    return {
      B,
      H,
      R,
      pct,
      actual: round(actual),
      rentMinus: round(rentMinus),
      pctSalary: round(pctSalary),
      exemptM: round(exemptM),
      taxableM: round(taxableM),
      exemptY: round(exemptM * 12),
      taxableY: round(taxableM * 12),
      valid,
      binding,
    }
  }, [basic, hra, rent, city])

  const cityLabel = city === 'metro' ? 'metro (50%)' : 'non-metro (40%)'

  const steps: Step[] = m.valid
    ? [
        {
          label: '1 — Actual HRA received',
          formula: 'HRA component of your salary',
          result: `${formatINR(m.actual)} / month`,
          note: m.binding === 'actual' ? 'This is the least → it caps the exemption.' : undefined,
        },
        {
          label: '2 — Rent paid − 10% of salary (Basic + DA)',
          formula: `${formatINR(m.R)} − 10% × ${formatINR(m.B)}`,
          result: `${formatINR(m.rentMinus)} / month`,
          note: m.binding === 'rent' ? 'This is the least → it caps the exemption.' : undefined,
        },
        {
          label: `3 — ${m.pct * 100}% of salary (${cityLabel})`,
          formula: `${m.pct * 100}% × ${formatINR(m.B)}`,
          result: `${formatINR(m.pctSalary)} / month`,
          note: m.binding === 'pct' ? 'This is the least → it caps the exemption.' : undefined,
        },
        {
          label: 'Exempt HRA = least of the three',
          formula: `min(${formatINR(m.actual)}, ${formatINR(m.rentMinus)}, ${formatINR(m.pctSalary)})`,
          result: `${formatINR(m.exemptM)} / month  →  ${formatINR(m.exemptY)} / year`,
        },
        {
          label: 'Taxable HRA = HRA received − exempt HRA',
          formula: `${formatINR(m.H)} − ${formatINR(m.exemptM)}`,
          result: `${formatINR(m.taxableM)} / month  →  ${formatINR(m.taxableY)} / year`,
        },
      ]
    : []

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ResultPanel title="Inputs (monthly figures)">
          <div className="space-y-4">
            <div>
              <span className="text-sm font-semibold text-slate-700">City type</span>
              <div className="mt-1.5 inline-flex rounded-xl bg-slate-100 p-1">
                {(['metro', 'nonmetro'] as City[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCity(c)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      city === c ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {c === 'metro' ? 'Metro (50%)' : 'Non-metro (40%)'}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Metro = Delhi, Mumbai, Kolkata, Chennai.
              </p>
            </div>
            <CalcField
              label="Basic salary + DA"
              prefix="₹"
              value={basic}
              onChange={setBasic}
              hint="DA only if it forms part of retirement benefits"
            />
            <CalcField label="HRA received" prefix="₹" value={hra} onChange={setHra} />
            <CalcField label="Rent paid" prefix="₹" value={rent} onChange={setRent} />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        {m.valid ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <HeroResult label="Exempt HRA (per year)" value={formatINR(m.exemptY)} sub={`${formatINR(m.exemptM)} / month`} tone="mint" />
              <HeroResult label="Taxable HRA (per year)" value={formatINR(m.taxableY)} sub={`${formatINR(m.taxableM)} / month`} tone="sun" />
            </div>
            <ResultPanel title="The “least of three” rule — Section 10(13A)">
              <ResultRow label="1 · Actual HRA received" value={`${formatINR(m.actual)} /mo`} strong={m.binding === 'actual'} />
              <ResultRow label="2 · Rent − 10% of salary" value={`${formatINR(m.rentMinus)} /mo`} strong={m.binding === 'rent'} />
              <ResultRow label={`3 · ${m.pct * 100}% of salary`} value={`${formatINR(m.pctSalary)} /mo`} strong={m.binding === 'pct'} />
              <div className="my-1 border-t border-slate-100" />
              <ResultRow label="Exempt (least)" value={`${formatINR(m.exemptM)} /mo`} strong />
            </ResultPanel>
            <p className="text-xs text-slate-400">
              HRA exemption applies only under the old tax regime. The new regime does not allow it.
            </p>
          </>
        ) : (
          <ResultPanel>
            <p className="text-sm text-slate-600">
              Enter your monthly Basic + DA, the HRA you receive, and the rent you pay — all greater than zero.
            </p>
          </ResultPanel>
        )}
        <CalcSteps steps={steps} />
      </div>
    </div>
  )
}
