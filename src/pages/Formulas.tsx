import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowUpRight, Info, Printer } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { formulas, formulaSubjects, type Formula, type FormulaSubject } from '../data/formulas'
import { calculators } from '../calculators/registry'
import { usePageTitle } from '../lib/usePageTitle'

/* Ledger Formula Sheets (design 3b) — search · subject chips · formula cards
   with the related tool named on each card. */

const calcTitleBySlug = new Map(calculators.map((c) => [c.slug, c.title]))

/** Print the current (filtered) sheet as a clean PDF (browser "Save as PDF").
    Force light mode for the printout so the PDF is readable on paper —
    same mechanism as ResourceTopic's Download PDF. */
function downloadAsPdf() {
  const el = document.documentElement
  const wasDark = el.classList.contains('dark')
  if (wasDark) {
    el.classList.remove('dark')
    const restore = () => {
      el.classList.add('dark')
      window.removeEventListener('afterprint', restore)
    }
    window.addEventListener('afterprint', restore)
  }
  window.print()
}

function FormulaCard({ f }: { f: Formula }) {
  return (
    <div className="cl-card cl-card-lift rounded-[10px] p-5 sm:px-6">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <span className="font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-brand-600">
          {f.subject}
        </span>
        {f.calc && (
          <Link
            to={`/learn/c/${f.calc}`}
            className="inline-flex shrink-0 items-center gap-0.5 text-[11.5px] font-semibold text-brand-600 hover:text-brand-700 print:hidden"
          >
            {calcTitleBySlug.get(f.calc) ?? 'Calculator'} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <h3 className="font-display text-[19px] font-semibold leading-snug">{f.name}</h3>
      <p className="mt-2 rounded-[7px] bg-slate-50 px-3.5 py-2.5 font-display text-[16px] italic leading-relaxed text-slate-900">
        {f.expr}
      </p>
      {f.note && <p className="mt-2 text-[12.5px] leading-relaxed text-slate-600">{f.note}</p>}
    </div>
  )
}

export default function Formulas() {
  usePageTitle('Formula Sheets — Quick Reference', 'Searchable quick-reference formula sheets across accounting, costing, taxation, finance and statistics.')
  // Seed the search from ?q= so external links can deep-link a filter
  // (read once on mount; we never write back to the URL while typing).
  const [q, setQ] = useState(() => new URLSearchParams(window.location.search).get('q') ?? '')
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
        title="Quick reference,"
        titleAccent="before the exam."
        subtitle="Searchable quick-reference sheets across every subject — the evergreen formulas, with what each term means and the tool that applies it."
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* search + print */}
        <div className="flex items-center gap-3 print:hidden">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-[18px] py-3.5 focus-within:border-brand-600">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search formulas — contribution, WACC, current ratio…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={downloadAsPdf}
            className="inline-flex shrink-0 items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-900 transition hover:border-brand-600"
          >
            <Printer className="h-4 w-4" /> <span className="hidden sm:inline">Print / save PDF</span>
          </button>
        </div>

        {/* subject chips */}
        <div className="mb-8 mt-3.5 flex flex-wrap gap-2 print:hidden">
          {(['All', ...formulaSubjects] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`rounded-full px-[15px] py-[7px] text-[12.5px] transition ${
                subject === s
                  ? 'bg-brand-600 font-bold text-white'
                  : 'bg-slate-100 font-semibold text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {groups.map((g) => (
          <section key={g.subject} className="mb-10">
            <div className="mb-4 flex items-baseline gap-3">
              <h2 className="text-[22px]">{g.subject}</h2>
              <span className="font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
                {g.items.length} {g.items.length === 1 ? 'formula' : 'formulas'}
              </span>
            </div>
            <div className="grid gap-3.5 sm:grid-cols-2">
              {g.items.map((f) => (
                <FormulaCard key={f.id} f={f} />
              ))}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-slate-600">No formulas match "{q}" yet — try another term.</p>
        )}

        <div className="mt-4 flex items-start gap-2.5 rounded-[10px] border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span>
            A quick-revision reference. Taxation entries are kept structural — specific rates, slabs and
            thresholds change each Budget, so use the calculators (and the official sources) for live figures.
          </span>
        </div>
      </div>
    </>
  )
}
