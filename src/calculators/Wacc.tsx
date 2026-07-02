import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, formatPct, round, toNum } from '../lib/format'
import { useCalcState } from '../lib/urlState'
import { tooltipProps } from '../lib/chartTheme'
import type { Step } from './types'

export default function Wacc() {
  const [equityVal, setEquityVal] = useCalcState('ev', '600000')
  const [equityCost, setEquityCost] = useCalcState('ke', '14')
  const [debtVal, setDebtVal] = useCalcState('dv', '300000')
  const [debtCost, setDebtCost] = useCalcState('kd', '10')
  const [prefVal, setPrefVal] = useCalcState('pv', '100000')
  const [prefCost, setPrefCost] = useCalcState('kp', '12')
  const [tax, setTax] = useCalcState('tax', '30')

  const m = useMemo(() => {
    const E = toNum(equityVal)
    const Ke = toNum(equityCost)
    const D = toNum(debtVal)
    const Kd = toNum(debtCost)
    const P = toNum(prefVal)
    const Kp = toNum(prefCost)
    const t = toNum(tax) / 100

    const V = E + D + P
    const valid = V > 0

    const wE = valid ? E / V : 0
    const wD = valid ? D / V : 0
    const wP = valid ? P / V : 0
    const kdAfterTax = Kd * (1 - t)

    const contribE = wE * Ke
    const contribD = wD * kdAfterTax
    const contribP = wP * Kp
    const wacc = contribE + contribD + contribP

    return {
      E,
      Ke,
      D,
      Kd,
      P,
      Kp,
      t,
      V,
      valid,
      wE: round(wE * 100),
      wD: round(wD * 100),
      wP: round(wP * 100),
      kdAfterTax: round(kdAfterTax),
      contribE: round(contribE),
      contribD: round(contribD),
      contribP: round(contribP),
      wacc: round(wacc),
      pie: [
        { name: 'Equity', value: round(E) },
        { name: 'Debt', value: round(D) },
        { name: 'Preference', value: round(P) },
      ].filter((s) => s.value > 0),
    }
  }, [equityVal, equityCost, debtVal, debtCost, prefVal, prefCost, tax])

  const steps: Step[] = m.valid
    ? [
        {
          label: 'Total capital (V) = Equity + Debt + Preference',
          formula: `${formatINR(m.E)} + ${formatINR(m.D)} + ${formatINR(m.P)}`,
          result: formatINR(m.V),
        },
        {
          label: 'Weights = each source ÷ total capital',
          result: `Equity ${formatPct(m.wE)} · Debt ${formatPct(m.wD)} · Pref ${formatPct(m.wP)}`,
        },
        {
          label: 'After-tax cost of debt = Kd × (1 − tax rate)',
          formula: `${m.Kd}% × (1 − ${formatPct(m.t * 100, 0)})`,
          result: formatPct(m.kdAfterTax),
          note: 'Interest is tax-deductible, so debt is cheaper after tax. Equity & preference get no shield.',
        },
        {
          label: 'WACC = wₑ·Kₑ + w_d·Kd(after-tax) + w_p·Kp',
          formula: `${formatPct(m.wE)}×${m.Ke}% + ${formatPct(m.wD)}×${formatPct(m.kdAfterTax)} + ${formatPct(m.wP)}×${m.Kp}%`,
          result: formatPct(m.wacc),
        },
      ]
    : []

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ResultPanel title="Inputs">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <CalcField label="Equity value" prefix="₹" value={equityVal} onChange={setEquityVal} />
              <CalcField label="Cost of equity" suffix="%" value={equityCost} onChange={setEquityCost} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CalcField label="Debt value" prefix="₹" value={debtVal} onChange={setDebtVal} />
              <CalcField label="Cost of debt" suffix="%" value={debtCost} onChange={setDebtCost} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CalcField label="Preference value" prefix="₹" value={prefVal} onChange={setPrefVal} hint="0 if none" />
              <CalcField label="Cost of preference" suffix="%" value={prefCost} onChange={setPrefCost} />
            </div>
            <CalcField label="Tax rate" suffix="%" value={tax} onChange={setTax} hint="Applied only to debt (interest tax shield)" />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        {m.valid ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <HeroResult label="WACC" value={formatPct(m.wacc)} sub="weighted average cost of capital" />
              <HeroResult label="After-tax cost of debt" value={formatPct(m.kdAfterTax)} sub={`from ${m.Kd}% pre-tax`} tone="mint" />
            </div>

            <ResultPanel title="Capital structure">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={m.pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      <Cell fill="#6366f1" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip {...tooltipProps} formatter={(v) => formatINR(Number(v))} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ResultPanel>

            <ResultPanel title="Weighted contribution to WACC">
              <ResultRow label={`Equity — ${formatPct(m.wE)} × ${m.Ke}%`} value={formatPct(m.contribE)} />
              <ResultRow label={`Debt — ${formatPct(m.wD)} × ${formatPct(m.kdAfterTax)}`} value={formatPct(m.contribD)} />
              <ResultRow label={`Preference — ${formatPct(m.wP)} × ${m.Kp}%`} value={formatPct(m.contribP)} />
              <div className="my-1 border-t border-slate-100" />
              <ResultRow label="WACC" value={formatPct(m.wacc)} strong />
            </ResultPanel>
          </>
        ) : (
          <ResultPanel>
            <p className="text-sm text-slate-600">
              Enter the market value of at least one capital source (equity, debt or preference).
            </p>
          </ResultPanel>
        )}
        <CalcSteps steps={steps} />
      </div>
    </div>
  )
}
