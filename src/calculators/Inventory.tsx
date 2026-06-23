import { useMemo, useState } from 'react'
import { Plus, Trash2, ArrowDownToLine, ArrowUpFromLine, AlertTriangle } from 'lucide-react'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel, ResultRow } from '../components/calc/CalcResult'
import { formatINR, formatNum, toNum } from '../lib/format'
import { valuate, valuateAll, type Method, type Txn } from '../lib/inventory'
import type { Step } from './types'

const METHODS: { v: Method; label: string; short: string }[] = [
  { v: 'fifo', label: 'FIFO', short: 'First-in, first-out' },
  { v: 'lifo', label: 'LIFO', short: 'Last-in, first-out' },
  { v: 'wavg', label: 'Weighted avg', short: 'Perpetual average' },
]

type Row = { id: string; label: string; kind: 'in' | 'out'; qty: string; rate: string }

const seed: Row[] = [
  { id: 'a', label: 'Opening / Purchase', kind: 'in', qty: '100', rate: '10' },
  { id: 'b', label: 'Purchase', kind: 'in', qty: '200', rate: '12' },
  { id: 'c', label: 'Issue', kind: 'out', qty: '150', rate: '' },
  { id: 'd', label: 'Purchase', kind: 'in', qty: '100', rate: '14' },
  { id: 'e', label: 'Issue', kind: 'out', qty: '180', rate: '' },
]

let nextId = 0
const mkId = () => `r${nextId++}`

export default function Inventory() {
  const [rows, setRows] = useState<Row[]>(seed)
  const [method, setMethod] = useState<Method>('fifo')

  const setRow = (id: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const addRow = (kind: 'in' | 'out') =>
    setRows((rs) => [...rs, { id: mkId(), label: kind === 'in' ? 'Purchase' : 'Issue', kind, qty: '', rate: '' }])
  const removeRow = (id: string) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs))

  const txns: Txn[] = useMemo(
    () =>
      rows
        .filter((r) => toNum(r.qty) > 0)
        .map((r) => ({ id: r.id, label: r.label || (r.kind === 'in' ? 'Purchase' : 'Issue'), kind: r.kind, qty: toNum(r.qty), rate: toNum(r.rate) })),
    [rows],
  )

  const result = useMemo(() => valuate(txns, method), [txns, method])
  const all = useMemo(() => valuateAll(txns), [txns])

  const steps: Step[] = [
    {
      label: `Method → ${METHODS.find((mm) => mm.v === method)!.label}`,
      formula:
        method === 'fifo'
          ? 'Issues are costed from the oldest stock first; the balance is the newest.'
          : method === 'lifo'
            ? 'Issues are costed from the newest stock first; the balance is the oldest.'
            : 'A new weighted-average rate is struck after every receipt; issues leave at that average.',
      result: METHODS.find((mm) => mm.v === method)!.short,
    },
    {
      label: 'Cost of goods issued (sold) = total value of all issues',
      formula: 'Σ issue values from the store ledger',
      result: formatINR(result.cogs),
    },
    {
      label: 'Closing stock = receipts − issues (by value)',
      formula: `${formatINR(result.totalReceiptsValue)} − ${formatINR(result.cogs)}`,
      result: formatINR(result.closingValue),
      note: `${formatNum(result.closingQty, 2)} units in hand.`,
    },
  ]

  const valid = result.valid && txns.length > 0

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <ResultPanel title="Transactions">
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 p-2.5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRow(r.id, { kind: r.kind === 'in' ? 'out' : 'in' })}
                    className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition ${
                      r.kind === 'in' ? 'bg-mint-100 text-mint-700' : 'bg-sun-100 text-sun-700'
                    }`}
                    title="Toggle receipt / issue"
                  >
                    {r.kind === 'in' ? <ArrowDownToLine className="h-3.5 w-3.5" /> : <ArrowUpFromLine className="h-3.5 w-3.5" />}
                    {r.kind === 'in' ? 'Receipt' : 'Issue'}
                  </button>
                  <input
                    value={r.label}
                    onChange={(e) => setRow(r.id, { label: e.target.value })}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:border-brand-400"
                  />
                  <button
                    onClick={() => removeRow(r.id)}
                    disabled={rows.length <= 1}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-30"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2">
                    <span className="text-xs text-slate-400">Qty</span>
                    <input
                      inputMode="decimal"
                      value={r.qty}
                      onChange={(e) => setRow(r.id, { qty: e.target.value })}
                      className="w-full bg-transparent py-1.5 text-sm outline-none"
                    />
                  </label>
                  <label className={`flex items-center gap-1.5 rounded-lg px-2 ${r.kind === 'in' ? 'bg-slate-50' : 'bg-slate-100/60'}`}>
                    <span className="text-xs text-slate-400">₹/unit</span>
                    <input
                      inputMode="decimal"
                      value={r.kind === 'in' ? r.rate : ''}
                      onChange={(e) => setRow(r.id, { rate: e.target.value })}
                      disabled={r.kind === 'out'}
                      placeholder={r.kind === 'out' ? 'auto' : ''}
                      className="w-full bg-transparent py-1.5 text-sm outline-none disabled:cursor-not-allowed"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => addRow('in')}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-mint-300 px-3 py-2 text-sm font-semibold text-mint-700 transition hover:bg-mint-50"
            >
              <Plus className="h-4 w-4" /> Receipt
            </button>
            <button
              onClick={() => addRow('out')}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dashed border-sun-300 px-3 py-2 text-sm font-semibold text-sun-700 transition hover:bg-sun-50"
            >
              <Plus className="h-4 w-4" /> Issue
            </button>
          </div>
        </ResultPanel>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
          <span>
            Perpetual valuation (re-computed on each transaction). Note: LIFO is not permitted under AS-2 / Ind
            AS 2 for financial statements in India — it is shown here only for comparison.
          </span>
        </div>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <div>
          <div className="mb-3 grid grid-cols-3 gap-1.5">
            {METHODS.map((mm) => (
              <button
                key={mm.v}
                onClick={() => setMethod(mm.v)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  method === mm.v ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mm.label}
              </button>
            ))}
          </div>

          {!valid && result.error && (
            <div className="mb-3 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-600">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{result.error}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <HeroResult label="Closing stock value" value={formatINR(result.closingValue)} sub={`${formatNum(result.closingQty, 2)} units`} />
            <HeroResult label="Cost of goods issued" value={formatINR(result.cogs)} sub="value of all issues" tone="sun" />
          </div>
        </div>

        <ResultPanel title="Store ledger card">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left uppercase tracking-wide text-slate-400">
                  <th className="py-1 pr-2 font-semibold" rowSpan={2}>
                    Particulars
                  </th>
                  <th className="border-b border-mint-100 px-2 pb-1 text-center font-semibold text-mint-600" colSpan={3}>
                    Receipts
                  </th>
                  <th className="border-b border-sun-100 px-2 pb-1 text-center font-semibold text-sun-600" colSpan={3}>
                    Issues
                  </th>
                  <th className="border-b border-brand-100 px-2 pb-1 text-center font-semibold text-brand-600" colSpan={2}>
                    Balance
                  </th>
                </tr>
                <tr className="border-b border-slate-200 text-right text-[10px] uppercase tracking-wide text-slate-400">
                  <th className="px-1.5 py-1 font-semibold">Qty</th>
                  <th className="px-1.5 py-1 font-semibold">Rate</th>
                  <th className="px-1.5 py-1 font-semibold">Value</th>
                  <th className="px-1.5 py-1 font-semibold">Qty</th>
                  <th className="px-1.5 py-1 font-semibold">Rate</th>
                  <th className="px-1.5 py-1 font-semibold">Value</th>
                  <th className="px-1.5 py-1 font-semibold">Qty</th>
                  <th className="px-1.5 py-1 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-1.5 pr-2 text-slate-600">{row.label}</td>
                    <td className="px-1.5 py-1.5 text-right text-slate-500">{row.inQty ? formatNum(row.inQty, 2) : ''}</td>
                    <td className="px-1.5 py-1.5 text-right text-slate-500">{row.inQty ? formatNum(row.inRate, 2) : ''}</td>
                    <td className="px-1.5 py-1.5 text-right text-mint-600">{row.inQty ? formatNum(row.inValue, 2) : ''}</td>
                    <td className="px-1.5 py-1.5 text-right text-slate-500">{row.outQty ? formatNum(row.outQty, 2) : ''}</td>
                    <td className="px-1.5 py-1.5 text-right text-slate-500">{row.outQty ? formatNum(row.outRate, 2) : ''}</td>
                    <td className="px-1.5 py-1.5 text-right text-sun-600">{row.outQty ? formatNum(row.outValue, 2) : ''}</td>
                    <td className="px-1.5 py-1.5 text-right text-slate-600">{formatNum(row.balQty, 2)}</td>
                    <td className="px-1.5 py-1.5 text-right font-semibold text-slate-700">{formatNum(row.balValue, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {method !== 'wavg' && result.rows.length > 0 && result.rows[result.rows.length - 1].balLayers.length > 0 && (
            <p className="mt-2 text-xs text-slate-400">
              Closing balance comprises:{' '}
              {result.rows[result.rows.length - 1].balLayers
                .map((l) => `${formatNum(l.qty, 2)} @ ${formatINR(l.rate)}`)
                .join(' + ')}
              .
            </p>
          )}
        </ResultPanel>

        <ResultPanel title="Method comparison">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left uppercase tracking-wide text-slate-400">
                  <th className="py-1.5 pr-2 text-xs font-semibold">Method</th>
                  <th className="py-1.5 px-2 text-right text-xs font-semibold">Closing stock</th>
                  <th className="py-1.5 pl-2 text-right text-xs font-semibold">Cost of goods issued</th>
                </tr>
              </thead>
              <tbody>
                {METHODS.map((mm) => (
                  <tr key={mm.v} className={`border-b border-slate-50 ${method === mm.v ? 'bg-brand-50/50 dark:bg-brand-500/10' : ''}`}>
                    <td className="py-2 pr-2 font-semibold text-slate-700">{mm.label}</td>
                    <td className="py-2 px-2 text-right text-slate-700">{formatINR(all[mm.v].closingValue)}</td>
                    <td className="py-2 pl-2 text-right text-slate-700">{formatINR(all[mm.v].cogs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            When prices rise, FIFO reports the highest closing stock (and lowest cost of issues); LIFO the
            opposite; weighted average sits between the two.
          </p>
        </ResultPanel>

        <ResultPanel title="Summary">
          <ResultRow label="Total receipts (value)" value={formatINR(result.totalReceiptsValue)} />
          <ResultRow label="Cost of goods issued" value={formatINR(result.cogs)} />
          <div className="my-1 border-t border-slate-100" />
          <ResultRow label="Closing stock value" value={formatINR(result.closingValue)} strong />
        </ResultPanel>

        <CalcSteps steps={steps} />
      </div>
    </div>
  )
}
