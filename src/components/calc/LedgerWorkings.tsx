import { useRef, useState } from 'react'
import { Plus, Trash2, BookOpen, ArrowRight } from 'lucide-react'
import { formatINR, toNum } from '../../lib/format'

/* A reusable "working notes" panel for preparing ledger (T-)accounts. In fund-flow
   and cash-flow problems, adjustments (provision for tax, fixed assets bought/sold,
   depreciation provision…) hide a figure that must be derived by balancing a ledger
   account. The student enters the known Dr/Cr entries; the BALANCING FIGURE — the
   value they carry to the statement — is computed and shown. Self-contained: it is a
   scratchpad, so it keeps its own state and does not feed the statement automatically. */

type Entry = { particulars: string; amount: string }
type Account = { id: number; name: string; dr: Entry[]; cr: Entry[] }

const inputBase =
  'min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100'

const PRESETS = [
  'Provision for Tax A/c',
  'Machinery A/c',
  'Provision for Depreciation A/c',
  'Investments A/c',
  'Building A/c',
]

const sum = (xs: Entry[]) => xs.reduce((a, e) => a + toNum(e.amount), 0)

export default function LedgerWorkings({ subtitle }: { subtitle?: string }) {
  const idRef = useRef(0)
  const blank = (): Entry => ({ particulars: '', amount: '' })
  const make = (name = ''): Account => ({ id: ++idRef.current, name, dr: [blank(), blank()], cr: [blank(), blank()] })
  const [accounts, setAccounts] = useState<Account[]>([])

  const addAccount = (name = '') => setAccounts((a) => [...a, make(name)])
  const delAccount = (id: number) => setAccounts((a) => a.filter((x) => x.id !== id))
  const patch = (id: number, fn: (a: Account) => Account) =>
    setAccounts((a) => a.map((x) => (x.id === id ? fn(x) : x)))

  const setEntry = (id: number, side: 'dr' | 'cr', i: number, key: keyof Entry, v: string) =>
    patch(id, (a) => ({ ...a, [side]: a[side].map((e, j) => (j === i ? { ...e, [key]: v } : e)) }))
  const addEntry = (id: number, side: 'dr' | 'cr') =>
    patch(id, (a) => ({ ...a, [side]: [...a[side], blank()] }))
  const delEntry = (id: number, side: 'dr' | 'cr', i: number) =>
    patch(id, (a) => ({ ...a, [side]: a[side].filter((_, j) => j !== i) }))

  return (
    <div className="cl-card p-6 hover:translate-y-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-bold">
          <BookOpen className="h-5 w-5 text-brand-600" /> Ledger accounts — working notes
        </h3>
        <button
          type="button"
          onClick={() => addAccount()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Add ledger account
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {subtitle ??
          'Optional. When an adjustment hides a figure, open a T-account to derive it — the balancing figure (e.g. tax paid, asset purchased/sold) is worked out for you, then carry it to the statement above.'}
      </p>

      {accounts.length === 0 ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Quick add a common account</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => addAccount(p)}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-brand-300 px-3 py-1.5 text-xs font-semibold text-brand-600 transition hover:bg-brand-50 dark:hover:bg-brand-500/10"
              >
                <Plus className="h-3.5 w-3.5" /> {p}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {accounts.map((acc) => (
            <AccountCard
              key={acc.id}
              acc={acc}
              onName={(v) => patch(acc.id, (a) => ({ ...a, name: v }))}
              onDelete={() => delAccount(acc.id)}
              onEntry={(side, i, key, v) => setEntry(acc.id, side, i, key, v)}
              onAddEntry={(side) => addEntry(acc.id, side)}
              onDelEntry={(side, i) => delEntry(acc.id, side, i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AccountCard({
  acc, onName, onDelete, onEntry, onAddEntry, onDelEntry,
}: {
  acc: Account
  onName: (v: string) => void
  onDelete: () => void
  onEntry: (side: 'dr' | 'cr', i: number, key: keyof Entry, v: string) => void
  onAddEntry: (side: 'dr' | 'cr') => void
  onDelEntry: (side: 'dr' | 'cr', i: number) => void
}) {
  const tDr = sum(acc.dr)
  const tCr = sum(acc.cr)
  const diff = tDr - tCr
  const balSide: 'dr' | 'cr' | null = diff > 0.005 ? 'cr' : diff < -0.005 ? 'dr' : null
  const balAmt = Math.abs(diff)
  const grand = Math.max(tDr, tCr)

  return (
    <div className="rounded-2xl border border-slate-200 p-3.5">
      <div className="flex items-center gap-2">
        <input
          className={`${inputBase} flex-1 font-semibold`}
          placeholder="Account name, e.g. Provision for Tax A/c"
          value={acc.name}
          onChange={(e) => onName(e.target.value)}
        />
        <button type="button" aria-label="Remove account" onClick={onDelete} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <LedgerSide
          side="dr"
          prefix="To"
          title="Dr."
          entries={acc.dr}
          total={grand}
          balLabel={balSide === 'dr' ? balAmt : null}
          onEntry={(i, k, v) => onEntry('dr', i, k, v)}
          onAdd={() => onAddEntry('dr')}
          onDel={(i) => onDelEntry('dr', i)}
        />
        <LedgerSide
          side="cr"
          prefix="By"
          title="Cr."
          entries={acc.cr}
          total={grand}
          balLabel={balSide === 'cr' ? balAmt : null}
          onEntry={(i, k, v) => onEntry('cr', i, k, v)}
          onAdd={() => onAddEntry('cr')}
          onDel={(i) => onDelEntry('cr', i)}
        />
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-50 p-2.5 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
        <ArrowRight className="h-4 w-4 shrink-0" />
        {balSide ? (
          <span>
            <strong>Balancing figure = {formatINR(balAmt)}</strong> — enter on the {balSide === 'dr' ? 'debit' : 'credit'} side; this is usually the figure you carry to the statement.
          </span>
        ) : (
          <span>Both sides are equal — no balancing figure needed.</span>
        )}
      </div>
    </div>
  )
}

function LedgerSide({
  side, prefix, title, entries, total, balLabel, onEntry, onAdd, onDel,
}: {
  side: 'dr' | 'cr'
  prefix: 'To' | 'By'
  title: string
  entries: Entry[]
  total: number
  balLabel: number | null
  onEntry: (i: number, key: keyof Entry, v: string) => void
  onAdd: () => void
  onDel: (i: number) => void
}) {
  return (
    <div className="rounded-xl border border-slate-100 p-2.5">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="space-y-1.5">
        {entries.map((e, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-5 shrink-0 text-xs font-semibold text-slate-400">{prefix}</span>
            <input className={`${inputBase} flex-1`} placeholder="Particulars" value={e.particulars} onChange={(ev) => onEntry(i, 'particulars', ev.target.value)} />
            <input className={`${inputBase} w-20 shrink-0`} inputMode="decimal" placeholder="₹" value={e.amount} onChange={(ev) => onEntry(i, 'amount', ev.target.value)} />
            <button type="button" aria-label="Remove entry" onClick={() => onDel(i)} className="grid h-6 w-6 shrink-0 place-items-center rounded text-slate-300 transition hover:text-rose-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {balLabel !== null && (
          <div className="flex items-center gap-1.5 rounded-md bg-brand-50/70 px-1 py-1 dark:bg-brand-500/10">
            <span className="w-5 shrink-0 text-xs font-semibold text-brand-500">{prefix}</span>
            <span className="flex-1 text-sm font-semibold text-brand-700 dark:text-brand-300">Balancing figure</span>
            <span className="w-20 shrink-0 pr-1 text-right text-sm font-bold text-brand-700 dark:text-brand-300">{formatINR(balLabel)}</span>
            <span className="w-6 shrink-0" />
          </div>
        )}
      </div>
      <button type="button" onClick={onAdd} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition hover:text-brand-700">
        <Plus className="h-3.5 w-3.5" /> Add entry
      </button>
      <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-1.5">
        <span className="text-xs font-semibold text-slate-500">Total</span>
        <span className="pr-7 text-sm font-bold tabular-nums text-slate-800">{formatINR(total)}</span>
      </div>
    </div>
  )
}
