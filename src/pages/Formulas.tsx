import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowUpRight, Info } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { formulas, formulaSubjects, type Formula, type FormulaSubject } from '../data/formulas'

const subjectTone: Record<FormulaSubject, string> = {
  Costing: 'bg-brand-100 text-brand-700',
  'Financial Management': 'bg-mint-100 text-mint-600',
  Accounting: 'bg-sun-100 text-sun-600',
  Taxation: 'bg-rose-100 text-rose-600',
  'Investing & TVM': 'bg-brand-100 text-brand-700',
  Statistics: 'bg-mint-100 text-mint-600',
}

function FormulaCard({ f }: { f: Formula }) {
  return (
    <div className="cl-card p-5 hover:translate-y-0">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold">{f.name}</h3>
        {f.calc && (
          <Link
            to={`/learn/c/${f.calc}`}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Calculator <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm leading-relaxed text-slate-800">
        {f.expr}
      </p>
      {f.note && <p className="mt-2 text-xs leading-relaxed text-slate-500">{f.note}</p>}
    </div>
  )
}

export default function Formulas() {
  const [q, setQ] = useState('')
  const [subject, setSubject] = useState<FormulaSubject | 'All'>('All')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return formulas.filter((f) => {
      if (subject !== 'All' && f.subject !== subject) return false
      if (!term) return true
      return [f.name, f.expr, f.note ?? '', f.subject, ...(f.tags ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
  }, [q, subject])

  // Group the filtered list by subject, preserving the canonical subject order.
  const groups = useMemo(
    () =>
      formulaSubjects
        .map((s) => ({ subject: s, items: filtered.filter((f) => f.subject === s) }))
        .filter((g) => g.items.length > 0),
    [filtered],
  )

  return (
    <>
      <PageHeader
        eyebrow="Formula Sheets"
        title="Every key formula, in one place"
        subtitle="Searchable quick-reference sheets across costing, financial management, accounting, taxation, investing and statistics — each linked to a calculator that shows the working."
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* search */}
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search formulas — EOQ, P/V ratio, NPV, HRA…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {/* subject chips */}
        <div className="mb-8 flex flex-wrap gap-2">
          {(['All', ...formulaSubjects] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                subject === s ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {groups.map((g) => (
          <section key={g.subject} className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-bold">{g.subject}</h2>
              <span className={`cl-pill ${subjectTone[g.subject]} !px-2.5 !py-0.5 !text-xs`}>
                {g.items.length}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {g.items.map((f) => (
                <FormulaCard key={f.id} f={f} />
              ))}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-slate-500">No formulas match "{q}" yet — try another term.</p>
        )}

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            A quick-revision reference. Taxation entries are kept structural — specific rates, slabs and
            thresholds change each Budget, so use the calculators (and the official sources) for live figures.
          </span>
        </div>
      </div>
    </>
  )
}
