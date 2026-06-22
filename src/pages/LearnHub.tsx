import { useMemo, useState } from 'react'
import { Search, PencilLine, FileText, Library } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import CalcCard from '../components/calc/CalcCard'
import { calculators } from '../calculators/registry'

const upcoming = [
  { icon: PencilLine, title: 'Practice & Quizzes', desc: 'Topic-wise question banks with step-by-step solutions and an exam timer.', phase: 'Phase 3' },
  { icon: FileText, title: 'Formula Sheets', desc: 'Searchable cheat-sheets for every subject, downloadable as PDF.', phase: 'Phase 2' },
  { icon: Library, title: 'Resource Library', desc: 'Notes and past papers, organised subject- and semester-wise.', phase: 'Phase 2' },
]

export default function LearnHub() {
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
        title="Tools that teach, not just compute"
        subtitle="Every calculator shows its full working — so you learn the method, not just the answer."
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* search */}
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search calculators — break-even, GST, income tax…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <h2 className="text-xl font-bold">
          Calculators <span className="text-sm font-medium text-slate-400">({filtered.length})</span>
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CalcCard key={c.slug} calc={c} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">No calculators match "{q}" yet — more are on the way.</p>
        )}

        {/* upcoming */}
        <h2 className="mt-14 text-xl font-bold">Coming next to the Learn Hub</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          {upcoming.map((u) => (
            <div key={u.title} className="cl-card p-6 hover:translate-y-0">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                  <u.icon className="h-6 w-6" />
                </span>
                <span className="cl-pill bg-sun-100 text-sun-600">{u.phase}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-700">{u.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{u.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
