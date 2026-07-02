import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, BookOpen, FileText, Library, ArrowRight } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import CalcCard from '../components/calc/CalcCard'
import { calculators } from '../calculators/registry'
import { usePageTitle } from '../lib/usePageTitle'

const upcoming = [
  { icon: Library, title: 'PDF export', desc: 'Download any formula sheet or result card for offline revision.', phase: 'Phase 5' },
]

const entryPoints = [
  {
    to: '/resources',
    icon: BookOpen,
    title: 'Resource Library',
    desc: 'Topic-by-topic study notes — concept, method, exam tips and references.',
  },
  {
    to: '/formulas',
    icon: FileText,
    title: 'Formula Sheets',
    desc: 'Searchable quick-reference sheets across every subject — revise before an exam.',
  },
]

export default function LearnHub() {
  usePageTitle('Commerce Calculators & Learn Hub', 'Step-by-step commerce calculators, formula sheets and study notes — free tools for every Indian commerce student.')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return calculators
    return calculators.filter((c) =>
      [c.title, c.category, c.blurb, ...(c.tags ?? [])].join(' ').toLowerCase().includes(term),
    )
  }, [q])

  return (
    <>
      <PageHeader
        eyebrow="Learn Hub"
        title="Tools that teach,"
        titleAccent="not just compute."
        subtitle="Every calculator shows its full working — so you learn the method, not just the answer."
      />

      <div className="mx-auto max-w-6xl px-4 pt-7 pb-12 sm:px-6">
        <Reveal>
          {/* search */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-[18px] py-[15px] focus-within:border-brand-600">
            <Search className="h-[18px] w-[18px] shrink-0 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search calculators — break-even, GST, income tax…"
              className="w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* study-resource entry points */}
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            {entryPoints.map((e) => (
              <Link
                key={e.to}
                to={e.to}
                className="cl-card-lift flex items-center gap-4 rounded-xl border border-slate-200 bg-brand-50 px-5 py-[18px]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] border border-slate-200 bg-white text-brand-600">
                  <e.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-[19px] font-semibold leading-snug text-slate-900">{e.title}</h3>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">{e.desc}</p>
                </div>
                <ArrowRight className="h-[18px] w-[18px] shrink-0 text-brand-600" />
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-9 mb-4 flex items-baseline gap-2.5">
          <h2 className="text-[28px] font-semibold">Calculators</h2>
          <span className="font-sans text-sm text-slate-400">({filtered.length})</span>
        </Reveal>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CalcCard key={c.slug} calc={c} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-4 text-sm text-slate-600">No calculators match "{q}" yet — more are on the way.</p>
        )}

        {/* upcoming */}
        <Reveal className="mt-14 mb-4">
          <h2 className="text-[28px] font-semibold">Coming next to the Learn Hub</h2>
        </Reveal>
        <div className="grid gap-3.5 sm:grid-cols-3">
          {upcoming.map((u) => (
            <div key={u.title} className="cl-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-brand-600">
                  {u.phase}
                </span>
                <u.icon className="h-4 w-4 text-slate-400" />
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold leading-snug">{u.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{u.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
