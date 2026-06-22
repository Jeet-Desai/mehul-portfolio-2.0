import { useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
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
import { formatINR, formatPct, round, toNum } from '../lib/format'
import { simulateSip } from '../lib/finance'
import type { Step } from './types'

type Mode = 'sip' | 'lumpsum'

const compact = (v: number) => `₹${Intl.NumberFormat('en-IN', { notation: 'compact' }).format(v)}`

export default function Sip() {
  const [mode, setMode] = useState<Mode>('sip')
  const [monthly, setMonthly] = useState('10000')
  const [stepUp, setStepUp] = useState('10')
  const [lumpsum, setLumpsum] = useState('500000')
  const [ret, setRet] = useState('12')
  const [years, setYears] = useState('15')

  const m = useMemo(() => {
    const rate = toNum(ret)
    const yrs = Math.max(0, Math.round(toNum(years)))

    if (mode === 'sip') {
      const P = toNum(monthly)
      const step = Math.max(0, toNum(stepUp))
      const sim = simulateSip(P, rate, yrs, step)
      const valid = P > 0 && yrs > 0
      return {
        mode,
        rate,
        yrs,
        P,
        step,
        invested: sim.invested,
        fv: sim.fv,
        gain: sim.gain,
        valid,
        data: sim.yearly.map((y) => ({ year: y.year, Invested: y.invested, Value: y.value })),
      }
    }

    // lumpsum: annual compounding
    const P = toNum(lumpsum)
    const r = rate / 100
    const fv = P * Math.pow(1 + r, yrs)
    const valid = P > 0 && yrs > 0
    const data = Array.from({ length: yrs + 1 }, (_, i) => ({
      year: i,
      Invested: round(P),
      Value: round(P * Math.pow(1 + r, i)),
    }))
    return {
      mode,
      rate,
      yrs,
      P,
      step: 0,
      invested: round(P),
      fv: round(fv),
      gain: round(fv - P),
      valid,
      data,
    }
  }, [mode, monthly, stepUp, lumpsum, ret, years])

  const steps: Step[] = !m.valid
    ? []
    : mode === 'sip'
      ? [
          {
            label: 'Monthly rate (i) = annual return ÷ 12',
            formula: `${m.rate}% ÷ 12`,
            result: `${formatPct(m.rate / 12, 4)} per month`,
          },
          {
            label: 'Each month: add the SIP, then grow the whole pot by i',
            formula: 'value = (value + SIP) × (1 + i)',
            note: 'Contributions are assumed at the start of each month (SIP debit date).',
          },
          m.step > 0
            ? {
                label: `Step-up: the monthly SIP rises ${m.step}% after every 12 months`,
                formula: `Year 1 SIP ${formatINR(m.P)} → Year 2 ${formatINR(round(m.P * (1 + m.step / 100)))} …`,
              }
            : { label: 'Level SIP — the monthly amount stays the same throughout.' },
          {
            label: 'Total invested = sum of every monthly contribution',
            result: formatINR(m.invested),
          },
          {
            label: 'Wealth gained = Maturity value − Total invested',
            formula: `${formatINR(m.fv)} − ${formatINR(m.invested)}`,
            result: formatINR(m.gain),
          },
        ]
      : [
          {
            label: 'Maturity value = P × (1 + r)ⁿ',
            formula: `${formatINR(m.P)} × (1 + ${m.rate}%)^${m.yrs}`,
            result: formatINR(m.fv),
          },
          {
            label: 'Wealth gained = Maturity value − Amount invested',
            formula: `${formatINR(m.fv)} − ${formatINR(m.P)}`,
            result: formatINR(m.gain),
          },
        ]

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ResultPanel title="Inputs">
          <div className="space-y-4">
            <div>
              <span className="text-sm font-semibold text-slate-700">Investment type</span>
              <div className="mt-1.5 inline-flex rounded-xl bg-slate-100 p-1">
                {(['sip', 'lumpsum'] as Mode[]).map((mm) => (
                  <button
                    key={mm}
                    onClick={() => setMode(mm)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      mode === mm ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {mm === 'sip' ? 'Monthly SIP' : 'Lumpsum'}
                  </button>
                ))}
              </div>
            </div>
            {mode === 'sip' ? (
              <>
                <CalcField label="Monthly investment" prefix="₹" value={monthly} onChange={setMonthly} />
                <CalcField
                  label="Annual step-up"
                  suffix="%"
                  value={stepUp}
                  onChange={setStepUp}
                  hint="Increase the SIP by this % every year (0 for a level SIP)"
                />
              </>
            ) : (
              <CalcField label="One-time investment" prefix="₹" value={lumpsum} onChange={setLumpsum} />
            )}
            <CalcField label="Expected return (annual)" suffix="%" value={ret} onChange={setRet} />
            <CalcField label="Investment period" suffix="years" value={years} onChange={setYears} />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        {m.valid ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <HeroResult label="Maturity value" value={formatINR(m.fv)} sub={`after ${m.yrs} years`} />
              <HeroResult label="Invested" value={formatINR(m.invested)} sub="your money" tone="sun" />
              <HeroResult label="Wealth gained" value={formatINR(m.gain)} sub="returns earned" tone="mint" />
            </div>

            <ResultPanel title="Invested vs value over time">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={m.data} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
                    <defs>
                      <linearGradient id="sipVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="sipInv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Year', position: 'insideBottom', offset: -2, fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} width={48} tickFormatter={compact} />
                    <Tooltip formatter={(v) => formatINR(Number(v))} labelFormatter={(l) => `Year ${l}`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="Value" stroke="#10b981" strokeWidth={2} fill="url(#sipVal)" />
                    <Area type="monotone" dataKey="Invested" stroke="#6366f1" strokeWidth={2} fill="url(#sipInv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">
                The gap between the two lines is the compounding return on your investment.
              </p>
            </ResultPanel>

            <ResultPanel title="Summary">
              <ResultRow label="Total invested" value={formatINR(m.invested)} />
              <ResultRow label="Wealth gained" value={formatINR(m.gain)} />
              <div className="my-1 border-t border-slate-100" />
              <ResultRow label="Maturity value" value={formatINR(m.fv)} strong />
            </ResultPanel>
          </>
        ) : (
          <ResultPanel>
            <p className="text-sm text-slate-600">
              Enter an investment amount and a period of at least one year.
            </p>
          </ResultPanel>
        )}
        <CalcSteps steps={steps} />
      </div>
    </div>
  )
}
