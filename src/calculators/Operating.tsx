import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, formatNum, toNum } from '../lib/format'
import { computeOperating, type CompositeUnit, type OperatingInputs } from '../lib/operating'

const inputBase =
  'rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'

/* Seeded: standing ₹9,000 + running ₹8,000 + maintenance ₹3,000 = ₹20,000 over
   10,000 km, average load 5 tonnes → cost ₹2/km, ₹0.40/tonne-km. */
const SEED = {
  standingCharges: '9000',
  runningCharges: '8000',
  maintenanceCharges: '3000',
  distanceKm: '10000',
  averageLoad: '5',
  compositeUnit: 'tonneKm' as CompositeUnit,
  profitPct: '20',
}

export default function Operating() {
  const [f, setF] = useState(SEED)
  const set = (k: keyof typeof SEED, v: string) => setF((s) => ({ ...s, [k]: v }))

  const res = useMemo(() => {
    const inp: OperatingInputs = {
      standingCharges: toNum(f.standingCharges),
      runningCharges: toNum(f.runningCharges),
      maintenanceCharges: toNum(f.maintenanceCharges),
      distanceKm: toNum(f.distanceKm),
      averageLoad: toNum(f.averageLoad),
      compositeUnit: f.compositeUnit,
      profitPct: toNum(f.profitPct),
    }
    return computeOperating(inp)
  }, [f])

  const loadLabel = f.compositeUnit === 'tonneKm' ? 'Average load (tonnes)' : 'Average passengers'

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Operating costs (per period)">
          <div className="space-y-3">
            <CalcField label="Standing (fixed) charges" prefix="₹" value={f.standingCharges} onChange={(v) => set('standingCharges', v)} hint="Insurance, road tax, garage, salaries" />
            <CalcField label="Running (variable) charges" prefix="₹" value={f.runningCharges} onChange={(v) => set('runningCharges', v)} hint="Fuel, oil, tyres" />
            <CalcField label="Maintenance charges" prefix="₹" value={f.maintenanceCharges} onChange={(v) => set('maintenanceCharges', v)} />
          </div>
        </ResultPanel>
        <ResultPanel title="Service output">
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Composite cost unit</span>
              <select className={`${inputBase} mt-1.5 w-full`} value={f.compositeUnit} onChange={(e) => set('compositeUnit', e.target.value as CompositeUnit)}>
                <option value="tonneKm">Tonne-km (goods)</option>
                <option value="passengerKm">Passenger-km</option>
              </select>
            </label>
            <CalcField label="Total distance run (km)" value={f.distanceKm} onChange={(v) => set('distanceKm', v)} />
            <CalcField label={loadLabel} value={f.averageLoad} onChange={(v) => set('averageLoad', v)} hint={`${res.unitLabel}: ${formatNum(res.compositeUnits)}`} />
            <CalcField label="Profit (% of cost)" suffix="%" value={f.profitPct} onChange={(v) => set('profitPct', v)} />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label={`Cost per ${res.unitLabel}`}
          value={formatINR(res.costPerComposite)}
          sub={`Cost per km ${formatINR(res.costPerKm)} · rate to charge ${formatINR(res.ratePerComposite)} per ${res.unitLabel}`}
          tone="brand"
        />
        <ResultPanel title="Operating cost sheet">
          <div className="divide-y divide-slate-100">
            <ResultRow label="Total operating cost" value={formatINR(res.totalCost)} strong />
            <ResultRow label="Distance run" value={`${formatNum(toNum(f.distanceKm))} km`} />
            <ResultRow label="Cost per km" value={formatINR(res.costPerKm)} />
            <ResultRow label={`Total ${res.unitLabel}`} value={formatNum(res.compositeUnits)} />
            <ResultRow label={`Cost per ${res.unitLabel}`} value={formatINR(res.costPerComposite)} strong />
            <ResultRow label={`Rate to charge (+${formatNum(toNum(f.profitPct))}%)`} value={formatINR(res.ratePerComposite)} />
          </div>
        </ResultPanel>
        <CalcSteps steps={res.steps} />
        <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Operating costing suits service undertakings (transport, hospitals, hotels, power). The composite unit rolls
            two factors into one — a <strong>tonne-km</strong> is 1 tonne carried 1 km. Standing charges are fixed; running
            charges vary with distance; maintenance is semi-variable.
          </span>
        </div>
      </div>
    </div>
  )
}
