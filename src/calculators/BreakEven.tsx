import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  Legend,
} from 'recharts'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, formatNum, formatPct, round, toNum } from '../lib/format'
import { chartGrid, chartAxis, axisTick, chartLabelFill, chartDotStroke, tooltipProps } from '../lib/chartTheme'
import type { Step } from './types'

export default function BreakEven() {
  const [fixed, setFixed] = useState('50000')
  const [price, setPrice] = useState('100')
  const [variable, setVariable] = useState('60')
  const [units, setUnits] = useState('2000')

  const m = useMemo(() => {
    const FC = toNum(fixed)
    const SP = toNum(price)
    const VC = toNum(variable)
    const expected = toNum(units)
    const contribution = SP - VC
    const pv = SP > 0 ? (contribution / SP) * 100 : 0
    const bepUnits = contribution > 0 ? FC / contribution : Infinity
    const bepSales = contribution > 0 ? bepUnits * SP : Infinity
    const mosUnits = expected - bepUnits
    const mosSales = mosUnits * SP
    const valid = contribution > 0 && SP > 0

    // chart data: 0 → ~1.6× the larger of BEP / expected
    const span = Math.max(bepUnits, expected) * 1.6 || 10
    const points = 24
    const data = Array.from({ length: points + 1 }, (_, i) => {
      const u = round((span / points) * i, 0)
      return { units: u, Revenue: u * SP, 'Total cost': FC + u * VC, 'Fixed cost': FC }
    })

    return { FC, SP, VC, expected, contribution, pv, bepUnits, bepSales, mosUnits, mosSales, valid, data }
  }, [fixed, price, variable, units])

  const steps: Step[] = m.valid
    ? [
        {
          label: 'Contribution per unit = Selling price − Variable cost',
          formula: `${formatINR(m.SP)} − ${formatINR(m.VC)}`,
          result: formatINR(m.contribution),
        },
        {
          label: 'P/V ratio = Contribution ÷ Selling price × 100',
          formula: `${formatINR(m.contribution)} ÷ ${formatINR(m.SP)} × 100`,
          result: formatPct(m.pv),
        },
        {
          label: 'Break-even (units) = Fixed cost ÷ Contribution per unit',
          formula: `${formatINR(m.FC)} ÷ ${formatINR(m.contribution)}`,
          result: `${formatNum(m.bepUnits)} units`,
        },
        {
          label: 'Break-even (sales) = BEP units × Selling price',
          formula: `${formatNum(m.bepUnits)} × ${formatINR(m.SP)}`,
          result: formatINR(m.bepSales),
        },
        {
          label: 'Margin of safety = Actual sales − Break-even sales',
          formula: `${formatNum(m.expected)} − ${formatNum(m.bepUnits)} units`,
          result: `${formatNum(m.mosUnits)} units  (${formatINR(m.mosSales)})`,
          note: m.mosUnits < 0 ? 'Negative — you are below break-even (operating at a loss).' : undefined,
        },
      ]
    : []

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* inputs */}
      <div className="lg:col-span-2">
        <ResultPanel title="Inputs">
          <div className="space-y-4">
            <CalcField label="Fixed costs (total)" prefix="₹" value={fixed} onChange={setFixed} />
            <CalcField label="Selling price per unit" prefix="₹" value={price} onChange={setPrice} />
            <CalcField label="Variable cost per unit" prefix="₹" value={variable} onChange={setVariable} />
            <CalcField
              label="Actual / expected sales (units)"
              value={units}
              onChange={setUnits}
              hint="Used for margin of safety"
            />
          </div>
        </ResultPanel>
      </div>

      {/* results */}
      <div className="space-y-4 lg:col-span-3">
        {m.valid ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <HeroResult label="Break-even point" value={`${formatNum(m.bepUnits)} units`} sub={formatINR(m.bepSales)} />
              <HeroResult label="P/V ratio" value={formatPct(m.pv)} sub={`Contribution ${formatINR(m.contribution)}/unit`} tone="mint" />
            </div>

            <ResultPanel title="Cost–Volume–Profit chart">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={m.data} margin={{ top: 8, right: 8, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                    <XAxis
                      dataKey="units"
                      stroke={chartAxis}
                      tick={axisTick}
                      label={{ value: 'Units', position: 'insideBottom', offset: -2, fontSize: 11, fill: chartLabelFill }}
                    />
                    <YAxis
                      stroke={chartAxis}
                      tick={axisTick}
                      width={48}
                      tickFormatter={(v: number) => `₹${Intl.NumberFormat('en-IN', { notation: 'compact' }).format(v)}`}
                    />
                    <Tooltip {...tooltipProps} formatter={(v) => formatINR(Number(v))} labelFormatter={(l) => `${formatNum(Number(l))} units`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Total cost" stroke="#6366f1" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Fixed cost" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
                    {Number.isFinite(m.bepUnits) && (
                      <ReferenceDot x={round(m.bepUnits, 0)} y={round(m.bepSales, 0)} r={5} fill="#4f46e5" stroke={chartDotStroke} strokeWidth={2} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">
                The marked point is where total cost meets revenue — the break-even point.
              </p>
            </ResultPanel>

            <ResultPanel title="Margin of safety">
              <ResultRow label="Actual sales" value={`${formatNum(m.expected)} units`} />
              <ResultRow label="Margin of safety (units)" value={`${formatNum(m.mosUnits)} units`} strong />
              <ResultRow label="Margin of safety (value)" value={formatINR(m.mosSales)} />
            </ResultPanel>
          </>
        ) : (
          <ResultPanel>
            <p className="text-sm text-slate-600">
              Selling price must be greater than variable cost for a positive contribution — otherwise
              there is no break-even point. Adjust the inputs.
            </p>
          </ResultPanel>
        )}

        <CalcSteps steps={steps} />
      </div>
    </div>
  )
}
