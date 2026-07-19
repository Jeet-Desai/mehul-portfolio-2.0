import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, BookOpen, FileText, ArrowRight, History, WifiOff, Languages, FlaskConical } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import CalcCard from '../components/calc/CalcCard'
import { calculators } from '../calculators/registry'
import type { CalcCategory } from '../calculators/types'
import { getRecentCalcs } from '../lib/progress'
import { usePageTitle } from '../lib/usePageTitle'

const upcoming = [
  { icon: WifiOff, title: 'Offline mode (PWA)', desc: 'Install AccrualSense on your phone and keep every tool working without a network.', phase: 'Phase 5' },
  { icon: Languages, title: 'ગુજરાતી everywhere', desc: 'The Library already speaks Gujarati — the calculators and quizzes are next.', phase: 'Phase 5' },
]

const entryPoints = [
  {
    to: '/lab',
    icon: FlaskConical,
    title: 'Problem Lab',
    desc: 'Unlimited exam-style sums, graded figure by figure — with a daily challenge to share.',
  },
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

/* Category chips follow the registry's teaching order. */
const categories: CalcCategory[] = (() => {
  const seen = new Set<CalcCategory>()
  for (const c of calculators) seen.add(c.category)
  return [...seen]
})()

export default function LearnHub() {
  usePageTitle('Commerce Calculators & Learn Hub', 'Step-by-step commerce calculators, formula sheets and study notes — free tools for every Indian commerce student.')
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<CalcCategory | 'All'>('All')

  // resolved once per visit — recently opened calculators, most recent first
  const recent = useMemo(
    () =>
      getRecentCalcs()
        .map((slug) => calculators.find((c) => c.slug === slug))
        .filter((c): c is NonNullable<typeof c> => Boolean(c))
        .slice(0, 4),
    [],
  )

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return calculators.filter((c) => {
      if (cat !== 'All' && c.category !== cat) return false
      if (!term) return true
      return [c.title, c.category, c.blurb, ...(c.tags ?? [])].join(' ').toLowerCase().includes(term)
    })
  }, [q, cat])

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

          {/* category chips */}
          <div className="mt-3.5 flex flex-wrap gap-2">
            {(['All', ...categories] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full px-[15px] py-[7px] text-[12.5px] transition ${
                  cat === c
                    ? 'bg-brand-600 font-bold text-white'
                    : 'bg-slate-100 font-semibold text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* study-resource entry points */}
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
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

        {/* pick up where you left off */}
        {recent.length > 0 && !q && cat === 'All' && (
          <Reveal className="mt-9">
            <div className="mb-3.5 flex items-center gap-2">
              <History className="h-4 w-4 text-brand-600" />
              <h2 className="text-[19px] font-semibold">Pick up where you left off</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {recent.map((c) => (
                <Link
                  key={c.slug}
                  to={`/learn/c/${c.slug}`}
                  className="cl-card-lift inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5"
                >
                  <c.icon className="h-4 w-4 text-brand-600" />
                  <span className="text-[13.5px] font-semibold text-slate-800">{c.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              ))}
            </div>
          </Reveal>
        )}

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
          <p className="mt-4 text-sm text-slate-600">
            No calculators match{q.trim() ? ` "${q}"` : ''}{cat !== 'All' ? ` in ${cat}` : ''} yet — more are on the way.
          </p>
        )}

        {/* upcoming */}
        <Reveal className="mt-14 mb-4">
          <h2 className="text-[28px] font-semibold">Coming next to the Learn Hub</h2>
        </Reveal>
        <div className="grid gap-3.5 sm:grid-cols-2">
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
