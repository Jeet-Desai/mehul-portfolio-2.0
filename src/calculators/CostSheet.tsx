import { useMemo, useState } from 'react'
import { Plus, Trash2, Info } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel } from '../components/calc/CalcResult'
import { formatINR, formatNum, toNum } from '../lib/format'
import { computeCostSheet, type CostLine, type CostSheetInputs } from '../lib/costSheet'

type LineS = { label: string; amount: string }

const inputBase =
  'rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'
const input = `w-full min-w-0 ${inputBase}`

/* Seeded with M.N. Arora, Illustration 2.2 (Cost Sheet) — a correct, self-checking
   example out of the box: profit ₹14,800 on sales of ₹1,16,000. */
const SEED = {
  openingRM: '0',
  purchases: '57000',
  carriageInward: '0',
  purchaseReturns: '0',
  closingRM: '0',
  directWages: '28500',
  directExpenses: '0',
  openingWIP: '0',
  closingWIP: '0',
  openingFG: '0',
  closingFG: '0',
  sales: '116000',
  unitsProduced: '0',
  factoryOverheads: [
    { label: 'Factory rent and rates', amount: '2500' },
    { label: 'Plant repairs and maintenance', amount: '1000' },
    { label: 'Plant depreciation', amount: '1250' },
    { label: 'Factory heating and lighting', amount: '400' },
    { label: "Factory manager's salary", amount: '2000' },
  ] as LineS[],
  adminOverheads: [
    { label: 'Office salaries', amount: '1600' },
    { label: "Director's remuneration", amount: '1500' },
    { label: 'Telephone and postage', amount: '200' },
    { label: 'Office rent and rates', amount: '500' },
    { label: 'Printing and stationery', amount: '100' },
    { label: 'Legal charges', amount: '150' },
  ] as LineS[],
  sellingOverheads: [
    { label: 'Advertisement', amount: '1500' },
    { label: "Salesmen's salaries", amount: '2500' },
    { label: 'Showroom rent', amount: '500' },
  ] as LineS[],
}

type LineKey = 'factoryOverheads' | 'adminOverheads' | 'sellingOverheads'
type Field = Exclude<keyof typeof SEED, LineKey>

export default function CostSheet() {
  const [f, setF] = useState(SEED)

  const res = useMemo(() => {
    const lines = (xs: LineS[]): CostLine[] => xs.map((l) => ({ label: l.label, amount: toNum(l.amount) }))
    const inp: CostSheetInputs = {
      openingRM: toNum(f.openingRM),
      purchases: toNum(f.purchases),
      carriageInward: toNum(f.carriageInward),
      purchaseReturns: toNum(f.purchaseReturns),
      closingRM: toNum(f.closingRM),
      directWages: toNum(f.directWages),
      directExpenses: toNum(f.directExpenses),
      factoryOverheads: lines(f.factoryOverheads),
      openingWIP: toNum(f.openingWIP),
      closingWIP: toNum(f.closingWIP),
      adminOverheads: lines(f.adminOverheads),
      openingFG: toNum(f.openingFG),
      closingFG: toNum(f.closingFG),
      sellingOverheads: lines(f.sellingOverheads),
      sales: toNum(f.sales),
      unitsProduced: toNum(f.unitsProduced),
    }
    return computeCostSheet(inp)
  }, [f])

  const set = (k: Field, v: string) => setF((s) => ({ ...s, [k]: v }))
  const updLine = (k: LineKey, i: number, patch: Partial<LineS>) =>
    setF((s) => ({ ...s, [k]: s[k].map((r, j) => (j === i ? { ...r, ...patch } : r)) }))
  const addLine = (k: LineKey) => setF((s) => ({ ...s, [k]: [...s[k], { label: '', amount: '' }] }))
  const delLine = (k: LineKey, i: number) => setF((s) => ({ ...s, [k]: s[k].filter((_, j) => j !== i) }))

  const profitable = res.profit >= 0

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* ---------- inputs ---------- */}
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="Direct materials">
          <div className="space-y-3">
            <Two>
              <CalcField label="Opening stock of raw material" prefix="₹" value={f.openingRM} onChange={(v) => set('openingRM', v)} />
              <CalcField label="Purchases" prefix="₹" value={f.purchases} onChange={(v) => set('purchases', v)} />
            </Two>
            <Two>
              <CalcField label="Carriage / freight inward" prefix="₹" value={f.carriageInward} onChange={(v) => set('carriageInward', v)} />
              <CalcField label="Purchase returns" prefix="₹" value={f.purchaseReturns} onChange={(v) => set('purchaseReturns', v)} />
            </Two>
            <CalcField label="Closing stock of raw material" prefix="₹" value={f.closingRM} onChange={(v) => set('closingRM', v)} hint={`Materials consumed = ${formatINR(res.materialsConsumed)}`} />
          </div>
        </ResultPanel>

        <ResultPanel title="Direct labour & expenses">
          <div className="space-y-3">
            <CalcField label="Direct wages" prefix="₹" value={f.directWages} onChange={(v) => set('directWages', v)} />
            <CalcField label="Direct (chargeable) expenses" prefix="₹" value={f.directExpenses} onChange={(v) => set('directExpenses', v)} hint="e.g. hire of special plant, royalties on output" />
          </div>
        </ResultPanel>

        <ResultPanel title="Factory / works overheads">
          <LineList rows={f.factoryOverheads} k="factoryOverheads" upd={updLine} add={addLine} del={delLine} placeholder="e.g. Factory rent" />
          <Two className="mt-3">
            <CalcField label="Opening WIP" prefix="₹" value={f.openingWIP} onChange={(v) => set('openingWIP', v)} />
            <CalcField label="Closing WIP" prefix="₹" value={f.closingWIP} onChange={(v) => set('closingWIP', v)} />
          </Two>
        </ResultPanel>

        <ResultPanel title="Office & administration overheads">
          <LineList rows={f.adminOverheads} k="adminOverheads" upd={updLine} add={addLine} del={delLine} placeholder="e.g. Office salaries" />
          <Two className="mt-3">
            <CalcField label="Opening finished goods" prefix="₹" value={f.openingFG} onChange={(v) => set('openingFG', v)} />
            <CalcField label="Closing finished goods" prefix="₹" value={f.closingFG} onChange={(v) => set('closingFG', v)} />
          </Two>
        </ResultPanel>

        <ResultPanel title="Selling & distribution overheads">
          <LineList rows={f.sellingOverheads} k="sellingOverheads" upd={updLine} add={addLine} del={delLine} placeholder="e.g. Advertisement" />
        </ResultPanel>

        <ResultPanel title="Sales & output">
          <div className="space-y-3">
            <CalcField label="Sales" prefix="₹" value={f.sales} onChange={(v) => set('sales', v)} hint="Profit = Sales − Cost of Sales" />
            <CalcField label="Units produced (optional)" value={f.unitsProduced} onChange={(v) => set('unitsProduced', v)} hint="Set for a per-unit cost column" />
          </div>
        </ResultPanel>
      </div>

      {/* ---------- results ---------- */}
      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label={profitable ? 'Profit' : 'Loss'}
          value={formatINR(Math.abs(res.profit))}
          sub={`${formatNum(res.profitPct)}% of sales · Cost of sales ${formatINR(res.costOfSales)}`}
          tone={profitable ? 'mint' : 'brand'}
        />

        <ResultPanel title="Cost Sheet">
          <div className="divide-y divide-slate-100 text-sm">
            <Row label="Raw materials consumed" value={res.materialsConsumed} />
            <Row label="Direct wages" value={toNum(f.directWages)} />
            {toNum(f.directExpenses) ? <Row label="Direct expenses" value={toNum(f.directExpenses)} /> : null}
            <Row label="Prime Cost" value={res.primeCost} strong accent />

            <Row label="Add: Factory overheads" value={res.factoryOhTotal} indent />
            {toNum(f.openingWIP) || toNum(f.closingWIP) ? (
              <Row label="Adjust work-in-progress (opening − closing)" value={toNum(f.openingWIP) - toNum(f.closingWIP)} indent />
            ) : null}
            <Row label="Works / Factory Cost" value={res.worksCost} strong accent />

            <Row label="Add: Administration overheads" value={res.adminOhTotal} indent />
            <Row label="Cost of Production" value={res.costOfProduction} strong accent />

            {toNum(f.openingFG) || toNum(f.closingFG) ? (
              <Row label="Adjust finished goods (opening − closing)" value={toNum(f.openingFG) - toNum(f.closingFG)} indent />
            ) : null}
            {res.costOfGoodsSold !== res.costOfProduction ? (
              <Row label="Cost of Goods Sold" value={res.costOfGoodsSold} strong />
            ) : null}

            <Row label="Add: Selling & distribution overheads" value={res.sellingOhTotal} indent />
            <Row label="Cost of Sales (Total Cost)" value={res.costOfSales} strong accent />

            <Row label={profitable ? 'Profit' : 'Loss'} value={res.profit} strong />
            <Row label="Sales" value={toNum(f.sales)} strong accent />
          </div>
        </ResultPanel>

        {res.perUnit && (
          <ResultPanel title="Cost per unit">
            <div className="divide-y divide-slate-100 text-sm">
              <Row label="Prime cost per unit" value={res.perUnit.prime} />
              <Row label="Works cost per unit" value={res.perUnit.works} />
              <Row label="Cost of production per unit" value={res.perUnit.production} strong accent />
            </div>
          </ResultPanel>
        )}

        <CalcSteps steps={res.steps} />

        <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Stock is adjusted at the stage where it is valued: raw material before prime cost, work-in-progress at
            works cost, finished goods at cost of production. Purely financial items — interest, income tax, dividends,
            donations, loss on sale of assets — are <strong>excluded</strong> from the cost sheet.
          </span>
        </div>
      </div>
    </div>
  )
}

/* ---------------- helpers ---------------- */

function Two({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex flex-wrap gap-3 [&>*]:min-w-[8rem] [&>*]:flex-1 ${className}`}>{children}</div>
}

function LineList({
  rows, k, upd, add, del, placeholder,
}: {
  rows: LineS[]
  k: LineKey
  upd: (k: LineKey, i: number, patch: Partial<LineS>) => void
  add: (k: LineKey) => void
  del: (k: LineKey, i: number) => void
  placeholder: string
}) {
  return (
    <div className="space-y-2">
      {rows.map((l, i) => (
        <div key={i} className="flex items-center gap-2">
          <input className={input} placeholder={placeholder} value={l.label} onChange={(e) => upd(k, i, { label: e.target.value })} />
          <input className={`${inputBase} w-28 shrink-0`} inputMode="decimal" placeholder="₹" value={l.amount} onChange={(e) => upd(k, i, { amount: e.target.value })} />
          <button onClick={() => del(k, i)} type="button" aria-label="Remove row" className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button onClick={() => add(k)} type="button" className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-brand-300 px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 dark:hover:bg-brand-500/10">
        <Plus className="h-3.5 w-3.5" /> Add row
      </button>
    </div>
  )
}

function Row({ label, value, strong, accent, indent }: { label: string; value: number; strong?: boolean; accent?: boolean; indent?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-2 ${indent ? 'pl-3' : ''}`}>
      <span className={`text-sm ${strong ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{label}</span>
      <span className={`shrink-0 text-sm tabular-nums ${accent ? 'font-extrabold text-brand-700' : strong ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
        {formatINR(value)}
      </span>
    </div>
  )
}
