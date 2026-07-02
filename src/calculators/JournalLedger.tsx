import { useEffect, useMemo, useState } from 'react'
import { BookOpenCheck, Plus, RotateCcw, Trash2 } from 'lucide-react'
import CalcSteps from '../components/calc/CalcSteps'
import { formatINR } from '../lib/format'
import {
  templates,
  getTemplate,
  buildEntries,
  postToLedger,
  trialBalance,
  seedTransactions,
  type AccountType,
} from '../lib/journal'

/* ----------------------------------------------------------------------------
   Journal → Ledger → Trial Balance simulator (flagship).
   Type real transactions; watch them journalise with golden-rule reasoning,
   post into textbook T-accounts, and roll into a tallied trial balance.
---------------------------------------------------------------------------- */

type Txn = { templateId: string; amount: number; party?: string; label?: string }
type Tab = 'journal' | 'ledger' | 'tb'

const STORAGE_KEY = 'as:journal'

const typeLabel: Record<AccountType, string> = {
  asset: 'Asset',
  liability: 'Liability',
  capital: 'Capital',
  income: 'Income',
  expense: 'Expense',
}

function loadTxns(): Txn[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const v = raw ? JSON.parse(raw) : null
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'journal', label: '1 · Journal' },
  { id: 'ledger', label: '2 · Ledger' },
  { id: 'tb', label: '3 · Trial Balance' },
]

export default function JournalLedger() {
  const [txns, setTxns] = useState<Txn[]>(() => loadTxns())
  const [tab, setTab] = useState<Tab>('journal')
  const [templateId, setTemplateId] = useState(templates[0].id)
  const [amount, setAmount] = useState('')
  const [party, setParty] = useState('')
  const [label, setLabel] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(txns))
    } catch {
      /* private mode */
    }
  }, [txns])

  const tpl = getTemplate(templateId)!
  const needsParty = tpl.needs.includes('party')
  const needsLabel = tpl.needs.includes('label')
  const amt = Number(amount)
  const canAdd = amt > 0 && (!needsParty || party.trim()) && (!needsLabel || label.trim())

  const add = () => {
    if (!canAdd) return
    setTxns((t) => [
      ...t,
      {
        templateId,
        amount: amt,
        party: needsParty ? party.trim() : undefined,
        label: needsLabel ? label.trim() : undefined,
      },
    ])
    setAmount('')
    setParty('')
    setLabel('')
  }

  const { entries, types } = useMemo(() => buildEntries(txns), [txns])
  const ledger = useMemo(() => postToLedger(entries, types), [entries, types])
  const tb = useMemo(() => trialBalance(ledger), [ledger])

  const steps = [
    {
      label: 'Journalise each transaction (the golden rules)',
      formula: 'Every transaction has one debit and one credit of equal amount',
      result: `${entries.length} entries`,
      note: 'Real a/c: debit what comes in · Personal a/c: debit the receiver · Nominal a/c: debit expenses & losses.',
    },
    {
      label: 'Post each entry into its two ledger accounts',
      formula: 'Debit side reads "To <credit account>", credit side reads "By <debit account>"',
      result: `${ledger.length} accounts`,
    },
    {
      label: 'Balance each account and extract the trial balance',
      formula: 'Debit balances in the Dr column, credit balances in the Cr column',
      result: tb.tallied ? `Both sides ${formatINR(tb.totalDr)} — tallied ✓` : 'Does not tally',
      note: 'Because every entry debits and credits the same amount, the trial balance must tally — that is the whole point of double entry.',
    },
  ]

  const inputCls =
    'w-full rounded-[9px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100 placeholder:font-normal placeholder:text-slate-400'

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------ entry form */}
      <div className="cl-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Record a transaction
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setTxns(seedTransactions)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:border-brand-600 hover:text-brand-600"
            >
              <BookOpenCheck className="h-3.5 w-3.5" /> Load worked example
            </button>
            {txns.length > 0 && (
              <button
                onClick={() => setTxns([])}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:border-rose-400 hover:text-rose-500"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear all
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
          <label className="block">
            <span className="text-[12.5px] font-semibold text-slate-600">Transaction</span>
            <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className={`${inputCls} mt-1.5 cursor-pointer`}>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[12.5px] font-semibold text-slate-600">Amount</span>
            <div className="mt-1.5 flex items-stretch overflow-hidden rounded-[9px] border border-slate-200 bg-slate-50 transition focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100">
              <span className="grid place-items-center border-r border-slate-200 px-3 text-sm text-slate-400">₹</span>
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10,000"
                className="w-full bg-transparent px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>
          </label>
          {needsParty ? (
            <label className="block">
              <span className="text-[12.5px] font-semibold text-slate-600">Party name</span>
              <input value={party} onChange={(e) => setParty(e.target.value)} placeholder="e.g. Ram" className={`${inputCls} mt-1.5`} />
            </label>
          ) : needsLabel ? (
            <label className="block">
              <span className="text-[12.5px] font-semibold text-slate-600">Account name</span>
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={tpl.labelHint} className={`${inputCls} mt-1.5`} />
            </label>
          ) : (
            <div className="hidden sm:block" />
          )}
          <div className="flex items-end">
            <button onClick={add} disabled={!canAdd} className="btn-accent h-[42px] w-full px-5 text-[13px] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ tabs */}
      <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-[9px] px-4 py-2 text-[13px] font-bold transition ${
              tab === t.id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <p className="font-display text-lg font-semibold text-slate-600">The books are empty.</p>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-400">
            Record a transaction above — or load the worked example — and watch it journalise, post
            into T-accounts and roll into a trial balance.
          </p>
        </div>
      ) : (
        <>
          {/* ------------------------------------------------ 1 · JOURNAL */}
          {tab === 'journal' && (
            <div className="cl-card overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <h3 className="font-display text-lg font-semibold">Journal of the business</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      <th className="px-5 py-3 sm:px-6">No.</th>
                      <th className="px-3 py-3">Particulars</th>
                      <th className="px-3 py-3 text-right">Dr (₹)</th>
                      <th className="px-3 py-3 text-right">Cr (₹)</th>
                      <th className="px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e, i) => (
                      <tr key={e.id} className="border-b border-slate-100 align-top last:border-0">
                        <td className="px-5 py-3.5 font-display text-base text-slate-400 sm:px-6">{e.sno}</td>
                        <td className="px-3 py-3.5">
                          <p className="font-semibold text-slate-900">
                            {e.debit} A/c <span className="pl-2 text-slate-400">…Dr</span>
                          </p>
                          <p className="pl-5 text-slate-600">To {e.credit} A/c</p>
                          <p className="mt-1 pl-5 text-xs italic text-slate-400">({e.narration})</p>
                          <div className="mt-2 flex flex-wrap gap-1.5 pl-5">
                            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10.5px] font-bold text-brand-600">
                              Dr: {e.reasonDr}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10.5px] font-bold text-slate-500">
                              Cr: {e.reasonCr}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-right font-display text-[15px] font-semibold text-slate-900">
                          {formatINR(e.amount)}
                        </td>
                        <td className="px-3 py-3.5 text-right font-display text-[15px] font-semibold text-slate-600">
                          {formatINR(e.amount)}
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <button
                            onClick={() => setTxns((t) => t.filter((_, j) => j !== i))}
                            aria-label={`Delete entry ${e.sno}`}
                            className="grid h-7 w-7 place-items-center rounded-[7px] text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ------------------------------------------------ 2 · LEDGER */}
          {tab === 'ledger' && (
            <div className="grid gap-4 lg:grid-cols-2">
              {ledger.map((a) => {
                const balDr = a.balance > 0
                const total = Math.max(a.totalDr, a.totalCr)
                return (
                  <div key={a.name} className="cl-card overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                      <h4 className="font-display text-base font-semibold">{a.name} A/c</h4>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10.5px] font-bold text-slate-500">
                        {typeLabel[a.type]}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 text-[13px]">
                      {/* Dr side */}
                      <div className="border-r border-slate-200">
                        <p className="border-b border-slate-100 px-4 py-2 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          Dr
                        </p>
                        {a.debits.map((l, i) => (
                          <div key={i} className="flex justify-between gap-2 px-4 py-1.5">
                            <span className="text-slate-600">To {l.other}</span>
                            <span className="font-semibold text-slate-900">{formatINR(l.amount)}</span>
                          </div>
                        ))}
                        {!balDr && a.balance !== 0 && (
                          <div className="flex justify-between gap-2 px-4 py-1.5 text-brand-600">
                            <span className="font-semibold">To Balance c/d</span>
                            <span className="font-semibold">{formatINR(-a.balance)}</span>
                          </div>
                        )}
                      </div>
                      {/* Cr side */}
                      <div>
                        <p className="border-b border-slate-100 px-4 py-2 text-right font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          Cr
                        </p>
                        {a.credits.map((l, i) => (
                          <div key={i} className="flex justify-between gap-2 px-4 py-1.5">
                            <span className="text-slate-600">By {l.other}</span>
                            <span className="font-semibold text-slate-900">{formatINR(l.amount)}</span>
                          </div>
                        ))}
                        {balDr && (
                          <div className="flex justify-between gap-2 px-4 py-1.5 text-brand-600">
                            <span className="font-semibold">By Balance c/d</span>
                            <span className="font-semibold">{formatINR(a.balance)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 border-t border-slate-200 bg-slate-50 text-[13px]">
                      <div className="flex justify-between border-r border-slate-200 px-4 py-2 font-display font-semibold text-slate-900">
                        <span /> <span>{formatINR(total)}</span>
                      </div>
                      <div className="flex justify-between px-4 py-2 font-display font-semibold text-slate-900">
                        <span /> <span>{formatINR(total)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ------------------------------------------------ 3 · TRIAL BALANCE */}
          {tab === 'tb' && (
            <div className="mx-auto max-w-2xl space-y-4">
              <div className="cl-card overflow-hidden">
                <div className="border-b border-slate-100 px-5 py-4 text-center sm:px-6">
                  <h3 className="font-display text-lg font-semibold">Trial Balance</h3>
                  <p className="mt-0.5 text-xs text-slate-400">(balances method)</p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      <th className="px-5 py-3 sm:px-6">Account</th>
                      <th className="px-3 py-3 text-right">Dr (₹)</th>
                      <th className="px-3 py-3 pr-5 text-right sm:pr-6">Cr (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tb.rows.map((r) => (
                      <tr key={r.account} className="border-b border-slate-100 last:border-0">
                        <td className="px-5 py-2.5 sm:px-6">
                          <span className="font-semibold text-slate-900">{r.account}</span>
                          <span className="ml-2 text-[11px] text-slate-400">{typeLabel[r.type]}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-display text-[15px] font-semibold text-slate-900">
                          {r.dr ? formatINR(r.dr) : '—'}
                        </td>
                        <td className="px-3 py-2.5 pr-5 text-right font-display text-[15px] font-semibold text-slate-900 sm:pr-6">
                          {r.cr ? formatINR(r.cr) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 bg-slate-50">
                      <td className="px-5 py-3 font-display font-semibold text-slate-900 sm:px-6">Total</td>
                      <td className="px-3 py-3 text-right font-display text-base font-semibold text-brand-600">
                        {formatINR(tb.totalDr)}
                      </td>
                      <td className="px-3 py-3 pr-5 text-right font-display text-base font-semibold text-brand-600 sm:pr-6">
                        {formatINR(tb.totalCr)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {tb.tallied && (
                <div className="rounded-xl border border-slate-200 bg-brand-50 px-5 py-4 text-center">
                  <p className="font-display text-base font-semibold text-brand-600">
                    Tallied — both sides agree at {formatINR(tb.totalDr)} ✓
                  </p>
                  <p className="mt-1 text-[13px] text-slate-600">
                    Every journal entry debits and credits the same amount, so the totals must agree.
                    In an exam, a difference means a posting, casting or balancing error.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <CalcSteps steps={steps} />
    </div>
  )
}
