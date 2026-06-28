import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, formatNum, toNum } from '../lib/format'
import { computeJob, computeEbq, type JobInputs, type EbqInputs } from '../lib/jobBatch'

type Tab = 'job' | 'ebq'

export default function JobBatch() {
  const [tab, setTab] = useState<Tab>('job')
  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:bg-white">
        {([
          ['job', 'Job cost sheet'],
          ['ebq', 'Economic Batch Quantity'],
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
      {tab === 'job' ? <Job /> : <Ebq />}
    </div>
  )
}

/* ------------------------------------------------------------- Job card ---- */

const JOB_SEED = {
  directMaterial: '2500',
  directLabour: '1500',
  directExpenses: '500',
  factoryOhPct: '100',
  adminOhPct: '10',
  profitPct: '25',
}

function Job() {
  const [f, setF] = useState(JOB_SEED)
  const set = (k: keyof typeof JOB_SEED, v: string) => setF((s) => ({ ...s, [k]: v }))

  const res = useMemo(() => {
    const inp: JobInputs = {
      directMaterial: toNum(f.directMaterial),
      directLabour: toNum(f.directLabour),
      directExpenses: toNum(f.directExpenses),
      factoryOhPct: toNum(f.factoryOhPct),
      adminOhPct: toNum(f.adminOhPct),
      profitPct: toNum(f.profitPct),
    }
    return computeJob(inp)
  }, [f])

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Job direct costs">
          <div className="space-y-3">
            <CalcField label="Direct material" prefix="₹" value={f.directMaterial} onChange={(v) => set('directMaterial', v)} />
            <CalcField label="Direct wages" prefix="₹" value={f.directLabour} onChange={(v) => set('directLabour', v)} />
            <CalcField label="Direct expenses" prefix="₹" value={f.directExpenses} onChange={(v) => set('directExpenses', v)} />
          </div>
        </ResultPanel>
        <ResultPanel title="Overhead recovery & profit">
          <div className="space-y-3">
            <CalcField label="Factory overhead (% of wages)" suffix="%" value={f.factoryOhPct} onChange={(v) => set('factoryOhPct', v)} />
            <CalcField label="Administration overhead (% of works cost)" suffix="%" value={f.adminOhPct} onChange={(v) => set('adminOhPct', v)} />
            <CalcField label="Profit (% of total cost)" suffix="%" value={f.profitPct} onChange={(v) => set('profitPct', v)} hint="Cost-plus pricing" />
          </div>
        </ResultPanel>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <HeroResult label="Selling price (quotation)" value={formatINR(res.price)} sub={`Total cost ${formatINR(res.totalCost)} + profit ${formatINR(res.profit)}`} tone="brand" />
        <ResultPanel title="Job cost card">
          <div className="divide-y divide-slate-100">
            <ResultRow label="Prime cost" value={formatINR(res.primeCost)} strong />
            <ResultRow label="Add: factory overhead" value={formatINR(res.factoryOh)} />
            <ResultRow label="Works cost" value={formatINR(res.worksCost)} strong />
            <ResultRow label="Add: administration overhead" value={formatINR(res.adminOh)} />
            <ResultRow label="Total cost" value={formatINR(res.totalCost)} strong />
            <ResultRow label="Add: profit" value={formatINR(res.profit)} />
            <ResultRow label="Selling price" value={formatINR(res.price)} strong />
          </div>
        </ResultPanel>
        <CalcSteps steps={res.steps} />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ EBQ ---- */

const EBQ_SEED = { annualUnits: '12000', setupCost: '150', carryingPerUnit: '0.20' }

function Ebq() {
  const [f, setF] = useState(EBQ_SEED)
  const set = (k: keyof typeof EBQ_SEED, v: string) => setF((s) => ({ ...s, [k]: v }))

  const res = useMemo(() => {
    const inp: EbqInputs = {
      annualUnits: toNum(f.annualUnits),
      setupCost: toNum(f.setupCost),
      carryingPerUnit: toNum(f.carryingPerUnit),
    }
    return computeEbq(inp)
  }, [f])

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Batch data">
          <div className="space-y-3">
            <CalcField label="Annual production / demand (U)" suffix="units" value={f.annualUnits} onChange={(v) => set('annualUnits', v)} />
            <CalcField label="Set-up cost per batch (S)" prefix="₹" value={f.setupCost} onChange={(v) => set('setupCost', v)} />
            <CalcField label="Carrying cost per unit p.a. (C)" prefix="₹" value={f.carryingPerUnit} onChange={(v) => set('carryingPerUnit', v)} />
          </div>
        </ResultPanel>
      </div>
      <div className="space-y-4 lg:col-span-3">
        <HeroResult label="Economic Batch Quantity" value={`${formatNum(res.ebq)} units`} sub={`${formatNum(res.batchesPerYear)} batches a year · total cost ${formatINR(res.totalCost)}`} tone="brand" />
        <ResultPanel title="At the economic batch quantity">
          <div className="divide-y divide-slate-100">
            <ResultRow label="Batches (production runs) per year" value={formatNum(res.batchesPerYear)} />
            <ResultRow label="Total set-up cost" value={formatINR(res.setupCostTotal)} />
            <ResultRow label="Total carrying cost" value={formatINR(res.carryingCostTotal)} />
            <ResultRow label="Total relevant cost" value={formatINR(res.totalCost)} strong />
          </div>
          <p className="mt-3 text-xs text-slate-400">EBQ is the batch-costing twin of EOQ: it balances set-up cost against carrying cost.</p>
        </ResultPanel>
        <CalcSteps steps={res.steps} />
      </div>
    </div>
  )
}
