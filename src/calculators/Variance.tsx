import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel } from '../components/calc/CalcResult'
import { formatINR, toNum } from '../lib/format'
import {
  computeMaterialVariance,
  computeLabourVariance,
  tag,
  type Variance as V,
  type MaterialInputs,
  type LabourInputs,
} from '../lib/variance'

type Tab = 'material' | 'labour'

export default function Variance() {
  const [tabv, setTab] = useState<Tab>('material')
  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:bg-white">
        {([
          ['material', 'Material variances'],
          ['labour', 'Labour variances'],
        ] as [Tab, string][]).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => setTab(v)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              tabv === v ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tabv === 'material' ? <Material /> : <Labour />}
    </div>
  )
}

function VarRow({ x, strong }: { x: V; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className={`text-sm ${strong ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{x.name}</span>
      <span className={`shrink-0 text-sm font-bold tabular-nums ${x.favourable ? 'text-mint-600' : 'text-rose-500'}`}>{tag(x)}</span>
    </div>
  )
}

/* ---------------------------------------------------------- Material ------- */

const MAT_SEED = { sq: '4000', sp: '5', aq: '4300', ap: '4.80' }

function Material() {
  const [f, setF] = useState(MAT_SEED)
  const set = (k: keyof typeof MAT_SEED, v: string) => setF((s) => ({ ...s, [k]: v }))
  const res = useMemo(() => {
    const inp: MaterialInputs = { sq: toNum(f.sq), sp: toNum(f.sp), aq: toNum(f.aq), ap: toNum(f.ap) }
    return computeMaterialVariance(inp)
  }, [f])

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Standard (for actual output)">
          <div className="space-y-3">
            <CalcField label="Standard quantity (SQ)" value={f.sq} onChange={(v) => set('sq', v)} />
            <CalcField label="Standard price (SP)" prefix="₹" value={f.sp} onChange={(v) => set('sp', v)} />
          </div>
        </ResultPanel>
        <ResultPanel title="Actual">
          <div className="space-y-3">
            <CalcField label="Actual quantity (AQ)" value={f.aq} onChange={(v) => set('aq', v)} />
            <CalcField label="Actual price (AP)" prefix="₹" value={f.ap} onChange={(v) => set('ap', v)} />
          </div>
        </ResultPanel>
      </div>
      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label="Material cost variance"
          value={tag(res.costVariance)}
          sub={`Standard cost ${formatINR(res.standardCost)} vs actual ${formatINR(res.actualCost)}`}
          tone={res.costVariance.favourable ? 'mint' : 'sun'}
        />
        <ResultPanel title="Variances">
          <div className="divide-y divide-slate-100">
            <VarRow x={res.priceVariance} />
            <VarRow x={res.usageVariance} />
            <VarRow x={res.costVariance} strong />
          </div>
          <p className="mt-3 text-xs text-slate-400">(F) favourable = saves cost · (A) adverse = costs more. Price + usage = cost variance.</p>
        </ResultPanel>
        <CalcSteps steps={res.steps} />
        <Note />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ Labour ------- */

const LAB_SEED = { sh: '2000', sr: '10', ah: '2100', ar: '9.50' }

function Labour() {
  const [f, setF] = useState(LAB_SEED)
  const set = (k: keyof typeof LAB_SEED, v: string) => setF((s) => ({ ...s, [k]: v }))
  const res = useMemo(() => {
    const inp: LabourInputs = { sh: toNum(f.sh), sr: toNum(f.sr), ah: toNum(f.ah), ar: toNum(f.ar) }
    return computeLabourVariance(inp)
  }, [f])

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Standard (for actual output)">
          <div className="space-y-3">
            <CalcField label="Standard hours (SH)" value={f.sh} onChange={(v) => set('sh', v)} />
            <CalcField label="Standard rate (SR)" prefix="₹" value={f.sr} onChange={(v) => set('sr', v)} />
          </div>
        </ResultPanel>
        <ResultPanel title="Actual">
          <div className="space-y-3">
            <CalcField label="Actual hours (AH)" value={f.ah} onChange={(v) => set('ah', v)} />
            <CalcField label="Actual rate (AR)" prefix="₹" value={f.ar} onChange={(v) => set('ar', v)} />
          </div>
        </ResultPanel>
      </div>
      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label="Labour cost variance"
          value={tag(res.costVariance)}
          sub={`Standard cost ${formatINR(res.standardCost)} vs actual ${formatINR(res.actualCost)}`}
          tone={res.costVariance.favourable ? 'mint' : 'sun'}
        />
        <ResultPanel title="Variances">
          <div className="divide-y divide-slate-100">
            <VarRow x={res.rateVariance} />
            <VarRow x={res.efficiencyVariance} />
            <VarRow x={res.costVariance} strong />
          </div>
          <p className="mt-3 text-xs text-slate-400">(F) favourable = saves cost · (A) adverse = costs more. Rate + efficiency = cost variance.</p>
        </ResultPanel>
        <CalcSteps steps={res.steps} />
        <Note />
      </div>
    </div>
  )
}

function Note() {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        A variance compares the <strong>standard cost of the actual output</strong> with the actual cost. The price/rate
        variance isolates the effect of paying more or less; the usage/efficiency variance isolates using more or less.
        Together they always reconcile to the total cost variance.
      </span>
    </div>
  )
}
