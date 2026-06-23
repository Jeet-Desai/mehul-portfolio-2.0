import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, formatNum, formatPct, round, toNum } from '../lib/format'
import { npv, irr, paybackPeriod } from '../lib/finance'
import type { Step } from './types'

const compact = (v: number) => `₹${Intl.NumberFormat('en-IN', { notation: 'compact' }).format(v)}`

const fmtYears = (p: number | null) =>
  p === null ? 'Never recovered' : `${formatNum(p, 2)} years`

export default function CapitalBudgeting() {
  const [initial, setInitial] = useState('1000000')
  const [rate, setRate] = useState('10')
  const [inflows, setInflows] = useState<string[]>(['300000', '300000', '350000', '350000', '300000'])

  const setInflow = (i: number, v: string) =>
    setInflows((xs) => xs.map((x, idx) => (idx === i ? v : x)))
  const addYear = () => setInflows((xs) => [...xs, ''])
  const removeYear = (i: number) =>
    setInflows((xs) => (xs.length > 1 ? xs.filter((_, idx) => idx !== i) : xs))

  const m = useMemo(() => {
    const I = toNum(initial)
    const r = toNum(rate) / 100
    const ins = inflows.map(toNum)
    const flows = [-I, ...ins]
    const valid = I > 0 && ins.length > 0

    const npvVal = npv(r, flows)
    const pvInflows = npvVal + I
    const pi = I > 0 ? pvInflows / I : NaN
    const irrVal = irr(flows)

    const paybackSimple = paybackPeriod(flows)
    const discounted = flows.map((cf, t) => cf / Math.pow(1 + r, t))
    const paybackDisc = paybackPeriod(discounted)

    // year-by-year schedule for the table
    let cumSimple = -I
    let cumDisc = -I
    const schedule = ins.map((cf, idx) => {
      const t = idx + 1
      const df = 1 / Math.pow(1 + r, t)
      const pv = cf * df
      cumSimple += cf
      cumDisc += pv
      return { year: t, cf: round(cf), df: round(df, 4), pv: round(pv), cumSimple: round(cumSimple), cumDisc: round(cumDisc) }
    })

    // NPV profile: NPV across a sweep of discount rates
    const irrPct = Number.isFinite(irrVal) ? irrVal * 100 : NaN
    const maxRatePct = Math.max(30, Number.isFinite(irrPct) ? irrPct * 1.6 : 30)
    const profile: { rate: number; NPV: number }[] = []
    for (let i = 0; i <= 40; i++) {
      const rp = (maxRatePct / 40) * i
      profile.push({ rate: round(rp, 2), NPV: round(npv(rp / 100, flows)) })
    }

    return {
      I,
      r,
      ratePct: toNum(rate),
      ins,
      valid,
      npv: round(npvVal),
      pvInflows: round(pvInflows),
      pi: round(pi, 3),
      irr: irrVal,
      irrPct,
      paybackSimple,
      paybackDisc,
      schedule,
      profile,
      maxRatePct,
    }
  }, [initial, rate, inflows])

  const accept = m.valid && m.npv > 0

  const steps: Step[] = m.valid
    ? [
        {
          label: 'Discount each year’s inflow to today (present value)',
          formula: 'PV = Cash flow ÷ (1 + r)ᵗ',
          result: `PV of all inflows = ${formatINR(m.pvInflows)}`,
          note: `Discount rate r = ${formatPct(m.ratePct, 2)} (your cost of capital).`,
        },
        {
          label: 'NPV = PV of inflows − initial investment',
          formula: `${formatINR(m.pvInflows)} − ${formatINR(m.I)}`,
          result: formatINR(m.npv),
          note: 'Accept if NPV > 0 — the project adds value over its cost of capital.',
        },
        {
          label: 'Profitability Index (PI) = PV of inflows ÷ initial investment',
          formula: `${formatINR(m.pvInflows)} ÷ ${formatINR(m.I)}`,
          result: formatNum(m.pi, 3),
          note: 'PI > 1 means the same accept decision as NPV > 0; useful to rank projects.',
        },
        {
          label: 'IRR — the discount rate at which NPV = 0',
          formula: 'Solve NPV(r) = 0 for r (found numerically)',
          result: Number.isFinite(m.irrPct) ? formatPct(m.irrPct, 2) : 'No real IRR for these flows',
          note: Number.isFinite(m.irrPct)
            ? `Accept if IRR (${formatPct(m.irrPct, 2)}) > cost of capital (${formatPct(m.ratePct, 2)}).`
            : 'IRR needs the cash flows to change sign (an outlay followed by inflows).',
        },
        {
          label: 'Payback period — when cumulative cash flow turns positive',
          formula: 'Interpolated within the recovery year',
          result: `Simple ${fmtYears(m.paybackSimple)} · Discounted ${fmtYears(m.paybackDisc)}`,
          note: 'Discounted payback uses present values, so it is always ≥ the simple payback.',
        },
      ]
    : []

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ResultPanel title="Inputs">
          <div className="space-y-4">
            <CalcField label="Initial investment (Year 0 outlay)" prefix="₹" value={initial} onChange={setInitial} />
            <CalcField label="Discount rate / cost of capital" suffix="%" value={rate} onChange={setRate} />
            <div>
              <span className="text-sm font-semibold text-slate-700">Annual cash inflows</span>
              <p className="mb-2 mt-0.5 text-xs text-slate-400">Net cash inflow at the end of each year.</p>
              <div className="space-y-2">
                {inflows.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-16 shrink-0 text-xs font-semibold text-slate-500">Year {i + 1}</span>
                    <div className="flex flex-1 items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
                      <span className="grid place-items-center bg-slate-50 px-3 text-sm font-medium text-slate-500">₹</span>
                      <input
                        inputMode="decimal"
                        value={v}
                        onChange={(e) => setInflow(i, e.target.value)}
                        className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <button
                      onClick={() => removeYear(i)}
                      disabled={inflows.length <= 1}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Remove year"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addYear}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-brand-300 px-3 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
              >
                <Plus className="h-4 w-4" /> Add year
              </button>
            </div>
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        {m.valid ? (
          <>
            <div className={`rounded-2xl p-5 text-white shadow-md ${accept ? 'bg-gradient-to-br from-mint-500 to-mint-600' : 'bg-gradient-to-br from-rose-500 to-rose-600'}`}>
              <p className="flex items-center gap-2 text-sm font-medium text-white/90">
                {accept ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {accept ? 'Accept the project' : 'Reject the project'}
              </p>
              <p className="mt-1 font-display text-xl font-extrabold">
                NPV is {accept ? 'positive' : 'negative'} at {formatPct(m.ratePct, 2)} — {formatINR(m.npv)}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <HeroResult label="NPV" value={formatINR(m.npv)} sub={`at ${formatPct(m.ratePct, 2)}`} />
              <HeroResult label="IRR" value={Number.isFinite(m.irrPct) ? formatPct(m.irrPct, 2) : '—'} sub="NPV = 0 rate" tone="sun" />
              <HeroResult label="Profitability Index" value={formatNum(m.pi, 3)} sub={m.pi >= 1 ? 'creates value' : 'destroys value'} tone="mint" />
            </div>

            <ResultPanel title="NPV profile — NPV vs discount rate">
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={m.profile} margin={{ top: 8, right: 12, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                    <XAxis
                      dataKey="rate"
                      type="number"
                      domain={[0, round(m.maxRatePct, 0)]}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                      label={{ value: 'Discount rate', position: 'insideBottom', offset: -2, fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} width={52} tickFormatter={compact} />
                    <Tooltip
                      formatter={(v) => formatINR(Number(v))}
                      labelFormatter={(l) => `Rate ${formatNum(Number(l), 2)}%`}
                    />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
                    {Number.isFinite(m.irrPct) && m.irrPct <= m.maxRatePct && (
                      <ReferenceLine
                        x={round(m.irrPct, 2)}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                        label={{ value: `IRR ${formatNum(m.irrPct, 1)}%`, fontSize: 10, fill: '#d97706', position: 'top' }}
                      />
                    )}
                    <Line type="monotone" dataKey="NPV" stroke="#6366f1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">
                NPV falls as the discount rate rises; it crosses zero at the IRR.
              </p>
            </ResultPanel>

            <ResultPanel title="Discounted cash-flow schedule">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-left uppercase tracking-wide text-slate-400">
                      <th className="py-1.5 pr-2 font-semibold">Year</th>
                      <th className="py-1.5 px-2 text-right font-semibold">Cash flow</th>
                      <th className="py-1.5 px-2 text-right font-semibold">DF</th>
                      <th className="py-1.5 px-2 text-right font-semibold">PV</th>
                      <th className="py-1.5 pl-2 text-right font-semibold">Cum. PV</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-50">
                      <td className="py-1.5 pr-2 text-slate-600">0</td>
                      <td className="py-1.5 px-2 text-right text-rose-500">−{formatINR(m.I)}</td>
                      <td className="py-1.5 px-2 text-right text-slate-400">1.0000</td>
                      <td className="py-1.5 px-2 text-right text-rose-500">−{formatINR(m.I)}</td>
                      <td className="py-1.5 pl-2 text-right text-slate-700">−{formatINR(m.I)}</td>
                    </tr>
                    {m.schedule.map((row) => (
                      <tr key={row.year} className="border-b border-slate-50">
                        <td className="py-1.5 pr-2 text-slate-600">{row.year}</td>
                        <td className="py-1.5 px-2 text-right text-slate-700">{formatINR(row.cf)}</td>
                        <td className="py-1.5 px-2 text-right text-slate-400">{row.df.toFixed(4)}</td>
                        <td className="py-1.5 px-2 text-right font-semibold text-slate-700">{formatINR(row.pv)}</td>
                        <td className={`py-1.5 pl-2 text-right ${row.cumDisc >= 0 ? 'text-mint-600' : 'text-slate-500'}`}>
                          {row.cumDisc < 0 ? '−' : ''}{formatINR(Math.abs(row.cumDisc))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ResultPanel>

            <ResultPanel title="Summary">
              <ResultRow label="PV of inflows" value={formatINR(m.pvInflows)} />
              <ResultRow label="Initial investment" value={formatINR(m.I)} />
              <ResultRow label="Net present value (NPV)" value={formatINR(m.npv)} />
              <ResultRow label="Profitability index (PI)" value={formatNum(m.pi, 3)} />
              <ResultRow label="Internal rate of return (IRR)" value={Number.isFinite(m.irrPct) ? formatPct(m.irrPct, 2) : '—'} />
              <ResultRow label="Simple payback" value={fmtYears(m.paybackSimple)} />
              <div className="my-1 border-t border-slate-100" />
              <ResultRow label="Discounted payback" value={fmtYears(m.paybackDisc)} strong />
            </ResultPanel>
          </>
        ) : (
          <ResultPanel>
            <p className="text-sm text-slate-600">
              Enter a positive initial investment and at least one year of cash inflow.
            </p>
          </ResultPanel>
        )}
        <CalcSteps steps={steps} />
      </div>
    </div>
  )
}
