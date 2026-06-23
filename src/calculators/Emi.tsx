import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, formatNum, round, toNum } from '../lib/format'
import { tooltipProps } from '../lib/chartTheme'
import type { Step } from './types'

export default function Emi() {
  const [principal, setPrincipal] = useState('500000')
  const [annualRate, setAnnualRate] = useState('9.5')
  const [years, setYears] = useState('5')

  const m = useMemo(() => {
    const P = toNum(principal)
    const annual = toNum(annualRate)
    const n = Math.round(toNum(years) * 12)
    const r = annual / 12 / 100
    let emi: number
    if (r === 0) emi = n > 0 ? P / n : 0
    else emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const total = emi * n
    const interest = total - P
    const valid = P > 0 && n > 0
    return {
      P,
      annual,
      n,
      r,
      emi: round(emi),
      total: round(total),
      interest: round(interest),
      valid,
      pie: [
        { name: 'Principal', value: round(P) },
        { name: 'Interest', value: round(interest) },
      ],
    }
  }, [principal, annualRate, years])

  const steps: Step[] = m.valid
    ? [
        {
          label: 'Monthly rate (r) = Annual rate ÷ 12 ÷ 100',
          formula: `${m.annual}% ÷ 12 ÷ 100`,
          result: `${formatNum(m.r * 100, 4)}% per month`,
        },
        { label: 'Number of months (n) = Years × 12', result: `${m.n} months` },
        {
          label: 'EMI = P × r × (1+r)ⁿ ÷ [(1+r)ⁿ − 1]',
          formula: `${formatINR(m.P)} × ${formatNum(m.r * 100, 4)}% …`,
          result: `${formatINR(m.emi)} / month`,
        },
        {
          label: 'Total payment = EMI × n',
          formula: `${formatINR(m.emi)} × ${m.n}`,
          result: formatINR(m.total),
        },
        {
          label: 'Total interest = Total payment − Principal',
          formula: `${formatINR(m.total)} − ${formatINR(m.P)}`,
          result: formatINR(m.interest),
        },
      ]
    : []

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ResultPanel title="Inputs">
          <div className="space-y-4">
            <CalcField label="Loan amount" prefix="₹" value={principal} onChange={setPrincipal} />
            <CalcField label="Interest rate (annual)" suffix="%" value={annualRate} onChange={setAnnualRate} />
            <CalcField label="Tenure" suffix="years" value={years} onChange={setYears} />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        {m.valid ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <HeroResult label="Monthly EMI" value={formatINR(m.emi)} sub={`${m.n} months`} />
              <HeroResult label="Total interest" value={formatINR(m.interest)} sub={`Total ${formatINR(m.total)}`} tone="sun" />
            </div>
            <ResultPanel title="Principal vs interest">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={m.pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      <Cell fill="#6366f1" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip {...tooltipProps} formatter={(v) => formatINR(Number(v))} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ResultRow label="Principal" value={formatINR(m.P)} />
              <ResultRow label="Interest payable" value={formatINR(m.interest)} />
              <div className="my-1 border-t border-slate-100" />
              <ResultRow label="Total payable" value={formatINR(m.total)} strong />
            </ResultPanel>
          </>
        ) : (
          <ResultPanel>
            <p className="text-sm text-slate-600">Enter a loan amount and a tenure greater than zero.</p>
          </ResultPanel>
        )}
        <CalcSteps steps={steps} />
      </div>
    </div>
  )
}
