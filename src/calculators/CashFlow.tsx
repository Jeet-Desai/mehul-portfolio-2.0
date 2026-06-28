import { useMemo, useState, type ReactNode } from 'react'
import { Plus, Trash2, Info, CheckCircle2, AlertTriangle } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import LedgerWorkings from '../components/calc/LedgerWorkings'
import { HeroResult, ResultPanel } from '../components/calc/CalcResult'
import { formatINR, toNum } from '../lib/format'
import {
  computeCashFlow,
  type CashFlowInputs,
  type CFLine,
  type WCItem,
  type FlowItem,
} from '../lib/cashFlow'

/* String-backed editable rows (parsed with toNum on compute). */
type LineS = { label: string; amount: string }
type WCS = { label: string; kind: 'asset' | 'liability'; opening: string; closing: string }
type FlowS = { label: string; amount: string; direction: 'in' | 'out' }

const inputBase =
  'rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'
const input = `w-full min-w-0 ${inputBase}`

/* Seeded with the worked example from the cash-flow resource topic
   (net cash from operating activities = ₹95,000). */
const SEED = {
  netProfitBeforeTax: '100000',
  taxPaid: '25000',
  openingCash: '40000',
  closingCashActual: '',
  addBacks: [
    { label: 'Depreciation', amount: '20000' },
    { label: 'Loss on sale of machinery', amount: '5000' },
  ] as LineS[],
  deductions: [{ label: 'Profit on sale of investments', amount: '10000' }] as LineS[],
  workingCapital: [
    { label: 'Debtors', kind: 'asset', opening: '60000', closing: '75000' },
    { label: 'Stock', kind: 'asset', opening: '50000', closing: '38000' },
    { label: 'Creditors', kind: 'liability', opening: '30000', closing: '38000' },
  ] as WCS[],
  investing: [
    { label: 'Purchase of machinery', amount: '80000', direction: 'out' },
    { label: 'Sale of investments', amount: '30000', direction: 'in' },
    { label: 'Dividend received', amount: '5000', direction: 'in' },
  ] as FlowS[],
  financing: [
    { label: 'Issue of share capital', amount: '100000', direction: 'in' },
    { label: 'Dividend paid', amount: '20000', direction: 'out' },
    { label: 'Long-term loan repaid', amount: '15000', direction: 'out' },
  ] as FlowS[],
}

export default function CashFlow() {
  const [f, setF] = useState(SEED)

  const res = useMemo(() => {
    const inp: CashFlowInputs = {
      netProfitBeforeTax: toNum(f.netProfitBeforeTax),
      taxPaid: toNum(f.taxPaid),
      openingCash: toNum(f.openingCash),
      closingCashActual: f.closingCashActual.trim() === '' ? undefined : toNum(f.closingCashActual),
      addBacks: f.addBacks.map((l): CFLine => ({ label: l.label, amount: toNum(l.amount) })),
      deductions: f.deductions.map((l): CFLine => ({ label: l.label, amount: toNum(l.amount) })),
      workingCapital: f.workingCapital.map(
        (w): WCItem => ({ label: w.label, kind: w.kind, opening: toNum(w.opening), closing: toNum(w.closing) }),
      ),
      investing: f.investing.map((x): FlowItem => ({ label: x.label, amount: toNum(x.amount), direction: x.direction })),
      financing: f.financing.map((x): FlowItem => ({ label: x.label, amount: toNum(x.amount), direction: x.direction })),
    }
    return computeCashFlow(inp)
  }, [f])

  /* ---- generic list helpers ---- */
  const updLine = (key: 'addBacks' | 'deductions', i: number, patch: Partial<LineS>) =>
    setF((s) => ({ ...s, [key]: s[key].map((r, j) => (j === i ? { ...r, ...patch } : r)) }))
  const addLine = (key: 'addBacks' | 'deductions') =>
    setF((s) => ({ ...s, [key]: [...s[key], { label: '', amount: '' }] }))
  const delLine = (key: 'addBacks' | 'deductions', i: number) =>
    setF((s) => ({ ...s, [key]: s[key].filter((_, j) => j !== i) }))

  const updWC = (i: number, patch: Partial<WCS>) =>
    setF((s) => ({ ...s, workingCapital: s.workingCapital.map((r, j) => (j === i ? { ...r, ...patch } : r)) }))
  const updFlow = (key: 'investing' | 'financing', i: number, patch: Partial<FlowS>) =>
    setF((s) => ({ ...s, [key]: s[key].map((r, j) => (j === i ? { ...r, ...patch } : r)) }))
  const addFlow = (key: 'investing' | 'financing') =>
    setF((s) => ({ ...s, [key]: [...s[key], { label: '', amount: '', direction: 'out' }] }))
  const delFlow = (key: 'investing' | 'financing', i: number) =>
    setF((s) => ({ ...s, [key]: s[key].filter((_, j) => j !== i) }))

  const recon = res.reconDiff
  const ties = recon !== null && Math.abs(recon) < 0.5

  return (
    <div className="space-y-6">
    <div className="grid gap-6 lg:grid-cols-5">
      {/* ---------- inputs ---------- */}
      <div className="space-y-4 lg:col-span-2">
        <ResultPanel title="A · Operating — starting point">
          <div className="space-y-3">
            <CalcField
              label="Net profit before tax"
              prefix="₹"
              value={f.netProfitBeforeTax}
              onChange={(v) => setF((s) => ({ ...s, netProfitBeforeTax: v }))}
              hint="After adding back tax provision, proposed dividend & transfers to reserves"
            />

            <Section
              title="Add back: non-cash & non-operating charges"
              onAdd={() => addLine('addBacks')}
            >
              {f.addBacks.map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input className={input} placeholder="e.g. Depreciation" value={l.label} onChange={(e) => updLine('addBacks', i, { label: e.target.value })} />
                  <input className={`${inputBase} w-28 shrink-0`} inputMode="decimal" placeholder="₹" value={l.amount} onChange={(e) => updLine('addBacks', i, { amount: e.target.value })} />
                  <Del onClick={() => delLine('addBacks', i)} />
                </div>
              ))}
            </Section>

            <Section title="Less: non-operating income" onAdd={() => addLine('deductions')}>
              {f.deductions.map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input className={input} placeholder="e.g. Interest income" value={l.label} onChange={(e) => updLine('deductions', i, { label: e.target.value })} />
                  <input className={`${inputBase} w-28 shrink-0`} inputMode="decimal" placeholder="₹" value={l.amount} onChange={(e) => updLine('deductions', i, { amount: e.target.value })} />
                  <Del onClick={() => delLine('deductions', i)} />
                </div>
              ))}
            </Section>
          </div>
        </ResultPanel>

        <ResultPanel title="Working-capital changes">
          <p className="-mt-2 mb-3 text-xs text-slate-400">
            Enter each current asset / liability at the opening and closing dates.
          </p>
          <div className="space-y-2.5">
            {f.workingCapital.map((w, i) => (
              <div key={i} className="rounded-xl border border-slate-100 p-2.5">
                <div className="flex items-center gap-2">
                  <input className={input} placeholder="e.g. Debtors" value={w.label} onChange={(e) => updWC(i, { label: e.target.value })} />
                  <select className={`${inputBase} w-36 shrink-0`} value={w.kind} onChange={(e) => updWC(i, { kind: e.target.value as WCS['kind'] })}>
                    <option value="asset">Current asset</option>
                    <option value="liability">Current liability</option>
                  </select>
                  <Del onClick={() => setF((s) => ({ ...s, workingCapital: s.workingCapital.filter((_, j) => j !== i) }))} />
                </div>
                <div className="mt-2 flex gap-2">
                  <label className="flex-1">
                    <span className="text-[11px] font-medium text-slate-400">Opening</span>
                    <input className={`${input} mt-0.5`} inputMode="decimal" value={w.opening} onChange={(e) => updWC(i, { opening: e.target.value })} />
                  </label>
                  <label className="flex-1">
                    <span className="text-[11px] font-medium text-slate-400">Closing</span>
                    <input className={`${input} mt-0.5`} inputMode="decimal" value={w.closing} onChange={(e) => updWC(i, { closing: e.target.value })} />
                  </label>
                </div>
              </div>
            ))}
            <AddBtn onClick={() => setF((s) => ({ ...s, workingCapital: [...s.workingCapital, { label: '', kind: 'asset', opening: '', closing: '' }] }))} />
          </div>
          <div className="mt-3">
            <CalcField label="Tax paid during the year" prefix="₹" value={f.taxPaid} onChange={(v) => setF((s) => ({ ...s, taxPaid: v }))} />
          </div>
        </ResultPanel>

        <FlowEditor title="B · Investing activities" rows={f.investing} onAdd={() => addFlow('investing')} onDel={(i) => delFlow('investing', i)} onUpd={(i, p) => updFlow('investing', i, p)} />
        <FlowEditor title="C · Financing activities" rows={f.financing} onAdd={() => addFlow('financing')} onDel={(i) => delFlow('financing', i)} onUpd={(i, p) => updFlow('financing', i, p)} />

        <ResultPanel title="Cash & equivalents">
          <div className="space-y-3">
            <CalcField label="Opening cash & cash equivalents" prefix="₹" value={f.openingCash} onChange={(v) => setF((s) => ({ ...s, openingCash: v }))} />
            <CalcField label="Closing cash per balance sheet (optional)" prefix="₹" value={f.closingCashActual} onChange={(v) => setF((s) => ({ ...s, closingCashActual: v }))} hint="Enter to cross-check that the statement ties" />
          </div>
        </ResultPanel>
      </div>

      {/* ---------- results ---------- */}
      <div className="space-y-4 lg:col-span-3">
        <HeroResult
          label="Net cash from operating activities (A)"
          value={formatINR(res.operatingCF)}
          sub={`Net ${res.netChange >= 0 ? 'increase' : 'decrease'} in cash for the year: ${formatINR(Math.abs(res.netChange))}`}
        />

        <ResultPanel title="Cash Flow Statement (indirect method)">
          <div className="divide-y divide-slate-100 text-sm">
            <Sec heading="A · Cash flow from operating activities" />
            <Row label="Net profit before tax" value={toNum(f.netProfitBeforeTax)} />
            {res.addBackTotal > 0 && <Sub label="Add: non-cash & non-operating charges" />}
            {f.addBacks.map((l, i) => toNum(l.amount) ? <Row key={i} label={l.label || 'Add-back'} value={toNum(l.amount)} indent /> : null)}
            {f.deductions.map((l, i) => toNum(l.amount) ? <Row key={i} label={`Less: ${l.label || 'non-operating income'}`} value={-toNum(l.amount)} indent /> : null)}
            <Row label="Operating profit before working-capital changes" value={res.opBeforeWC} strong />
            {res.wcRows.map((r, i) => r.effect !== 0 ? <Row key={i} label={`${r.effect >= 0 ? 'Add' : 'Less'}: ${r.delta >= 0 ? 'increase' : 'decrease'} in ${r.label}`} value={r.effect} indent /> : null)}
            <Row label="Cash generated from operations" value={res.cashBeforeTax} />
            <Row label="Less: tax paid" value={-toNum(f.taxPaid)} indent />
            <Row label="Net cash from operating activities (A)" value={res.operatingCF} strong accent />

            <Sec heading="B · Cash flow from investing activities" />
            {f.investing.map((x, i) => toNum(x.amount) ? <Row key={i} label={x.label || 'Investing item'} value={x.direction === 'in' ? toNum(x.amount) : -toNum(x.amount)} indent /> : null)}
            <Row label="Net cash from investing activities (B)" value={res.investingCF} strong accent />

            <Sec heading="C · Cash flow from financing activities" />
            {f.financing.map((x, i) => toNum(x.amount) ? <Row key={i} label={x.label || 'Financing item'} value={x.direction === 'in' ? toNum(x.amount) : -toNum(x.amount)} indent /> : null)}
            <Row label="Net cash from financing activities (C)" value={res.financingCF} strong accent />

            <Sec heading="Reconciliation" />
            <Row label="Net increase / (decrease) in cash (A + B + C)" value={res.netChange} strong />
            <Row label="Add: opening cash & cash equivalents" value={toNum(f.openingCash)} indent />
            <Row label="Closing cash & cash equivalents" value={res.closingCash} strong accent />
          </div>

          {recon !== null && (
            <div className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm ${ties ? 'bg-mint-50 text-mint-600 dark:bg-mint-500/10' : 'bg-rose-50 text-rose-500 dark:bg-rose-500/10'}`}>
              {ties ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
              <span>
                {ties
                  ? 'Ties to the closing cash per the balance sheet — the statement balances.'
                  : `Does not tie: computed closing cash differs from the balance sheet by ${formatINR(Math.abs(recon))}. Re-check an item's classification or amount.`}
              </span>
            </div>
          )}
        </ResultPanel>

        <CalcSteps steps={res.steps} />

        <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            For a non-financial company under AS 3, interest & dividend <em>paid</em> are usually shown under
            financing and interest & dividend <em>received</em> under investing — be consistent and state your
            assumption. Show purchases and sales of fixed assets gross (do not net them).
          </span>
        </div>
      </div>
    </div>

      <LedgerWorkings subtitle="Optional. Derive a hidden figure from an adjustment (tax paid, asset purchased/sold, depreciation provision) by balancing a T-account — then carry the balancing figure into the statement above." />
    </div>
  )
}

/* ---------------- small presentational helpers ---------------- */

function Section({ title, onAdd, children }: { title: string; onAdd: () => void; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <div className="space-y-2">{children}</div>
      <AddBtn onClick={onAdd} />
    </div>
  )
}

function FlowEditor({
  title, rows, onAdd, onDel, onUpd,
}: {
  title: string
  rows: FlowS[]
  onAdd: () => void
  onDel: (i: number) => void
  onUpd: (i: number, patch: Partial<FlowS>) => void
}) {
  return (
    <ResultPanel title={title}>
      <div className="space-y-2">
        {rows.map((x, i) => (
          <div key={i} className="flex items-center gap-2">
            <input className={input} placeholder="e.g. Purchase of machinery" value={x.label} onChange={(e) => onUpd(i, { label: e.target.value })} />
            <select className={`${inputBase} w-20 shrink-0 px-1.5`} value={x.direction} onChange={(e) => onUpd(i, { direction: e.target.value as FlowS['direction'] })}>
              <option value="in">In</option>
              <option value="out">Out</option>
            </select>
            <input className={`${inputBase} w-24 shrink-0`} inputMode="decimal" placeholder="₹" value={x.amount} onChange={(e) => onUpd(i, { amount: e.target.value })} />
            <Del onClick={() => onDel(i)} />
          </div>
        ))}
        <AddBtn onClick={onAdd} />
      </div>
    </ResultPanel>
  )
}

function AddBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} type="button" className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-brand-300 px-2.5 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 dark:hover:bg-brand-500/10">
      <Plus className="h-3.5 w-3.5" /> Add row
    </button>
  )
}

function Del({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} type="button" aria-label="Remove row" className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10">
      <Trash2 className="h-4 w-4" />
    </button>
  )
}

function Sec({ heading }: { heading: string }) {
  return <p className="pt-3 pb-1 text-xs font-bold uppercase tracking-wide text-brand-600">{heading}</p>
}
function Sub({ label }: { label: string }) {
  return <p className="pt-1.5 text-xs font-semibold text-slate-500">{label}</p>
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
