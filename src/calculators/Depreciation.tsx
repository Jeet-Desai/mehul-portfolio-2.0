import { useMemo, useState } from 'react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel } from '../components/calc/CalcResult'
import { formatINR, formatPct, round, toNum } from '../lib/format'
import type { Step } from './types'

type Method = 'slm' | 'wdv'

export default function Depreciation() {
  const [cost, setCost] = useState('100000')
  const [salvage, setSalvage] = useState('10000')
  const [life, setLife] = useState('5')
  const [method, setMethod] = useState<Method>('slm')

  const m = useMemo(() => {
    const C = toNum(cost)
    const S = toNum(salvage)
    const N = Math.max(0, Math.round(toNum(life)))
    const valid = C > 0 && N > 0 && S >= 0 && S < C

    const slmDep = valid ? (C - S) / N : 0
    const wdvRate = valid && S > 0 ? (1 - Math.pow(S / C, 1 / N)) * 100 : valid ? 0 : 0

    const schedule: { year: number; opening: number; dep: number; closing: number }[] = []
    if (valid) {
      let book = C
      for (let y = 1; y <= N; y++) {
        const dep = method === 'slm' ? slmDep : book * (wdvRate / 100)
        const opening = book
        book = round(book - dep)
        schedule.push({ year: y, opening: round(opening), dep: round(dep), closing: book })
      }
    }
    return { C, S, N, valid, slmDep: round(slmDep), wdvRate: round(wdvRate), schedule }
  }, [cost, salvage, life, method])

  const steps: Step[] =
    !m.valid
      ? []
      : method === 'slm'
        ? [
            {
              label: 'Annual depreciation = (Cost − Salvage) ÷ Useful life',
              formula: `(${formatINR(m.C)} − ${formatINR(m.S)}) ÷ ${m.N}`,
              result: `${formatINR(m.slmDep)} per year`,
            },
            { label: 'The same amount is charged every year (straight line).' },
          ]
        : [
            {
              label: 'WDV rate = [1 − (Salvage ÷ Cost)^(1/life)] × 100',
              formula: `[1 − (${formatINR(m.S)} ÷ ${formatINR(m.C)})^(1/${m.N})] × 100`,
              result: formatPct(m.wdvRate),
            },
            {
              label: 'Each year: Depreciation = Opening book value × rate',
              note: 'Depreciation is higher in early years and falls over time.',
            },
          ]

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ResultPanel title="Inputs">
          <div className="space-y-4">
            <div>
              <span className="text-sm font-semibold text-slate-700">Method</span>
              <div className="mt-1.5 inline-flex rounded-xl bg-slate-100 p-1">
                {(['slm', 'wdv'] as Method[]).map((mm) => (
                  <button
                    key={mm}
                    onClick={() => setMethod(mm)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      method === mm ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {mm === 'slm' ? 'Straight line' : 'Written down'}
                  </button>
                ))}
              </div>
            </div>
            <CalcField label="Cost of asset" prefix="₹" value={cost} onChange={setCost} />
            <CalcField label="Salvage / residual value" prefix="₹" value={salvage} onChange={setSalvage} />
            <CalcField label="Useful life" suffix="years" value={life} onChange={setLife} />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        {m.valid ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {method === 'slm' ? (
                <HeroResult label="Annual depreciation" value={formatINR(m.slmDep)} sub="same every year" />
              ) : (
                <HeroResult label="Depreciation rate" value={formatPct(m.wdvRate)} sub="on reducing balance" />
              )}
              <HeroResult label="Total depreciation" value={formatINR(m.C - m.S)} sub={`over ${m.N} years`} tone="mint" />
            </div>

            <ResultPanel title="Depreciation schedule">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                      <th className="py-2 pr-2 font-semibold">Year</th>
                      <th className="py-2 px-2 text-right font-semibold">Opening</th>
                      <th className="py-2 px-2 text-right font-semibold">Depreciation</th>
                      <th className="py-2 pl-2 text-right font-semibold">Closing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.schedule.map((row) => (
                      <tr key={row.year} className="border-b border-slate-50">
                        <td className="py-2 pr-2 font-semibold text-slate-700">{row.year}</td>
                        <td className="py-2 px-2 text-right text-slate-600">{formatINR(row.opening)}</td>
                        <td className="py-2 px-2 text-right font-semibold text-brand-700">{formatINR(row.dep)}</td>
                        <td className="py-2 pl-2 text-right text-slate-600">{formatINR(row.closing)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ResultPanel>
          </>
        ) : (
          <ResultPanel>
            <p className="text-sm text-slate-600">
              Enter a cost greater than the salvage value, and a useful life of at least one year.
            </p>
          </ResultPanel>
        )}
        <CalcSteps steps={steps} />
      </div>
    </div>
  )
}
