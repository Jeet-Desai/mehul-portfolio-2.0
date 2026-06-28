import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, formatNum, formatPct, toNum } from '../lib/format'
import {
  computeWages,
  computeTurnover,
  type WageInputs,
  type TurnoverInputs,
} from '../lib/wages'

type Tab = 'incentive' | 'turnover'

export default function Wages() {
  const [tab, setTab] = useState<Tab>('incentive')

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:bg-white">
        {([
          ['incentive', 'Incentive earnings'],
          ['turnover', 'Labour turnover'],
        ] as [Tab, string][]).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => setTab(v)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tab === v ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'incentive' ? <Incentive /> : <Turnover />}
    </div>
  )
}

/* ---------------------------------------------------- Incentive earnings --- */

const WAGE_SEED = { standardTime: '50', actualTime: '42', rate: '3', units: '0' }

function Incentive() {
  const [f, setF] = useState(WAGE_SEED)
  const set = (k: keyof typeof WAGE_SEED, v: string) => setF((s) => ({ ...s, [k]: v }))

  const res = useMemo(() => {
    const inp: WageInputs = {
      standardTime: toNum(f.standardTime),
      actualTime: toNum(f.actualTime),
      rate: toNum(f.rate),
      units: toNum(f.units),
    }
    return computeWages(inp)
  }, [f])

  const efficiency = toNum(f.actualTime) > 0 ? (toNum(f.standardTime) / toNum(f.actualTime)) * 100 : 0

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Job & rate">
          <div className="space-y-3">
            <CalcField label="Standard (allowed) time" suffix="hours" value={f.standardTime} onChange={(v) => set('standardTime', v)} />
            <CalcField label="Actual time taken" suffix="hours" value={f.actualTime} onChange={(v) => set('actualTime', v)} hint={`Time saved = ${formatNum(res.timeSaved)} h · efficiency ${formatPct(efficiency)}`} />
            <CalcField label="Time rate per hour" prefix="₹" value={f.rate} onChange={(v) => set('rate', v)} />
            <CalcField label="Units produced (optional)" value={f.units} onChange={(v) => set('units', v)} hint="Set for labour cost per unit" />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label="Time wages (guaranteed)"
          value={formatINR(res.timeWages)}
          sub={`Time saved ${formatNum(res.timeSaved)} h — bonus is added on top under each scheme`}
          tone="brand"
        />

        <ResultPanel title="Earnings under each wage system">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[26rem] text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-3">System</th>
                  <th className="py-2 px-3 text-right">Bonus</th>
                  <th className="py-2 px-3 text-right">Earnings</th>
                  <th className="py-2 pl-3 text-right">Per hour</th>
                  {res.plans[0].perUnit !== null && <th className="py-2 pl-3 text-right">Per unit</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {res.plans.map((p) => (
                  <tr key={p.key}>
                    <td className="py-2 pr-3 font-semibold text-slate-700">{p.name}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-slate-600">{formatINR(p.bonus)}</td>
                    <td className="py-2 px-3 text-right font-bold tabular-nums text-brand-700">{formatINR(p.earnings)}</td>
                    <td className="py-2 pl-3 text-right tabular-nums text-slate-600">{formatINR(p.perHour)}</td>
                    {p.perUnit !== null && <td className="py-2 pl-3 text-right tabular-nums text-slate-600">{formatINR(p.perUnit)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-400">{res.plans.find((p) => p.key === 'rowan')!.note}</p>
        </ResultPanel>

        <CalcSteps steps={res.steps} />

        <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Both Halsey and Rowan <strong>guarantee time wages</strong> and share the gain of time saved with the
            employer. Halsey pays a higher bonus once more than half the time is saved; Rowan pays more when less than
            half is saved, and can never let the bonus exceed the time wages — a safeguard against loosely-set standards.
          </span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------- Labour turnover --- */

const TURNOVER_SEED = {
  opening: '900',
  closing: '1100',
  separations: '50',
  replacements: '25',
  newForExpansion: '125',
}

function Turnover() {
  const [f, setF] = useState(TURNOVER_SEED)
  const set = (k: keyof typeof TURNOVER_SEED, v: string) => setF((s) => ({ ...s, [k]: v }))

  const res = useMemo(() => {
    const inp: TurnoverInputs = {
      opening: toNum(f.opening),
      closing: toNum(f.closing),
      separations: toNum(f.separations),
      replacements: toNum(f.replacements),
      newForExpansion: toNum(f.newForExpansion),
    }
    return computeTurnover(inp)
  }, [f])

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Workforce movement">
          <div className="space-y-3">
            <CalcField label="Workers at the beginning" value={f.opening} onChange={(v) => set('opening', v)} />
            <CalcField label="Workers at the end" value={f.closing} onChange={(v) => set('closing', v)} hint={`Average workers = ${formatNum(res.avgWorkers)}`} />
            <CalcField label="Separations (left + discharged)" value={f.separations} onChange={(v) => set('separations', v)} />
            <CalcField label="Replacements (filling vacancies)" value={f.replacements} onChange={(v) => set('replacements', v)} />
            <CalcField label="New hires for expansion" value={f.newForExpansion} onChange={(v) => set('newForExpansion', v)} hint="Excluded from separation/replacement/flux rates" />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label="Flux rate (overall turnover)"
          value={formatPct(res.fluxRate)}
          sub={`Separation ${formatPct(res.separationRate)} · Replacement ${formatPct(res.replacementRate)}`}
          tone="brand"
        />
        <ResultPanel title="Labour turnover rates">
          <div className="divide-y divide-slate-100">
            <ResultRow label="Separation method" value={formatPct(res.separationRate)} />
            <ResultRow label="Replacement method" value={formatPct(res.replacementRate)} />
            <ResultRow label="Flux method (separations + replacements)" value={formatPct(res.fluxRate)} strong />
            <ResultRow label="Accessions (replacements + expansion)" value={`${formatNum(res.accessions)} workers`} />
            <ResultRow label="Accession rate" value={formatPct(res.accessionRate)} />
          </div>
        </ResultPanel>
        <CalcSteps steps={res.steps} />
        <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Workers engaged for an <strong>expansion</strong> programme are excluded from the separation, replacement
            and flux rates — they do not replace anyone. They are captured only in the accession figures. Use one method
            consistently for period-to-period comparison.
          </span>
        </div>
      </div>
    </div>
  )
}
