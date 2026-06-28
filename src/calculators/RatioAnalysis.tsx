import { useMemo, useState } from 'react'
import CalcField from '../components/calc/CalcField'
import { ResultPanel } from '../components/calc/CalcResult'
import { formatINR, toNum } from '../lib/format'
import { computeRatios, type FinancialInputs, type Grade } from '../lib/ratios'

const gradeStyle: Record<Grade, string> = {
  good: 'bg-mint-100 text-mint-600',
  ok: 'bg-sun-100 text-sun-600',
  weak: 'bg-rose-100 text-rose-500',
  na: 'bg-slate-100 text-slate-400',
}
const gradeLabel: Record<Grade, string> = { good: 'Strong', ok: 'Fair', weak: 'Weak', na: 'N/A' }

const DEFAULTS = {
  revenue: '5000000',
  cogs: '3000000',
  operatingExpenses: '1000000',
  interest: '200000',
  netProfit: '560000',
  currentAssets: '2000000',
  inventory: '800000',
  currentLiabilities: '1000000',
  totalAssets: '4000000',
  equity: '2500000',
  longTermDebt: '500000',
}

export default function RatioAnalysis() {
  const [f, setF] = useState(DEFAULTS)
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF((s) => ({ ...s, [k]: v }))

  const { groups, derived } = useMemo(() => {
    const inputs: FinancialInputs = {
      revenue: toNum(f.revenue),
      cogs: toNum(f.cogs),
      operatingExpenses: toNum(f.operatingExpenses),
      interest: toNum(f.interest),
      netProfit: toNum(f.netProfit),
      currentAssets: toNum(f.currentAssets),
      inventory: toNum(f.inventory),
      currentLiabilities: toNum(f.currentLiabilities),
      totalAssets: toNum(f.totalAssets),
      equity: toNum(f.equity),
      longTermDebt: toNum(f.longTermDebt),
    }
    return computeRatios(inputs)
  }, [f])

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="space-y-4">
          <ResultPanel title="Income statement">
            <div className="space-y-3">
              <CalcField label="Revenue (net sales)" prefix="₹" value={f.revenue} onChange={set('revenue')} />
              <CalcField label="Cost of goods sold (COGS)" prefix="₹" value={f.cogs} onChange={set('cogs')} />
              <CalcField label="Operating expenses" prefix="₹" value={f.operatingExpenses} onChange={set('operatingExpenses')} hint="Other operating costs below gross profit (selling, admin…)" />
              <CalcField label="Interest (finance cost)" prefix="₹" value={f.interest} onChange={set('interest')} hint="0 if the firm has no borrowings" />
              <CalcField label="Net profit after tax (PAT)" prefix="₹" value={f.netProfit} onChange={set('netProfit')} />
            </div>
          </ResultPanel>

          <ResultPanel title="Balance sheet">
            <div className="space-y-3">
              <CalcField label="Current assets" prefix="₹" value={f.currentAssets} onChange={set('currentAssets')} />
              <CalcField label="of which: Inventory (stock)" prefix="₹" value={f.inventory} onChange={set('inventory')} />
              <CalcField label="Current liabilities" prefix="₹" value={f.currentLiabilities} onChange={set('currentLiabilities')} />
              <CalcField label="Total assets" prefix="₹" value={f.totalAssets} onChange={set('totalAssets')} />
              <CalcField label="Shareholders’ equity (net worth)" prefix="₹" value={f.equity} onChange={set('equity')} />
              <CalcField label="Long-term debt" prefix="₹" value={f.longTermDebt} onChange={set('longTermDebt')} hint="Non-current borrowings" />
            </div>
          </ResultPanel>
        </div>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <ResultPanel title="Derived figures">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Gross profit', value: derived.grossProfit },
              { label: 'Operating profit (EBIT)', value: derived.ebit },
              { label: 'Working capital', value: derived.workingCapital },
              { label: 'Capital employed', value: derived.capitalEmployed },
            ].map((d) => (
              <div key={d.label} className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{d.label}</p>
                <p className="mt-0.5 text-sm font-bold text-slate-800">{formatINR(d.value)}</p>
              </div>
            ))}
          </div>
        </ResultPanel>

        {groups.map((g) => (
          <ResultPanel key={g.category} title={g.category}>
            <p className="-mt-2 mb-3 text-xs text-slate-400">{g.blurb}</p>
            <div className="space-y-3">
              {g.ratios.map((r) => (
                <div key={r.name} className="rounded-xl border border-slate-100 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">{r.name}</p>
                      <p className="mt-0.5 font-mono text-xs text-slate-400">{r.formula}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-display text-lg font-extrabold text-brand-700">{r.display}</p>
                      <span className={`cl-pill ${gradeStyle[r.grade]} mt-0.5`}>{gradeLabel[r.grade]}</span>
                    </div>
                  </div>
                  {r.ideal && (
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      Rule-of-thumb ideal: <span className="text-slate-700">{r.ideal}</span>
                    </p>
                  )}
                  <p className="mt-1.5 text-sm text-slate-600">{r.interpret}</p>
                </div>
              ))}
            </div>
          </ResultPanel>
        ))}

        <div className="rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          Interpretations use common rule-of-thumb benchmarks. A ratio is only meaningful against the firm’s own
          trend over years and against its industry peers — read them together, not in isolation.
        </div>
      </div>
    </div>
  )
}
