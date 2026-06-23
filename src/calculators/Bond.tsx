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
  ReferenceDot,
} from 'recharts'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, formatNum, formatPct, round, toNum } from '../lib/format'
import { bondPrice, bondYTM } from '../lib/finance'
import type { Step } from './types'

type Mode = 'price' | 'yield'

export default function Bond() {
  const [mode, setMode] = useState<Mode>('price')
  const [face, setFace] = useState('1000')
  const [coupon, setCoupon] = useState('8')
  const [years, setYears] = useState('5')
  const [freq, setFreq] = useState(2) // coupons per year
  const [yld, setYld] = useState('9') // market yield (price mode)
  const [price, setPrice] = useState('960') // market price (yield mode)

  const m = useMemo(() => {
    const F = toNum(face)
    const cPct = toNum(coupon)
    const yrs = toNum(years)
    const per = Math.max(1, Math.round(freq))
    const n = Math.max(1, Math.round(yrs * per))
    const couponPerPeriod = (F * (cPct / 100)) / per
    const annualCoupon = F * (cPct / 100)

    const valid = F > 0 && yrs > 0
    if (!valid) return { valid: false as const }

    // operative yield % and price, depending on mode
    let yieldPct: number
    let bondP: number
    if (mode === 'price') {
      yieldPct = toNum(yld)
      bondP = bondPrice(F, cPct, yrs, yieldPct, per)
    } else {
      bondP = toNum(price)
      yieldPct = bondYTM(bondP, F, cPct, yrs, per)
    }

    const currentYield = bondP > 0 ? (annualCoupon / bondP) * 100 : NaN
    const status: 'premium' | 'par' | 'discount' =
      bondP > F + 0.005 ? 'premium' : bondP < F - 0.005 ? 'discount' : 'par'

    // cash-flow schedule, discounted at the operative yield
    const i = yieldPct / 100 / per
    const schedule = Array.from({ length: n }, (_, idx) => {
      const t = idx + 1
      const cf = t === n ? couponPerPeriod + F : couponPerPeriod
      const df = Number.isFinite(i) ? 1 / Math.pow(1 + i, t) : NaN
      return { t, coupon: round(couponPerPeriod), redemption: t === n ? F : 0, cf: round(cf), df: round(df, 4), pv: round(cf * df) }
    })

    // price-yield curve sweep
    const centre = Number.isFinite(yieldPct) ? yieldPct : cPct
    const maxY = Math.max(2, centre * 2, cPct * 2)
    const curve = Array.from({ length: 41 }, (_, k) => {
      const ry = (maxY / 40) * k
      return { yield: round(ry, 2), price: round(bondPrice(F, cPct, yrs, ry, per)) }
    })

    return {
      valid: true as const,
      F,
      cPct,
      yrs,
      per,
      n,
      couponPerPeriod: round(couponPerPeriod),
      annualCoupon: round(annualCoupon),
      yieldPct,
      price: round(bondP),
      currentYield: round(currentYield, 3),
      status,
      schedule,
      curve,
      maxY,
    }
  }, [mode, face, coupon, years, freq, yld, price])

  const statusTone = m.valid && m.status === 'discount' ? 'mint' : m.valid && m.status === 'premium' ? 'sun' : 'brand'
  const statusText =
    m.valid && m.status === 'premium'
      ? 'Premium — price above face (yield < coupon)'
      : m.valid && m.status === 'discount'
        ? 'Discount — price below face (yield > coupon)'
        : 'At par — price equals face (yield = coupon)'

  const steps: Step[] = m.valid
    ? mode === 'price'
      ? [
          {
            label: 'Coupon per period = Face × coupon rate ÷ frequency',
            formula: `${formatINR(m.F)} × ${formatPct(m.cPct, m.cPct % 1 === 0 ? 0 : 2)} ÷ ${m.per}`,
            result: formatINR(m.couponPerPeriod),
            note: m.per === 2 ? 'Semi-annual: the annual yield is also halved per period.' : undefined,
          },
          {
            label: 'Discount every coupon and the redemption value to today',
            formula: 'Price = Σ Coupon ÷ (1 + y/m)ᵗ  +  Face ÷ (1 + y/m)ⁿ',
            result: `Price = ${formatINR(m.price)}`,
            note: `Discounted at the market yield ${formatPct(m.yieldPct, 2)} over ${m.n} periods.`,
          },
          {
            label: 'Compare with face value',
            formula: `${formatINR(m.price)} vs face ${formatINR(m.F)}`,
            result: statusText,
          },
          {
            label: 'Current yield = annual coupon ÷ price',
            formula: `${formatINR(m.annualCoupon)} ÷ ${formatINR(m.price)}`,
            result: formatPct(m.currentYield, 3),
            note: 'Current yield ignores the capital pull-to-par; YTM (here the market yield) captures it.',
          },
        ]
      : [
          {
            label: 'Set up the bond’s cash flows against its market price',
            formula: `Pay ${formatINR(m.price)} now → receive ${formatINR(m.couponPerPeriod)} each period + ${formatINR(m.F)} at maturity`,
            result: `${m.n} periods of cash flow`,
          },
          {
            label: 'YTM is the rate that prices these flows to the market price',
            formula: 'Solve  Price = Σ CF ÷ (1 + y/m)ᵗ  for y (found numerically, like IRR)',
            result: Number.isFinite(m.yieldPct) ? `YTM ≈ ${formatPct(m.yieldPct, 3)} (nominal annual)` : 'No solution for these inputs',
            note: m.per === 2 ? 'Per-period yield is multiplied by the frequency to annualise.' : undefined,
          },
          {
            label: 'Premium / discount cross-check',
            formula: `${formatINR(m.price)} vs face ${formatINR(m.F)}`,
            result: statusText,
            note: 'A discount bond has YTM above the coupon rate; a premium bond below it.',
          },
          {
            label: 'Current yield = annual coupon ÷ price',
            formula: `${formatINR(m.annualCoupon)} ÷ ${formatINR(m.price)}`,
            result: formatPct(m.currentYield, 3),
          },
        ]
    : []

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ResultPanel title="Inputs">
          <div className="space-y-4">
            <div>
              <span className="text-sm font-semibold text-slate-700">What do you want to find?</span>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {(
                  [
                    { v: 'price', label: 'Price (from yield)' },
                    { v: 'yield', label: 'YTM (from price)' },
                  ] as { v: Mode; label: string }[]
                ).map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setMode(o.v)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      mode === o.v ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <CalcField label="Face / par value" prefix="₹" value={face} onChange={setFace} />
            <CalcField label="Coupon rate (annual)" suffix="%" value={coupon} onChange={setCoupon} />
            <CalcField label="Years to maturity" value={years} onChange={setYears} />

            <div>
              <span className="text-sm font-semibold text-slate-700">Coupon frequency</span>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {[
                  { v: 1, label: 'Annual' },
                  { v: 2, label: 'Semi-annual' },
                ].map((o) => (
                  <button
                    key={o.v}
                    onClick={() => setFreq(o.v)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      freq === o.v ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'price' ? (
              <CalcField label="Market yield / required return" suffix="%" value={yld} onChange={setYld} />
            ) : (
              <CalcField label="Market price" prefix="₹" value={price} onChange={setPrice} />
            )}
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        {m.valid ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {mode === 'price' ? (
                <HeroResult label="Bond price" value={formatINR(m.price)} sub={`at ${formatPct(m.yieldPct, 2)} yield`} />
              ) : (
                <HeroResult
                  label="Yield to maturity"
                  value={Number.isFinite(m.yieldPct) ? formatPct(m.yieldPct, 3) : '—'}
                  sub="nominal annual"
                />
              )}
              <HeroResult label="Current yield" value={formatPct(m.currentYield, 3)} sub={statusText.split(' — ')[0]} tone={statusTone} />
            </div>

            <ResultPanel title="Price–yield curve">
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={m.curve} margin={{ top: 8, right: 14, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                    <XAxis
                      dataKey="yield"
                      type="number"
                      domain={[0, round(m.maxY, 0)]}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v}%`}
                      label={{ value: 'Yield', position: 'insideBottom', offset: -2, fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} width={54} tickFormatter={(v) => `₹${Intl.NumberFormat('en-IN', { notation: 'compact' }).format(v)}`} />
                    <Tooltip formatter={(v) => formatINR(Number(v))} labelFormatter={(l) => `Yield ${formatNum(Number(l), 2)}%`} />
                    <ReferenceLine y={m.F} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Face', fontSize: 10, fill: '#64748b', position: 'right' }} />
                    <Line type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} dot={false} />
                    {Number.isFinite(m.yieldPct) && m.yieldPct >= 0 && m.yieldPct <= m.maxY && (
                      <ReferenceDot x={round(m.yieldPct, 2)} y={m.price} r={5} fill="#f59e0b" stroke="#fff" strokeWidth={2} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">
                Price falls as yield rises (and convexly). It equals face value exactly when yield = coupon rate.
              </p>
            </ResultPanel>

            <ResultPanel title="Cash-flow schedule (discounted at the operative yield)">
              <div className="max-h-72 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-slate-200 text-left uppercase tracking-wide text-slate-400">
                      <th className="py-1.5 pr-2 font-semibold">Period</th>
                      <th className="py-1.5 px-2 text-right font-semibold">Coupon</th>
                      <th className="py-1.5 px-2 text-right font-semibold">Redemption</th>
                      <th className="py-1.5 px-2 text-right font-semibold">DF</th>
                      <th className="py-1.5 pl-2 text-right font-semibold">PV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.schedule.map((row) => (
                      <tr key={row.t} className="border-b border-slate-50">
                        <td className="py-1.5 pr-2 text-slate-600">{row.t}</td>
                        <td className="py-1.5 px-2 text-right text-slate-700">{formatINR(row.coupon)}</td>
                        <td className="py-1.5 px-2 text-right text-slate-500">{row.redemption ? formatINR(row.redemption) : '—'}</td>
                        <td className="py-1.5 px-2 text-right text-slate-400">{Number.isFinite(row.df) ? row.df.toFixed(4) : '—'}</td>
                        <td className="py-1.5 pl-2 text-right font-semibold text-slate-700">{formatINR(row.pv)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ResultPanel>

            <ResultPanel title="Summary">
              <ResultRow label="Face / par value" value={formatINR(m.F)} />
              <ResultRow label="Coupon per period" value={formatINR(m.couponPerPeriod)} />
              <ResultRow label="Periods to maturity" value={`${m.n} (${m.per === 2 ? 'semi-annual' : 'annual'})`} />
              <ResultRow label={mode === 'price' ? 'Market yield (YTM)' : 'Solved YTM'} value={Number.isFinite(m.yieldPct) ? formatPct(m.yieldPct, 3) : '—'} />
              <ResultRow label="Current yield" value={formatPct(m.currentYield, 3)} />
              <div className="my-1 border-t border-slate-100" />
              <ResultRow label={mode === 'price' ? 'Bond price' : 'Market price'} value={formatINR(m.price)} strong />
            </ResultPanel>
          </>
        ) : (
          <ResultPanel>
            <p className="text-sm text-slate-600">Enter a positive face value and years to maturity.</p>
          </ResultPanel>
        )}
        <CalcSteps steps={steps} />
      </div>
    </div>
  )
}
