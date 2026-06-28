import { useMemo, useState } from 'react'
import { Plus, Trash2, Info, AlertTriangle } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { HeroResult, ResultPanel } from '../components/calc/CalcResult'
import { formatINR, toNum } from '../lib/format'
import { computeCashBudget, type BudgetRow, type CashBudgetInputs } from '../lib/cashBudget'

type RowS = { label: string; values: string[] }

const inputBase =
  'rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'

/* Seeded with a clean 3-month budget: opening ₹10,000; closings ₹15,000 / ₹25,000 / ₹40,000. */
const SEED = {
  months: ['January', 'February', 'March'],
  openingBalance: '10000',
  receipts: [{ label: 'Cash collections', values: ['50000', '60000', '70000'] }] as RowS[],
  payments: [
    { label: 'Purchases', values: ['30000', '35000', '40000'] },
    { label: 'Wages', values: ['10000', '10000', '10000'] },
    { label: 'Expenses', values: ['5000', '5000', '5000'] },
  ] as RowS[],
}

type Section = 'receipts' | 'payments'

export default function CashBudget() {
  const [f, setF] = useState(SEED)
  const n = f.months.length

  const res = useMemo(() => {
    const rows = (xs: RowS[]): BudgetRow[] => xs.map((r) => ({ label: r.label, values: r.values.map(toNum) }))
    const inp: CashBudgetInputs = {
      months: f.months,
      openingBalance: toNum(f.openingBalance),
      receipts: rows(f.receipts),
      payments: rows(f.payments),
    }
    return computeCashBudget(inp)
  }, [f])

  const setCell = (sec: Section, ri: number, ci: number, v: string) =>
    setF((s) => ({ ...s, [sec]: s[sec].map((r, j) => (j === ri ? { ...r, values: r.values.map((x, k) => (k === ci ? v : x)) } : r)) }))
  const setLabel = (sec: Section, ri: number, v: string) =>
    setF((s) => ({ ...s, [sec]: s[sec].map((r, j) => (j === ri ? { ...r, label: v } : r)) }))
  const addRow = (sec: Section) =>
    setF((s) => ({ ...s, [sec]: [...s[sec], { label: '', values: Array(n).fill('') }] }))
  const delRow = (sec: Section, ri: number) =>
    setF((s) => ({ ...s, [sec]: s[sec].filter((_, j) => j !== ri) }))
  const setMonth = (i: number, v: string) =>
    setF((s) => ({ ...s, months: s.months.map((m, j) => (j === i ? v : m)) }))
  const addMonth = () =>
    setF((s) => ({
      ...s,
      months: [...s.months, `Month ${s.months.length + 1}`],
      receipts: s.receipts.map((r) => ({ ...r, values: [...r.values, ''] })),
      payments: s.payments.map((r) => ({ ...r, values: [...r.values, ''] })),
    }))

  const overdraft = res.minClosing < 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-48">
          <CalcField label="Opening cash balance" prefix="₹" value={f.openingBalance} onChange={(v) => setF((s) => ({ ...s, openingBalance: v }))} />
        </div>
        <button onClick={addMonth} type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-brand-300 px-2.5 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 dark:hover:bg-brand-500/10">
          <Plus className="h-3.5 w-3.5" /> Add month
        </button>
      </div>

      <HeroResult
        label={`Closing balance — ${res.columns[n - 1]?.month ?? 'last month'}`}
        value={formatINR(res.columns[n - 1]?.closing ?? 0)}
        sub={overdraft ? `Lowest balance ${formatINR(res.minClosing)} — overdraft needed` : `Lowest balance ${formatINR(res.minClosing)} — stays positive`}
        tone={overdraft ? 'sun' : 'mint'}
      />

      <ResultPanel title="Cash Budget">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-3 text-left">Particulars</th>
                {f.months.map((m, i) => (
                  <th key={i} className="px-2 py-2 text-right">
                    <input className={`${inputBase} w-24 text-right`} value={m} onChange={(e) => setMonth(i, e.target.value)} />
                  </th>
                ))}
                <th className="w-7" />
              </tr>
            </thead>
            <tbody>
              <SecHead title="Receipts" span={n} />
              {f.receipts.map((r, ri) => (
                <EditRow key={ri} row={r} onLabel={(v) => setLabel('receipts', ri, v)} onCell={(ci, v) => setCell('receipts', ri, ci, v)} onDel={() => delRow('receipts', ri)} placeholder="e.g. Cash collections" />
              ))}
              <AddRowBtn onClick={() => addRow('receipts')} span={n} />
              <TotalRow label="Total receipts" values={res.receiptTotals} />

              <SecHead title="Payments" span={n} />
              {f.payments.map((r, ri) => (
                <EditRow key={ri} row={r} onLabel={(v) => setLabel('payments', ri, v)} onCell={(ci, v) => setCell('payments', ri, ci, v)} onDel={() => delRow('payments', ri)} placeholder="e.g. Purchases" />
              ))}
              <AddRowBtn onClick={() => addRow('payments')} span={n} />
              <TotalRow label="Total payments" values={res.paymentTotals} />

              <tr className="border-t-2 border-slate-200">
                <td className="py-1.5 pr-3 font-semibold text-slate-600">Opening balance</td>
                {res.columns.map((c, i) => <Amt key={i} v={c.opening} />)}
                <td />
              </tr>
              <tr className="border-t-2 border-brand-200 bg-brand-50/60 dark:bg-brand-500/10">
                <td className="py-2 pr-3 font-bold text-slate-900">Closing balance</td>
                {res.columns.map((c, i) => (
                  <td key={i} className={`px-2 py-2 text-right font-extrabold tabular-nums ${c.closing < 0 ? 'text-rose-500' : 'text-brand-700'}`}>{formatINR(c.closing)}</td>
                ))}
                <td />
              </tr>
            </tbody>
          </table>
        </div>
        {overdraft && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-500/10">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>A closing balance falls below zero — the business must arrange an overdraft or defer a payment that month.</span>
          </div>
        )}
      </ResultPanel>

      <CalcSteps steps={res.steps} />

      <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          A cash budget records only <strong>actual cash</strong> receipts and payments — never depreciation or other
          non-cash items. Each month’s closing balance becomes the next month’s opening balance, so the running balance
          flags exactly when finance will be tight.
        </span>
      </div>
    </div>
  )
}

function SecHead({ title, span }: { title: string; span: number }) {
  return (
    <tr>
      <td colSpan={span + 2} className="pt-3 pb-1 text-xs font-bold uppercase tracking-wide text-brand-600">{title}</td>
    </tr>
  )
}

function EditRow({ row, onLabel, onCell, onDel, placeholder }: { row: RowS; onLabel: (v: string) => void; onCell: (ci: number, v: string) => void; onDel: () => void; placeholder: string }) {
  return (
    <tr className="border-t border-slate-100">
      <td className="py-1 pr-3">
        <input className={`${inputBase} w-40`} placeholder={placeholder} value={row.label} onChange={(e) => onLabel(e.target.value)} />
      </td>
      {row.values.map((v, ci) => (
        <td key={ci} className="px-1 py-1">
          <input className={`${inputBase} w-24 text-right`} inputMode="decimal" placeholder="₹" value={v} onChange={(e) => onCell(ci, e.target.value)} />
        </td>
      ))}
      <td className="py-1">
        <button onClick={onDel} type="button" aria-label="Remove row" className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10">
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}

function AddRowBtn({ onClick, span }: { onClick: () => void; span: number }) {
  return (
    <tr>
      <td colSpan={span + 2} className="py-1">
        <button onClick={onClick} type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-brand-300 px-2.5 py-1 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 dark:hover:bg-brand-500/10">
          <Plus className="h-3.5 w-3.5" /> Add row
        </button>
      </td>
    </tr>
  )
}

function TotalRow({ label, values }: { label: string; values: number[] }) {
  return (
    <tr className="border-t border-slate-200 font-semibold">
      <td className="py-1.5 pr-3 text-slate-700">{label}</td>
      {values.map((v, i) => <Amt key={i} v={v} strong />)}
      <td />
    </tr>
  )
}

function Amt({ v, strong }: { v: number; strong?: boolean }) {
  return <td className={`px-2 py-1.5 text-right tabular-nums ${strong ? 'font-semibold text-slate-700' : 'text-slate-600'}`}>{formatINR(v)}</td>
}
