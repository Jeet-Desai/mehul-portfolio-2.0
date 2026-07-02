import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, formatNum, toNum } from '../lib/format'
import {
  computeEoq,
  computeStockLevels,
  computeTurnover,
  type EoqInputs,
  type StockInputs,
  type TurnoverInputs,
} from '../lib/materialControl'
import { useCalcState } from '../lib/urlState'

type Tab = 'eoq' | 'levels' | 'turnover'

export default function MaterialControl() {
  const [tab, setTab] = useCalcState('tab', 'eoq')

  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap rounded-xl border border-slate-200 bg-slate-50 p-1 dark:bg-white">
        {([
          ['eoq', 'Economic Order Quantity'],
          ['levels', 'Stock levels'],
          ['turnover', 'Inventory turnover'],
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

      {tab === 'eoq' ? <Eoq /> : tab === 'levels' ? <Levels /> : <Turnover />}
    </div>
  )
}

/* --------------------------------------------------------------- EOQ ------- */

const EOQ_SEED = {
  annualDemand: '600',
  orderingCost: '12',
  carryingMode: 'percent' as 'percent' | 'perUnit',
  unitCost: '20',
  carryingPercent: '20',
  carryingPerUnit: '4',
}

function Eoq() {
  const [f, setF] = useState(EOQ_SEED)
  const set = (k: keyof typeof EOQ_SEED, v: string) => setF((s) => ({ ...s, [k]: v }))

  const res = useMemo(() => {
    const inp: EoqInputs = {
      annualDemand: toNum(f.annualDemand),
      orderingCost: toNum(f.orderingCost),
      carryingMode: f.carryingMode,
      carryingPerUnit: toNum(f.carryingPerUnit),
      unitCost: toNum(f.unitCost),
      carryingPercent: toNum(f.carryingPercent),
    }
    return computeEoq(inp)
  }, [f])

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Order & cost data">
          <div className="space-y-3">
            <CalcField label="Annual consumption (A)" suffix="units" value={f.annualDemand} onChange={(v) => set('annualDemand', v)} />
            <CalcField label="Ordering cost per order (O)" prefix="₹" value={f.orderingCost} onChange={(v) => set('orderingCost', v)} hint="Stationery, receiving, inspection, placing the order" />

            <div>
              <span className="text-sm font-semibold text-slate-700">Carrying cost is given as…</span>
              <div className="mt-1.5 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:bg-white">
                {([
                  ['percent', '% of value'],
                  ['perUnit', '₹ per unit'],
                ] as ['percent' | 'perUnit', string][]).map(([v, label]) => (
                  <button key={v} type="button" onClick={() => set('carryingMode', v)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${f.carryingMode === v ? 'bg-brand-600 text-white' : 'text-slate-500'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {f.carryingMode === 'percent' ? (
              <>
                <CalcField label="Cost per unit (C)" prefix="₹" value={f.unitCost} onChange={(v) => set('unitCost', v)} />
                <CalcField label="Carrying cost (% of avg inventory p.a.)" suffix="%" value={f.carryingPercent} onChange={(v) => set('carryingPercent', v)} hint={`= ${formatINR(res.holdingPerUnit)} per unit per year`} />
              </>
            ) : (
              <CalcField label="Carrying cost per unit per annum" prefix="₹" value={f.carryingPerUnit} onChange={(v) => set('carryingPerUnit', v)} />
            )}
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label="Economic Order Quantity"
          value={`${formatNum(res.eoq)} units`}
          sub={`${formatNum(res.ordersPerYear)} orders a year · total relevant cost ${formatINR(res.totalCost)}`}
          tone="brand"
        />
        <ResultPanel title="At the economic order quantity">
          <div className="divide-y divide-slate-100">
            <ResultRow label="Number of orders per year" value={`${formatNum(res.ordersPerYear)}`} />
            <ResultRow label="Annual ordering cost" value={formatINR(res.orderingCostTotal)} />
            <ResultRow label="Annual carrying cost" value={formatINR(res.carryingCostTotal)} />
            <ResultRow label="Total inventory cost" value={formatINR(res.totalCost)} strong />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            At the EOQ the ordering cost and carrying cost are equal — the combined cost is at its minimum.
          </p>
        </ResultPanel>
        <CalcSteps steps={res.steps} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------- Stock levels ------ */

const LEVELS_SEED = {
  minUsage: '50',
  maxUsage: '150',
  normalUsage: '100',
  minLeadTime: '4',
  maxLeadTime: '6',
  reorderQty: '600',
  emergencyLeadTime: '0',
}

function Levels() {
  const [f, setF] = useState(LEVELS_SEED)
  const set = (k: keyof typeof LEVELS_SEED, v: string) => setF((s) => ({ ...s, [k]: v }))

  const res = useMemo(() => {
    const inp: StockInputs = {
      minUsage: toNum(f.minUsage),
      maxUsage: toNum(f.maxUsage),
      normalUsage: toNum(f.normalUsage),
      minLeadTime: toNum(f.minLeadTime),
      maxLeadTime: toNum(f.maxLeadTime),
      reorderQty: toNum(f.reorderQty),
      emergencyLeadTime: toNum(f.emergencyLeadTime),
    }
    return computeStockLevels(inp)
  }, [f])

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Usage per period">
          <div className="space-y-3">
            <CalcField label="Minimum usage" suffix="units" value={f.minUsage} onChange={(v) => set('minUsage', v)} />
            <CalcField label="Normal usage" suffix="units" value={f.normalUsage} onChange={(v) => set('normalUsage', v)} />
            <CalcField label="Maximum usage" suffix="units" value={f.maxUsage} onChange={(v) => set('maxUsage', v)} />
          </div>
        </ResultPanel>
        <ResultPanel title="Lead time & re-order quantity">
          <div className="space-y-3">
            <CalcField label="Minimum lead time" suffix="periods" value={f.minLeadTime} onChange={(v) => set('minLeadTime', v)} />
            <CalcField label="Maximum lead time" suffix="periods" value={f.maxLeadTime} onChange={(v) => set('maxLeadTime', v)} hint={`Average lead time = ${formatNum(res.avgLeadTime)}`} />
            <CalcField label="Re-order quantity (EOQ)" suffix="units" value={f.reorderQty} onChange={(v) => set('reorderQty', v)} />
            <CalcField label="Emergency lead time (optional)" suffix="periods" value={f.emergencyLeadTime} onChange={(v) => set('emergencyLeadTime', v)} hint="For the danger level; leave 0 to hide" />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label="Re-order level"
          value={`${formatNum(res.reorderLevel)} units`}
          sub="Raise a fresh purchase requisition when stock falls to this level"
          tone="brand"
        />
        <ResultPanel title="Stock levels">
          <div className="divide-y divide-slate-100">
            <ResultRow label="Re-order level" value={`${formatNum(res.reorderLevel)} units`} strong />
            <ResultRow label="Maximum level" value={`${formatNum(res.maximumLevel)} units`} />
            <ResultRow label="Minimum level (safety stock)" value={`${formatNum(res.minimumLevel)} units`} />
            <ResultRow label="Average stock level" value={`${formatNum(res.averageLevel)} units`} />
            {toNum(f.emergencyLeadTime) > 0 && (
              <ResultRow label="Danger level" value={`${formatNum(res.dangerLevel)} units`} />
            )}
          </div>
        </ResultPanel>
        <CalcSteps steps={res.steps} />
        <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Lead time and usage must be in the <strong>same period units</strong> (e.g. weeks). “Maximum” uses fastest
            consumption × longest delay; “minimum” keeps a buffer for normal consumption over the average delay.
          </span>
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------- Inventory turnover -- */

const TURNOVER_SEED = {
  basis: 'material' as 'material' | 'cogs',
  flowMode: 'direct' as 'direct' | 'purchases',
  opening: '80000',
  closing: '120000',
  flowDirect: '1200000',
  purchases: '1240000',
  periodDays: '365',
}

function Turnover() {
  const [f, setF] = useState(TURNOVER_SEED)
  const set = (k: keyof typeof TURNOVER_SEED, v: string) => setF((s) => ({ ...s, [k]: v }))

  const res = useMemo(() => {
    const inp: TurnoverInputs = {
      basis: f.basis,
      flowMode: f.flowMode,
      opening: toNum(f.opening),
      closing: toNum(f.closing),
      flowDirect: toNum(f.flowDirect),
      purchases: toNum(f.purchases),
      periodDays: toNum(f.periodDays),
    }
    return computeTurnover(inp)
  }, [f])

  const flowLabel = f.basis === 'material' ? 'Cost of materials consumed' : 'Cost of goods sold'
  const ratioLabel = f.basis === 'material' ? 'Raw-material turnover ratio' : 'Inventory turnover ratio'

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Stock & cost flow">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-semibold text-slate-700">What is being turned over?</span>
              <div className="mt-1.5 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:bg-white">
                {([
                  ['material', 'Raw material'],
                  ['cogs', 'Finished goods'],
                ] as ['material' | 'cogs', string][]).map(([v, label]) => (
                  <button key={v} type="button" onClick={() => set('basis', v)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${f.basis === v ? 'bg-brand-600 text-white' : 'text-slate-500'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <CalcField label="Opening stock" prefix="₹" value={f.opening} onChange={(v) => set('opening', v)} />
            <CalcField label="Closing stock" prefix="₹" value={f.closing} onChange={(v) => set('closing', v)} hint={`Average stock = ${formatINR(res.averageStock)}`} />

            <div>
              <span className="text-sm font-semibold text-slate-700">{flowLabel} is…</span>
              <div className="mt-1.5 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:bg-white">
                {([
                  ['direct', 'Given directly'],
                  ['purchases', 'From purchases'],
                ] as ['direct' | 'purchases', string][]).map(([v, label]) => (
                  <button key={v} type="button" onClick={() => set('flowMode', v)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${f.flowMode === v ? 'bg-brand-600 text-white' : 'text-slate-500'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {f.flowMode === 'direct' ? (
              <CalcField label={flowLabel} prefix="₹" value={f.flowDirect} onChange={(v) => set('flowDirect', v)} />
            ) : (
              <CalcField label="Purchases during the period" prefix="₹" value={f.purchases} onChange={(v) => set('purchases', v)} hint={`Consumed = opening + purchases − closing = ${formatINR(res.flow)}`} />
            )}

            <CalcField label="Days in the period" value={f.periodDays} onChange={(v) => set('periodDays', v)} hint="365 for a year (use 12 for months, 52 for weeks)" />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label={ratioLabel}
          value={`${formatNum(res.turnover)} times`}
          sub={`Average stock is consumed about ${formatNum(res.turnover)} times — held ~${formatNum(res.holdingDays)} days on average`}
          tone="brand"
        />
        <ResultPanel title="Turnover & holding period">
          <div className="divide-y divide-slate-100">
            <ResultRow label={flowLabel} value={formatINR(res.flow)} />
            <ResultRow label="Average stock" value={formatINR(res.averageStock)} />
            <ResultRow label={ratioLabel} value={`${formatNum(res.turnover)} times`} strong />
            <ResultRow label="Inventory holding period" value={`${formatNum(res.holdingDays)} days`} />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            A higher ratio = faster-moving stock and less capital locked up; a low ratio flags slow-moving, dormant or
            obsolete stock. Read it against the firm’s trend and the industry — a very high ratio can mean stock-out risk.
          </p>
        </ResultPanel>
        <CalcSteps steps={res.steps} />
        <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Always use a <strong>cost</strong> flow (materials consumed or cost of goods sold), never sales — mixing a
            selling-price numerator with a cost denominator overstates the ratio.
          </span>
        </div>
      </div>
    </div>
  )
}
