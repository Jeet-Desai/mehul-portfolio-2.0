import { useMemo, useState } from 'react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, round, toNum } from '../lib/format'
import type { Step } from './types'

const RATES = ['5', '12', '18', '28']

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex rounded-xl bg-slate-100 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
            value === o.value ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Gst() {
  const [amount, setAmount] = useState('10000')
  const [rate, setRate] = useState('18')
  const [mode, setMode] = useState<'add' | 'remove'>('add')
  const [supply, setSupply] = useState<'intra' | 'inter'>('intra')

  const m = useMemo(() => {
    const amt = toNum(amount)
    const r = toNum(rate)
    let base: number
    let gst: number
    if (mode === 'add') {
      base = amt
      gst = (amt * r) / 100
    } else {
      base = (amt * 100) / (100 + r)
      gst = amt - base
    }
    const total = base + gst
    return {
      amt,
      r,
      base: round(base),
      gst: round(gst),
      total: round(total),
      half: round(gst / 2),
    }
  }, [amount, rate, mode, supply])

  const steps: Step[] = [
    mode === 'add'
      ? {
          label: 'GST amount = Base × Rate ÷ 100',
          formula: `${formatINR(m.base)} × ${m.r}% `,
          result: formatINR(m.gst),
        }
      : {
          label: 'Base = Amount × 100 ÷ (100 + Rate)',
          formula: `${formatINR(m.amt)} × 100 ÷ ${100 + m.r}`,
          result: formatINR(m.base),
        },
    mode === 'add'
      ? { label: 'Total = Base + GST', formula: `${formatINR(m.base)} + ${formatINR(m.gst)}`, result: formatINR(m.total) }
      : { label: 'GST = Amount − Base', formula: `${formatINR(m.amt)} − ${formatINR(m.base)}`, result: formatINR(m.gst) },
    supply === 'intra'
      ? {
          label: 'Intra-state: split equally into CGST + SGST',
          formula: `${formatINR(m.gst)} ÷ 2`,
          result: `CGST ${formatINR(m.half)} + SGST ${formatINR(m.half)}`,
        }
      : {
          label: 'Inter-state: full amount is IGST',
          result: `IGST ${formatINR(m.gst)}`,
        },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ResultPanel title="Inputs">
          <div className="space-y-4">
            <div>
              <span className="text-sm font-semibold text-slate-700">Calculation</span>
              <div className="mt-1.5">
                <Segmented
                  value={mode}
                  onChange={setMode}
                  options={[
                    { value: 'add', label: 'Add GST' },
                    { value: 'remove', label: 'Remove GST' },
                  ]}
                />
              </div>
            </div>
            <CalcField
              label={mode === 'add' ? 'Amount (before GST)' : 'Amount (incl. GST)'}
              prefix="₹"
              value={amount}
              onChange={setAmount}
            />
            <div>
              <CalcField label="GST rate" suffix="%" value={rate} onChange={setRate} />
              <div className="mt-2 flex flex-wrap gap-2">
                {RATES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRate(r)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      rate === r ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-700">Supply type</span>
              <div className="mt-1.5">
                <Segmented
                  value={supply}
                  onChange={setSupply}
                  options={[
                    { value: 'intra', label: 'Intra-state' },
                    { value: 'inter', label: 'Inter-state' },
                  ]}
                />
              </div>
            </div>
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <div className="grid gap-4 sm:grid-cols-2">
          <HeroResult label="Total GST" value={formatINR(m.gst)} sub={`@ ${m.r}%`} />
          <HeroResult label="Total amount" value={formatINR(m.total)} sub={`Base ${formatINR(m.base)}`} tone="mint" />
        </div>
        <ResultPanel title="Breakdown">
          <ResultRow label="Taxable value (base)" value={formatINR(m.base)} />
          {supply === 'intra' ? (
            <>
              <ResultRow label="CGST" value={formatINR(m.half)} />
              <ResultRow label="SGST" value={formatINR(m.half)} />
            </>
          ) : (
            <ResultRow label="IGST" value={formatINR(m.gst)} />
          )}
          <div className="my-1 border-t border-slate-100" />
          <ResultRow label="Invoice total" value={formatINR(m.total)} strong />
        </ResultPanel>
        <CalcSteps steps={steps} />
      </div>
    </div>
  )
}
