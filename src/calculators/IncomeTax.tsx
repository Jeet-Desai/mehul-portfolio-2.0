import { useMemo, useState } from 'react'
import { Trophy, Info } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import { ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, toNum } from '../lib/format'
import { computeRegime, type RegimeResult } from '../lib/incomeTax'

function RegimeCard({ r, best }: { r: RegimeResult; best: boolean }) {
  const title = r.regime === 'new' ? 'New regime' : 'Old regime'
  return (
    <div className={`cl-card p-6 hover:translate-y-0 ${best ? 'ring-2 ring-mint-400' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold">{title}</h3>
        {best && (
          <span className="cl-pill bg-mint-100 text-mint-600">
            <Trophy className="h-3.5 w-3.5" /> Lower tax
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-3xl font-extrabold text-brand-700">{formatINR(r.total)}</p>
      <p className="text-xs text-slate-400">total tax payable (incl. 4% cess)</p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left uppercase tracking-wide text-slate-400">
              <th className="py-1.5 pr-2 font-semibold">Slab</th>
              <th className="py-1.5 px-2 text-right font-semibold">Rate</th>
              <th className="py-1.5 pl-2 text-right font-semibold">Tax</th>
            </tr>
          </thead>
          <tbody>
            {r.rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="py-1.5 pr-2 text-slate-600">{row.range}</td>
                <td className="py-1.5 px-2 text-right text-slate-500">{row.rate}%</td>
                <td className="py-1.5 pl-2 text-right font-semibold text-slate-700">{formatINR(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-2">
        <ResultRow label="Standard deduction" value={formatINR(r.std)} />
        {r.regime === 'old' && <ResultRow label="Other deductions" value={formatINR(r.deductions)} />}
        <ResultRow label="Taxable income" value={formatINR(r.taxable)} />
        <ResultRow label="Tax before rebate" value={formatINR(r.tax)} />
        {r.rebate > 0 && <ResultRow label="Rebate u/s 87A" value={`− ${formatINR(r.rebate)}`} />}
        <ResultRow label="Health & education cess (4%)" value={formatINR(r.cess)} />
        <div className="my-1 border-t border-slate-100" />
        <ResultRow label="Total tax" value={formatINR(r.total)} strong />
      </div>
    </div>
  )
}

export default function IncomeTax() {
  const [gross, setGross] = useState('1200000')
  const [deductions, setDeductions] = useState('150000')
  const [salaried, setSalaried] = useState(true)

  const { newR, oldR, saving, winner } = useMemo(() => {
    const g = toNum(gross)
    const d = toNum(deductions)
    const newR = computeRegime({ gross: g, deductions: d, salaried, regime: 'new' })
    const oldR = computeRegime({ gross: g, deductions: d, salaried, regime: 'old' })
    const winner = newR.total <= oldR.total ? 'new' : 'old'
    const saving = Math.abs(newR.total - oldR.total)
    return { newR, oldR, saving, winner }
  }, [gross, deductions, salaried])

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ResultPanel title="Inputs">
          <div className="space-y-4">
            <CalcField label="Gross annual income" prefix="₹" value={gross} onChange={setGross} />
            <CalcField
              label="Deductions (80C, 80D, HRA…)"
              prefix="₹"
              value={deductions}
              onChange={setDeductions}
              hint="Applied to the old regime only"
            />
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={salaried}
                onChange={(e) => setSalaried(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
              />
              Salaried (apply standard deduction)
            </label>
          </div>
        </ResultPanel>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-sun-50 p-3 text-xs text-sun-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          FY 2025-26 (AY 2026-27), individuals below 60. Simplified for learning — verify with the
          latest Finance Act before filing.
        </div>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white shadow-md">
          <p className="text-sm text-white/80">Recommendation</p>
          <p className="mt-1 font-display text-xl font-extrabold">
            {saving === 0
              ? 'Both regimes cost the same'
              : `The ${winner} regime saves you ${formatINR(saving)}`}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <RegimeCard r={newR} best={winner === 'new' && saving !== 0} />
          <RegimeCard r={oldR} best={winner === 'old' && saving !== 0} />
        </div>
      </div>
    </div>
  )
}
