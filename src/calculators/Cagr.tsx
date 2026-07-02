import { useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Plus, Trash2, Info } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, formatPct, round, toNum } from '../lib/format'
import { chartGrid, chartAxis, axisTick, chartLabelFill, tooltipProps } from '../lib/chartTheme'
import { cagr, xirr, type DatedFlow } from '../lib/finance'
import { useCalcState } from '../lib/urlState'
import type { Step } from './types'

type Mode = 'cagr' | 'xirr'

const compact = (v: number) => `₹${Intl.NumberFormat('en-IN', { notation: 'compact' }).format(v)}`

type Row = { date: string; amount: string }

const DEFAULT_ROWS: Row[] = [
  { date: '2023-01-01', amount: '-100000' },
  { date: '2023-06-01', amount: '-50000' },
  { date: '2024-01-01', amount: '175000' },
]

export default function Cagr() {
  const [mode, setMode] = useCalcState('mode', 'cagr')

  // CAGR inputs
  const [begin, setBegin] = useCalcState('bv', '100000')
  const [end, setEnd] = useCalcState('ev', '260000')
  const [years, setYears] = useCalcState('yrs', '5')

  // XIRR inputs
  const [rows, setRows] = useState<Row[]>(DEFAULT_ROWS)

  const setRow = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const addRow = () => setRows((rs) => [...rs, { date: '', amount: '' }])
  const removeRow = (i: number) => setRows((rs) => (rs.length > 2 ? rs.filter((_, idx) => idx !== i) : rs))

  const cagrM = useMemo(() => {
    const b = toNum(begin)
    const e = toNum(end)
    const y = toNum(years)
    const g = cagr(b, e, y)
    const valid = Number.isFinite(g)
    const totalReturn = b > 0 ? (e - b) / b : NaN
    // growth path at the CAGR rate
    const n = Math.max(1, Math.floor(y))
    const data: { year: number; Value: number }[] = []
    if (valid) {
      for (let t = 0; t <= n; t++) data.push({ year: t, Value: round(b * Math.pow(1 + g, t)) })
      if (y > n) data.push({ year: round(y, 2), Value: round(e) })
    }
    return { b, e, y, g, valid, totalReturn, gain: e - b, data }
  }, [begin, end, years])

  const xirrM = useMemo(() => {
    const parsed: DatedFlow[] = rows
      .map((r) => ({ date: new Date(r.date), amount: toNum(r.amount) }))
      .filter((f) => !Number.isNaN(f.date.getTime()) && f.amount !== 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    const invested = parsed.filter((f) => f.amount < 0).reduce((s, f) => s - f.amount, 0)
    const received = parsed.filter((f) => f.amount > 0).reduce((s, f) => s + f.amount, 0)
    const rate = parsed.length >= 2 ? xirr(parsed) : NaN
    const valid = Number.isFinite(rate)
    const absReturn = invested > 0 ? (received - invested) / invested : NaN
    return { parsed, invested, received, gain: received - invested, rate, valid, absReturn }
  }, [rows])

  const cagrSteps: Step[] = cagrM.valid
    ? [
        {
          label: 'CAGR formula',
          formula: 'CAGR = (Ending ÷ Beginning)^(1 ÷ years) − 1',
          note: 'The single constant annual rate that grows the beginning value to the ending value.',
        },
        {
          label: 'Substitute the values',
          formula: `(${formatINR(cagrM.e)} ÷ ${formatINR(cagrM.b)})^(1 ÷ ${formatNumYears(cagrM.y)}) − 1`,
          result: formatPct(cagrM.g * 100, 2),
        },
        {
          label: 'Total (point-to-point) return for comparison',
          formula: `(${formatINR(cagrM.e)} − ${formatINR(cagrM.b)}) ÷ ${formatINR(cagrM.b)}`,
          result: formatPct(cagrM.totalReturn * 100, 2),
          note: 'CAGR annualises this; it is not the same as total return ÷ years.',
        },
      ]
    : []

  const xirrSteps: Step[] = xirrM.valid
    ? [
        {
          label: 'XIRR solves XNPV = 0',
          formula: 'Σ CFᵢ ÷ (1 + r)^(daysᵢ ÷ 365) = 0',
          note: 'Each cash flow is discounted by the exact number of days from the first flow (Actual/365), then r is found numerically.',
        },
        {
          label: 'Total invested (outflows) vs received (inflows)',
          formula: `${formatINR(xirrM.received)} received − ${formatINR(xirrM.invested)} invested`,
          result: `${formatINR(xirrM.gain)} net gain`,
        },
        {
          label: 'Annualised return (XIRR), found by Newton-Raphson',
          result: formatPct(xirrM.rate * 100, 2),
          note: 'Unlike a simple return, XIRR accounts for when each rupee went in or out.',
        },
      ]
    : []

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ResultPanel title="Inputs">
          <div className="space-y-4">
            <div>
              <span className="text-sm font-semibold text-slate-700">Measure</span>
              <div className="mt-1.5 inline-flex rounded-xl bg-slate-100 p-1">
                {(
                  [
                    { v: 'cagr', label: 'CAGR' },
                    { v: 'xirr', label: 'XIRR' },
                  ] as { v: Mode; label: string }[]
                ).map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setMode(o.v)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      mode === o.v ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                {mode === 'cagr'
                  ? 'CAGR — one investment, a start and end value over a fixed period.'
                  : 'XIRR — multiple investments/withdrawals on different dates.'}
              </p>
            </div>

            {mode === 'cagr' ? (
              <>
                <CalcField label="Beginning value" prefix="₹" value={begin} onChange={setBegin} />
                <CalcField label="Ending value" prefix="₹" value={end} onChange={setEnd} />
                <CalcField label="Period" suffix="years" value={years} onChange={setYears} hint="Fractional years are allowed (e.g. 3.5)" />
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Enter each cash flow with its date. <b>Negative</b> = money you put in (purchase),{' '}
                    <b>positive</b> = money you got back (redemption / dividend).
                  </span>
                </div>
                {rows.map((r, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <label className="block flex-1">
                      <span className="text-xs font-semibold text-slate-600">Date</span>
                      <input
                        type="date"
                        value={r.date}
                        onChange={(e) => setRow(i, { date: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                      />
                    </label>
                    <label className="block flex-1">
                      <span className="text-xs font-semibold text-slate-600">Amount (₹)</span>
                      <input
                        inputMode="decimal"
                        value={r.amount}
                        placeholder="-100000"
                        onChange={(e) => setRow(i, { amount: e.target.value })}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                      />
                    </label>
                    <button
                      onClick={() => removeRow(i)}
                      disabled={rows.length <= 2}
                      className="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Remove row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addRow}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-brand-300 px-3 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
                >
                  <Plus className="h-4 w-4" /> Add cash flow
                </button>
              </div>
            )}
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        {mode === 'cagr' ? (
          cagrM.valid ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <HeroResult label="CAGR" value={formatPct(cagrM.g * 100, 2)} sub={`over ${formatNumYears(cagrM.y)} years`} />
                <HeroResult label="Total return" value={formatPct(cagrM.totalReturn * 100, 2)} sub="point to point" tone="sun" />
                <HeroResult label="Absolute gain" value={formatINR(cagrM.gain)} sub="wealth added" tone="mint" />
              </div>

              <ResultPanel title="Value growing at the CAGR rate">
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cagrM.data} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
                      <defs>
                        <linearGradient id="cagrFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                      <XAxis dataKey="year" stroke={chartAxis} tick={axisTick} label={{ value: 'Year', position: 'insideBottom', offset: -2, fontSize: 11, fill: chartLabelFill }} />
                      <YAxis stroke={chartAxis} tick={axisTick} width={48} tickFormatter={compact} />
                      <Tooltip {...tooltipProps} formatter={(v) => formatINR(Number(v))} labelFormatter={(l) => `Year ${l}`} />
                      <Area type="monotone" dataKey="Value" stroke="#6366f1" strokeWidth={2} fill="url(#cagrFill)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-2 text-center text-xs text-slate-400">
                  A smooth curve — the actual journey is rarely this even; CAGR averages it out.
                </p>
              </ResultPanel>
            </>
          ) : (
            <ResultPanel>
              <p className="text-sm text-slate-600">
                Enter a positive beginning value, ending value and a period of more than zero years.
              </p>
            </ResultPanel>
          )
        ) : xirrM.valid ? (
          <>
            <HeroResult label="XIRR (annualised return)" value={formatPct(xirrM.rate * 100, 2)} sub="accounts for the timing of every flow" />
            <ResultPanel title="Summary">
              <ResultRow label="Total invested" value={formatINR(xirrM.invested)} />
              <ResultRow label="Total received" value={formatINR(xirrM.received)} />
              <ResultRow label="Absolute return" value={formatPct(xirrM.absReturn * 100, 2)} />
              <div className="my-1 border-t border-slate-100" />
              <ResultRow label="Net gain" value={formatINR(xirrM.gain)} strong />
            </ResultPanel>
          </>
        ) : (
          <ResultPanel>
            <p className="text-sm text-slate-600">
              Add at least one negative (money in) and one positive (money out) cash flow, each with a valid
              date. XIRR needs flows that change sign to have a solution.
            </p>
          </ResultPanel>
        )}
        <CalcSteps steps={mode === 'cagr' ? cagrSteps : xirrSteps} />
      </div>
    </div>
  )
}

const formatNumYears = (y: number) =>
  Number.isInteger(y) ? String(y) : new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(y)
