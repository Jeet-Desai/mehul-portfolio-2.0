import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, round, toNum } from '../lib/format'
import { chartGrid, chartAxis, axisTick, chartLabelFill, tooltipProps } from '../lib/chartTheme'
import { useCalcState } from '../lib/urlState'
import type { Step } from './types'

type Freq = 1 | 2 | 4 | 12

const FREQS: { value: Freq; label: string }[] = [
  { value: 1, label: 'Yearly' },
  { value: 2, label: 'Half-yearly' },
  { value: 4, label: 'Quarterly' },
  { value: 12, label: 'Monthly' },
]

const compact = (v: number) => `₹${Intl.NumberFormat('en-IN', { notation: 'compact' }).format(v)}`

export default function CompoundInterest() {
  const [principal, setPrincipal] = useCalcState('amt', '100000')
  const [rate, setRate] = useCalcState('rate', '10')
  const [years, setYears] = useCalcState('yrs', '10')
  const [freqStr, setFreqStr] = useCalcState('freq', '1')
  const freq = ([1, 2, 4, 12].includes(Number(freqStr)) ? Number(freqStr) : 1) as Freq
  const setFreq = (f: Freq) => setFreqStr(String(f))

  const m = useMemo(() => {
    const P = toNum(principal)
    const r = toNum(rate)
    const t = Math.max(0, Math.round(toNum(years)))
    const i = r / 100

    const simpleAmt = P * (1 + i * t)
    const simpleInt = simpleAmt - P
    const compoundAmt = P * Math.pow(1 + i / freq, freq * t)
    const compoundInt = compoundAmt - P
    const extra = compoundInt - simpleInt
    const valid = P > 0 && t > 0

    const data = Array.from({ length: t + 1 }, (_, x) => ({
      year: x,
      Simple: round(P * (1 + i * x)),
      Compound: round(P * Math.pow(1 + i / freq, freq * x)),
    }))

    return {
      P,
      r,
      t,
      i,
      simpleAmt: round(simpleAmt),
      simpleInt: round(simpleInt),
      compoundAmt: round(compoundAmt),
      compoundInt: round(compoundInt),
      extra: round(extra),
      valid,
      data,
    }
  }, [principal, rate, years, freq])

  const freqLabel = FREQS.find((f) => f.value === freq)!.label.toLowerCase()

  const steps: Step[] = m.valid
    ? [
        {
          label: 'Simple interest = P × r × t',
          formula: `${formatINR(m.P)} × ${m.r}% × ${m.t}`,
          result: formatINR(m.simpleInt),
          note: 'Interest is earned only on the original principal.',
        },
        {
          label:
            freq === 1
              ? 'Compound amount = P × (1 + r)ᵗ'
              : `Compound amount = P × (1 + r ÷ ${freq})^(${freq} × t)`,
          formula:
            freq === 1
              ? `${formatINR(m.P)} × (1 + ${m.r}%)^${m.t}`
              : `${formatINR(m.P)} × (1 + ${m.r}% ÷ ${freq})^(${freq} × ${m.t})`,
          result: formatINR(m.compoundAmt),
          note: `Compounded ${freqLabel}. Interest is added back, so it earns interest too.`,
        },
        {
          label: 'Compound interest = Compound amount − Principal',
          formula: `${formatINR(m.compoundAmt)} − ${formatINR(m.P)}`,
          result: formatINR(m.compoundInt),
        },
        {
          label: 'The compounding advantage = Compound − Simple interest',
          formula: `${formatINR(m.compoundInt)} − ${formatINR(m.simpleInt)}`,
          result: formatINR(m.extra),
          note: 'This gap widens the longer you stay invested.',
        },
      ]
    : []

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ResultPanel title="Inputs">
          <div className="space-y-4">
            <CalcField label="Principal" prefix="₹" value={principal} onChange={setPrincipal} />
            <CalcField label="Interest rate (annual)" suffix="%" value={rate} onChange={setRate} />
            <CalcField label="Time period" suffix="years" value={years} onChange={setYears} />
            <div>
              <span className="text-sm font-semibold text-slate-700">Compounding frequency</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {FREQS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFreq(f.value)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      freq === f.value ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
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
            <div className="grid gap-4 sm:grid-cols-2">
              <HeroResult label="Compound interest" value={formatINR(m.compoundInt)} sub={`Amount ${formatINR(m.compoundAmt)}`} tone="mint" />
              <HeroResult label="Extra over simple" value={formatINR(m.extra)} sub="the power of compounding" tone="sun" />
            </div>

            <ResultPanel title="Simple vs compound — the widening gap">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={m.data} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                    <XAxis
                      dataKey="year"
                      stroke={chartAxis}
                      tick={axisTick}
                      label={{ value: 'Year', position: 'insideBottom', offset: -2, fontSize: 11, fill: chartLabelFill }}
                    />
                    <YAxis stroke={chartAxis} tick={axisTick} width={48} tickFormatter={compact} />
                    <Tooltip {...tooltipProps} formatter={(v) => formatINR(Number(v))} labelFormatter={(l) => `Year ${l}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="Compound" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Simple" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">
                Both start at the same principal — compound interest pulls ahead and keeps accelerating.
              </p>
            </ResultPanel>

            <ResultPanel title="Side by side">
              <ResultRow label="Simple interest" value={formatINR(m.simpleInt)} />
              <ResultRow label="Compound interest" value={formatINR(m.compoundInt)} />
              <div className="my-1 border-t border-slate-100" />
              <ResultRow label="Simple — final amount" value={formatINR(m.simpleAmt)} />
              <ResultRow label="Compound — final amount" value={formatINR(m.compoundAmt)} strong />
            </ResultPanel>
          </>
        ) : (
          <ResultPanel>
            <p className="text-sm text-slate-600">Enter a principal and a time period of at least one year.</p>
          </ResultPanel>
        )}
        <CalcSteps steps={steps} />
      </div>
    </div>
  )
}
