import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel } from '../components/calc/CalcResult'
import { formatINR, formatNum, toNum } from '../lib/format'
import {
  computeMaterialVariance,
  computeLabourVariance,
  computeOverheadVariance,
  tag,
  type Variance as V,
  type MaterialInputs,
  type LabourInputs,
  type OverheadInputs,
} from '../lib/variance'
import { useCalcState } from '../lib/urlState'

type Tab = 'material' | 'labour' | 'overhead'

export default function Variance() {
  const [tabv, setTab] = useCalcState('tab', 'material')
  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap rounded-xl border border-slate-200 bg-slate-50 p-1 dark:bg-white">
        {([
          ['material', 'Material variances'],
          ['labour', 'Labour variances'],
          ['overhead', 'Overhead variances'],
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
      {tabv === 'material' ? <Material /> : tabv === 'labour' ? <Labour /> : <Overhead />}
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

/* ---------------------------------------------------------- Overhead ------- */

const OH_SEED = {
  budgetedOutput: '20000',
  budgetedHours: '5000',
  budgetedVarOH: '5000',
  budgetedFixedOH: '10000',
  budgetedDays: '25',
  actualOutput: '19000',
  actualHours: '4500',
  actualVarOH: '4800',
  actualFixedOH: '10500',
  actualDays: '25',
}

function Overhead() {
  const [f, setF] = useState(OH_SEED)
  const [calendarStr, setCalendarStr] = useCalcState('cal', '0')
  const calendar = calendarStr === '1'
  const setCalendar = (v: boolean) => setCalendarStr(v ? '1' : '0')
  const set = (k: keyof typeof OH_SEED, v: string) => setF((s) => ({ ...s, [k]: v }))

  const res = useMemo(() => {
    const inp: OverheadInputs = {
      budgetedOutput: toNum(f.budgetedOutput),
      budgetedHours: toNum(f.budgetedHours),
      budgetedVarOH: toNum(f.budgetedVarOH),
      budgetedFixedOH: toNum(f.budgetedFixedOH),
      budgetedDays: toNum(f.budgetedDays),
      actualOutput: toNum(f.actualOutput),
      actualHours: toNum(f.actualHours),
      actualVarOH: toNum(f.actualVarOH),
      actualFixedOH: toNum(f.actualFixedOH),
      actualDays: toNum(f.actualDays),
      separateCalendar: calendar,
    }
    return computeOverheadVariance(inp)
  }, [f, calendar])

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Budget">
          <div className="space-y-3">
            <CalcField label="Budgeted output (units)" value={f.budgetedOutput} onChange={(v) => set('budgetedOutput', v)} />
            <CalcField label="Budgeted hours" value={f.budgetedHours} onChange={(v) => set('budgetedHours', v)} hint={`Std rate: variable ${formatINR(res.stdVarRate)}/hr · fixed ${formatINR(res.stdFixedRatePerHour)}/hr`} />
            <CalcField label="Budgeted variable OH" prefix="₹" value={f.budgetedVarOH} onChange={(v) => set('budgetedVarOH', v)} />
            <CalcField label="Budgeted fixed OH" prefix="₹" value={f.budgetedFixedOH} onChange={(v) => set('budgetedFixedOH', v)} />
            {calendar && (
              <CalcField label="Budgeted working days" value={f.budgetedDays} onChange={(v) => set('budgetedDays', v)} />
            )}
          </div>
        </ResultPanel>
        <ResultPanel title="Actual">
          <div className="space-y-3">
            <CalcField label="Actual output (units)" value={f.actualOutput} onChange={(v) => set('actualOutput', v)} hint={`Standard hours for actual output = ${formatNum(res.shao)}`} />
            <CalcField label="Actual hours" value={f.actualHours} onChange={(v) => set('actualHours', v)} />
            <CalcField label="Actual variable OH" prefix="₹" value={f.actualVarOH} onChange={(v) => set('actualVarOH', v)} />
            <CalcField label="Actual fixed OH" prefix="₹" value={f.actualFixedOH} onChange={(v) => set('actualFixedOH', v)} />
            {calendar && (
              <CalcField label="Actual working days" value={f.actualDays} onChange={(v) => set('actualDays', v)} />
            )}
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-600">
            <input type="checkbox" checked={calendar} onChange={(e) => setCalendar(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
            Separate the calendar variance (when working days differ)
          </label>
        </ResultPanel>
      </div>
      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label="Total overhead cost variance"
          value={tag(res.totalCost)}
          sub={`Absorbed ${formatINR(res.varAbsorbed + res.fixedAbsorbed)} vs actual ${formatINR(toNum(f.actualVarOH) + toNum(f.actualFixedOH))}`}
          tone={res.totalCost.favourable ? 'mint' : 'sun'}
        />
        <ResultPanel title="Variable overhead">
          <div className="divide-y divide-slate-100">
            <VarRow x={res.vohExpenditure} />
            <VarRow x={res.vohEfficiency} />
            <VarRow x={res.vohCost} strong />
          </div>
          <p className="mt-3 text-xs text-slate-400">Expenditure + efficiency = variable OH cost variance.</p>
        </ResultPanel>
        <ResultPanel title="Fixed overhead">
          <div className="divide-y divide-slate-100">
            <VarRow x={res.fohExpenditure} />
            {res.fohCalendar && <VarRow x={res.fohCalendar} />}
            <VarRow x={res.fohCapacity} />
            <VarRow x={res.fohEffVariance} />
            <VarRow x={res.fohVolume} />
            <VarRow x={res.fohCost} strong />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Expenditure + volume = fixed OH cost variance · {res.fohCalendar ? 'calendar + capacity + efficiency' : 'capacity + efficiency'} = volume variance.
          </p>
        </ResultPanel>
        <CalcSteps steps={res.steps} />
        <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Every variance = <strong>absorbed/budgeted − actual</strong>; positive = favourable. Variable OH has no volume
            variance (it flexes with activity). The default split follows M.N. Arora’s Illustration 13.3.
          </span>
        </div>
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
