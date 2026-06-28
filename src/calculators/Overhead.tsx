import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, formatNum, formatPct, toNum } from '../lib/format'
import { computeOverhead, type AbsMethod, type OverheadInputs } from '../lib/overhead'

const inputBase =
  'rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'

const METHODS: { v: AbsMethod; label: string }[] = [
  { v: 'material', label: '% of direct material' },
  { v: 'labour', label: '% of direct labour' },
  { v: 'prime', label: '% of prime cost' },
  { v: 'labourHour', label: 'Labour hour rate' },
  { v: 'machineHour', label: 'Machine hour rate' },
  { v: 'unit', label: 'Rate per unit' },
]

/* Seeded with a consistent dataset (Arora §6.4): overheads ₹40,000 on direct
   material ₹2,00,000 → 20%, on direct labour ₹1,00,000 → 40%; machine-hour rate
   ₹20; actual ₹42,000 vs absorbed ₹40,000 → ₹2,000 under-absorbed. */
const SEED = {
  overheads: '40000',
  directMaterial: '200000',
  directLabour: '100000',
  labourHours: '2500',
  machineHours: '2000',
  units: '1000',
  method: 'machineHour' as AbsMethod,
  actualOverheads: '42000',
  actualBase: '2000',
}

const baseLabel: Record<AbsMethod, string> = {
  material: 'Actual direct material cost (₹)',
  labour: 'Actual direct labour cost (₹)',
  prime: 'Actual prime cost (₹)',
  labourHour: 'Actual labour hours',
  machineHour: 'Actual machine hours',
  unit: 'Actual units produced',
}

export default function Overhead() {
  const [f, setF] = useState(SEED)
  const set = (k: keyof typeof SEED, v: string) => setF((s) => ({ ...s, [k]: v }))

  const res = useMemo(() => {
    const inp: OverheadInputs = {
      overheads: toNum(f.overheads),
      directMaterial: toNum(f.directMaterial),
      directLabour: toNum(f.directLabour),
      labourHours: toNum(f.labourHours),
      machineHours: toNum(f.machineHours),
      units: toNum(f.units),
      method: f.method,
      actualOverheads: toNum(f.actualOverheads),
      actualBase: toNum(f.actualBase),
    }
    return computeOverhead(inp)
  }, [f])

  const under = res.underAbsorbed >= 0
  const rateText = (r: { rate: number; unit: string }) =>
    r.unit === '%' ? formatPct(r.rate) : `${formatINR(r.rate)} ${r.unit.replace('₹', '')}`

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Budgeted overheads & base data">
          <div className="space-y-3">
            <CalcField label="Production overheads (budgeted)" prefix="₹" value={f.overheads} onChange={(v) => set('overheads', v)} />
            <CalcField label="Direct material cost" prefix="₹" value={f.directMaterial} onChange={(v) => set('directMaterial', v)} />
            <CalcField label="Direct labour cost" prefix="₹" value={f.directLabour} onChange={(v) => set('directLabour', v)} hint={`Prime cost = ${formatINR(res.primeCost)}`} />
            <CalcField label="Direct labour hours" value={f.labourHours} onChange={(v) => set('labourHours', v)} />
            <CalcField label="Machine hours" value={f.machineHours} onChange={(v) => set('machineHours', v)} />
            <CalcField label="Units produced" value={f.units} onChange={(v) => set('units', v)} />
          </div>
        </ResultPanel>

        <ResultPanel title="Under- / over-absorption">
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Absorption method</span>
              <select className={`${inputBase} mt-1.5 w-full`} value={f.method} onChange={(e) => set('method', e.target.value as AbsMethod)}>
                {METHODS.map((m) => (
                  <option key={m.v} value={m.v}>{m.label}</option>
                ))}
              </select>
            </label>
            <CalcField label="Actual overheads incurred" prefix="₹" value={f.actualOverheads} onChange={(v) => set('actualOverheads', v)} />
            <CalcField label={baseLabel[f.method]} value={f.actualBase} onChange={(v) => set('actualBase', v)} hint="The actual level of the chosen base in the period" />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label={`Absorption rate — ${res.chosen.name}`}
          value={rateText(res.chosen)}
          sub={`Overhead absorbed ${formatINR(res.absorbed)} · ${under ? 'under' : 'over'}-absorbed ${formatINR(Math.abs(res.underAbsorbed))}`}
          tone={under ? 'brand' : 'mint'}
        />

        <ResultPanel title="Absorption rate by each method">
          <div className="divide-y divide-slate-100">
            {res.rows.map((r) => (
              <ResultRow key={r.key} label={r.name} value={rateText(r)} strong={r.key === f.method} />
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Each rate = budgeted overheads ÷ that base. Pick the base that best reflects what drives the overhead
            (machine-intensive work → machine-hour rate; labour-intensive → labour-hour rate).
          </p>
        </ResultPanel>

        <ResultPanel title="Under- / over-absorption">
          <div className="divide-y divide-slate-100">
            <ResultRow label="Overhead absorbed (rate × actual base)" value={formatINR(res.absorbed)} />
            <ResultRow label="Actual overhead incurred" value={formatINR(toNum(f.actualOverheads))} />
            <ResultRow label={under ? 'Under-absorbed (charge to P&L)' : 'Over-absorbed (credit back)'} value={formatINR(Math.abs(res.underAbsorbed))} strong />
          </div>
        </ResultPanel>

        <CalcSteps steps={res.steps} />

        <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Overheads are absorbed on a <strong>predetermined</strong> rate (budgeted ÷ budgeted). Because the rate is set
            in advance, the absorbed amount rarely equals the actual — the difference is under- or over-absorption,
            cleared to the costing P&L (or, if large and due to normal causes, via a supplementary rate).
          </span>
        </div>
      </div>
    </div>
  )
}
