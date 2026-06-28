import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel } from '../components/calc/CalcResult'
import { formatINR, formatNum, toNum } from '../lib/format'
import { computeFlexibleBudget, type FlexInputs } from '../lib/flexibleBudget'

/* Seeded with a T.Y.B.Com past-exam example: at 1,000 units cost ₹38,000, at
   600 units ₹30,000 → variable ₹20/unit, fixed ₹18,000; at 800 units ₹34,000. */
const SEED = {
  highUnits: '1000',
  highCost: '38000',
  lowUnits: '600',
  lowCost: '30000',
  targetUnits: '800',
}

export default function FlexibleBudget() {
  const [f, setF] = useState(SEED)
  const set = (k: keyof typeof SEED, v: string) => setF((s) => ({ ...s, [k]: v }))

  const res = useMemo(() => {
    const inp: FlexInputs = {
      highUnits: toNum(f.highUnits),
      highCost: toNum(f.highCost),
      lowUnits: toNum(f.lowUnits),
      lowCost: toNum(f.lowCost),
      targetUnits: toNum(f.targetUnits),
    }
    return computeFlexibleBudget(inp)
  }, [f])

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="High & low observations">
          <div className="space-y-3">
            <CalcField label="High activity — units" value={f.highUnits} onChange={(v) => set('highUnits', v)} />
            <CalcField label="High activity — total cost" prefix="₹" value={f.highCost} onChange={(v) => set('highCost', v)} />
            <CalcField label="Low activity — units" value={f.lowUnits} onChange={(v) => set('lowUnits', v)} />
            <CalcField label="Low activity — total cost" prefix="₹" value={f.lowCost} onChange={(v) => set('lowCost', v)} />
          </div>
        </ResultPanel>
        <ResultPanel title="Budget for">
          <CalcField label="Target activity — units" value={f.targetUnits} onChange={(v) => set('targetUnits', v)} hint={`Variable ${formatINR(res.variablePerUnit)}/unit · fixed ${formatINR(res.fixedCost)}`} />
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label={`Budgeted cost at ${formatNum(toNum(f.targetUnits))} units`}
          value={formatINR(res.target.total)}
          sub={`Fixed ${formatINR(res.fixedCost)} + variable ${formatINR(res.target.variable)} · ${formatINR(res.target.perUnit)}/unit`}
          tone="brand"
        />

        <ResultPanel title="Flexible budget">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[26rem] text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-3">Activity (units)</th>
                  <th className="py-2 px-3 text-right">Fixed</th>
                  <th className="py-2 px-3 text-right">Variable</th>
                  <th className="py-2 px-3 text-right">Total</th>
                  <th className="py-2 pl-3 text-right">Per unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {res.rows.map((r) => {
                  const isTarget = r.units === toNum(f.targetUnits)
                  return (
                    <tr key={r.units} className={isTarget ? 'bg-brand-50/60 dark:bg-brand-500/10' : ''}>
                      <td className="py-2 pr-3 font-semibold text-slate-700">{formatNum(r.units)}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-slate-600">{formatINR(r.fixed)}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-slate-600">{formatINR(r.variable)}</td>
                      <td className="py-2 px-3 text-right font-bold tabular-nums text-brand-700">{formatINR(r.total)}</td>
                      <td className="py-2 pl-3 text-right tabular-nums text-slate-600">{formatINR(r.perUnit)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </ResultPanel>

        <CalcSteps steps={res.steps} />

        <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            The high-low method assumes cost is linear (fixed + variable per unit) across the range. Fixed cost stays
            constant in total at every level, so <strong>cost per unit falls</strong> as activity rises. For a cost given
            as “x% variable”, split it directly instead: variable part = cost × x%, fixed part = the rest.
          </span>
        </div>
      </div>
    </div>
  )
}
