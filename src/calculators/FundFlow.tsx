import { useMemo, useState, type ReactNode } from 'react'
import { Plus, Trash2, Info, CheckCircle2, AlertTriangle } from 'lucide-react'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import LedgerWorkings from '../components/calc/LedgerWorkings'
import { HeroResult, ResultPanel } from '../components/calc/CalcResult'
import { formatINR, toNum } from '../lib/format'
import { computeFundFlow, type FundFlowInputs, type WCItem, type FFLine } from '../lib/fundFlow'

type LineS = { label: string; amount: string }
type WCS = { label: string; kind: 'asset' | 'liability'; opening: string; closing: string }

const inputBase =
  'rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'
const input = `w-full min-w-0 ${inputBase}`

/* Seeded so sources − applications (+₹10,000) ties to the schedule of changes in
   working capital (+₹10,000) — a correct, self-checking example out of the box. */
const SEED = {
  netProfit: '60000',
  workingCapital: [
    { label: 'Stock', kind: 'asset', opening: '50000', closing: '70000' },
    { label: 'Debtors', kind: 'asset', opening: '40000', closing: '50000' },
    { label: 'Cash', kind: 'asset', opening: '10000', closing: '5000' },
    { label: 'Creditors', kind: 'liability', opening: '30000', closing: '45000' },
  ] as WCS[],
  addBacks: [
    { label: 'Depreciation', amount: '20000' },
    { label: 'Proposed dividend', amount: '15000' },
    { label: 'Provision for tax', amount: '10000' },
  ] as LineS[],
  deductions: [{ label: 'Profit on sale of investments', amount: '5000' }] as LineS[],
  otherSources: [
    { label: 'Issue of share capital', amount: '50000' },
    { label: 'Sale of machinery', amount: '20000' },
  ] as LineS[],
  applications: [
    { label: 'Purchase of building', amount: '100000' },
    { label: 'Repayment of long-term loan', amount: '30000' },
    { label: 'Dividend paid', amount: '15000' },
    { label: 'Tax paid', amount: '15000' },
  ] as LineS[],
}

type LineKey = 'addBacks' | 'deductions' | 'otherSources' | 'applications'

export default function FundFlow() {
  const [f, setF] = useState(SEED)

  const res = useMemo(() => {
    const lines = (xs: LineS[]): FFLine[] => xs.map((l) => ({ label: l.label, amount: toNum(l.amount) }))
    const inp: FundFlowInputs = {
      netProfit: toNum(f.netProfit),
      workingCapital: f.workingCapital.map(
        (w): WCItem => ({ label: w.label, kind: w.kind, opening: toNum(w.opening), closing: toNum(w.closing) }),
      ),
      addBacks: lines(f.addBacks),
      deductions: lines(f.deductions),
      otherSources: lines(f.otherSources),
      applications: lines(f.applications),
    }
    return computeFundFlow(inp)
  }, [f])

  const updLine = (key: LineKey, i: number, patch: Partial<LineS>) =>
    setF((s) => ({ ...s, [key]: s[key].map((r, j) => (j === i ? { ...r, ...patch } : r)) }))
  const addLine = (key: LineKey) => setF((s) => ({ ...s, [key]: [...s[key], { label: '', amount: '' }] }))
  const delLine = (key: LineKey, i: number) => setF((s) => ({ ...s, [key]: s[key].filter((_, j) => j !== i) }))

  const updWC = (i: number, patch: Partial<WCS>) =>
    setF((s) => ({ ...s, workingCapital: s.workingCapital.map((r, j) => (j === i ? { ...r, ...patch } : r)) }))

  const inc = res.wcIncrease >= 0

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* ---------- inputs ---------- */}
        <div className="space-y-4 lg:col-span-2">
          <ResultPanel title="Current assets & liabilities (both dates)">
            <p className="-mt-2 mb-3 text-xs text-slate-400">For the schedule of changes in working capital.</p>
            <div className="space-y-2.5">
              {f.workingCapital.map((w, i) => (
                <div key={i} className="rounded-xl border border-slate-100 p-2.5">
                  <div className="flex items-center gap-2">
                    <input className={input} placeholder="e.g. Stock" value={w.label} onChange={(e) => updWC(i, { label: e.target.value })} />
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
          </ResultPanel>

          <ResultPanel title="Funds from operations">
            <div className="space-y-3">
              <CalcField label="Net profit for the year" prefix="₹" value={f.netProfit} onChange={(v) => setF((s) => ({ ...s, netProfit: v }))} hint="Closing P&L balance − opening (before the adjustments below)" />
              <Group title="Add back: non-fund & non-operating charges">
                <LineList rows={f.addBacks} k="addBacks" upd={updLine} add={addLine} del={delLine} placeholder="e.g. Depreciation" />
              </Group>
              <Group title="Less: non-operating income">
                <LineList rows={f.deductions} k="deductions" upd={updLine} add={addLine} del={delLine} placeholder="e.g. Profit on sale" />
              </Group>
            </div>
          </ResultPanel>

          <ResultPanel title="Sources (other than operations)">
            <LineList rows={f.otherSources} k="otherSources" upd={updLine} add={addLine} del={delLine} placeholder="e.g. Issue of shares" />
          </ResultPanel>

          <ResultPanel title="Applications of funds">
            <LineList rows={f.applications} k="applications" upd={updLine} add={addLine} del={delLine} placeholder="e.g. Purchase of fixed assets" />
          </ResultPanel>
        </div>

        {/* ---------- results ---------- */}
        <div className="space-y-4 lg:col-span-3">
          <HeroResult
            label={`Net ${inc ? 'increase' : 'decrease'} in working capital`}
            value={formatINR(Math.abs(res.wcIncrease))}
            sub={res.ties ? 'Sources vs applications ties with the schedule ✓' : 'Cross-check does not tie — review an item'}
            tone={res.ties ? 'mint' : 'brand'}
          />

          <ResultPanel title="Schedule of Changes in Working Capital">
            <div className="divide-y divide-slate-100 text-sm">
              <div className="flex items-center justify-between gap-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <span>Item</span><span>Effect on working capital</span>
              </div>
              {res.wcRows.map((r, i) => (
                <Row key={i} label={`${r.label} (${r.kind === 'asset' ? 'CA' : 'CL'}, ${r.delta >= 0 ? '+' : '−'}${formatINR(Math.abs(r.delta))})`} value={r.effect} />
              ))}
              <Row label={`Net ${inc ? 'increase' : 'decrease'} in working capital`} value={res.wcIncrease} strong accent />
            </div>
          </ResultPanel>

          <ResultPanel title="Funds from Operations">
            <div className="divide-y divide-slate-100 text-sm">
              <Row label="Net profit for the year" value={toNum(f.netProfit)} />
              {f.addBacks.map((l, i) => toNum(l.amount) ? <Row key={i} label={`Add: ${l.label || 'charge'}`} value={toNum(l.amount)} indent /> : null)}
              {f.deductions.map((l, i) => toNum(l.amount) ? <Row key={i} label={`Less: ${l.label || 'income'}`} value={-toNum(l.amount)} indent /> : null)}
              <Row label="Funds from operations" value={res.ffo} strong accent />
            </div>
          </ResultPanel>

          <ResultPanel title="Fund Flow Statement">
            <div className="divide-y divide-slate-100 text-sm">
              <Sec heading="Sources of funds" />
              <Row label="Funds from operations" value={res.ffo} indent />
              {f.otherSources.map((l, i) => toNum(l.amount) ? <Row key={i} label={l.label || 'Source'} value={toNum(l.amount)} indent /> : null)}
              <Row label="Total sources" value={res.totalSources} strong />

              <Sec heading="Applications of funds" />
              {f.applications.map((l, i) => toNum(l.amount) ? <Row key={i} label={l.label || 'Application'} value={toNum(l.amount)} indent /> : null)}
              <Row label="Total applications" value={res.totalApplications} strong />

              <Row label={`Net ${inc ? 'increase' : 'decrease'} in working capital (Sources − Applications)`} value={res.stmtWcChange} strong accent />
            </div>

            <div className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm ${res.ties ? 'bg-mint-50 text-mint-600 dark:bg-mint-500/10' : 'bg-rose-50 text-rose-500 dark:bg-rose-500/10'}`}>
              {res.ties ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
              <span>
                {res.ties
                  ? `Cross-check ties: Sources − Applications (${formatINR(res.stmtWcChange)}) equals the schedule's change in working capital.`
                  : `Cross-check fails by ${formatINR(Math.abs(res.diff))}: the statement shows ${formatINR(res.stmtWcChange)} but the schedule shows ${formatINR(res.wcIncrease)}. Re-check a classification or amount.`}
              </span>
            </div>
          </ResultPanel>

          <CalcSteps steps={res.steps} />

          <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              “Fund” here means working capital. Depreciation is added back only because it reduced profit without
              using funds. Decide your treatment of provision for tax and proposed dividend (current liability vs
              appropriation) and stay consistent — use the ledger working notes below to derive the figure actually paid.
            </span>
          </div>
        </div>
      </div>

      <LedgerWorkings subtitle="Optional. Where an adjustment hides a figure (tax paid, fixed assets purchased/sold), balance a T-account to derive it, then carry the balancing figure into the sources/applications above." />
    </div>
  )
}

/* ---------------- helpers ---------------- */

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
          <Del onClick={() => del(k, i)} />
        </div>
      ))}
      <AddBtn onClick={() => add(k)} />
    </div>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      {children}
    </div>
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
