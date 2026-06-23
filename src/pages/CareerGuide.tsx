import { useMemo, useState } from 'react'
import {
  GraduationCap,
  Clock,
  Wallet,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Info,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { careers, careerCategories, type CareerCategory } from '../data/careers'

const catTone: Record<CareerCategory, string> = {
  Professional: 'bg-brand-100 text-brand-700',
  Postgraduate: 'bg-mint-100 text-mint-600',
  Global: 'bg-sun-100 text-sun-600',
  Government: 'bg-rose-100 text-rose-600',
}

export default function CareerGuide() {
  const [filter, setFilter] = useState<CareerCategory | 'All'>('All')
  const [open, setOpen] = useState<string | null>('ca')

  const list = useMemo(
    () => (filter === 'All' ? careers : careers.filter((c) => c.category === filter)),
    [filter],
  )

  return (
    <>
      <PageHeader
        eyebrow="Career Guide"
        title="What after B.Com? Map your path."
        subtitle="The major routes for commerce students — professional courses, postgraduate degrees, global qualifications and government careers — with eligibility, structure and prospects."
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* filter chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['All', ...careerCategories] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === c ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {list.map((c) => {
            const isOpen = open === c.id
            return (
              <div key={c.id} className="cl-card overflow-hidden p-0 hover:translate-y-0">
                <button
                  onClick={() => setOpen(isOpen ? null : c.id)}
                  className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 font-display text-sm font-extrabold text-brand-600">
                    {c.name}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold">{c.fullName}</h3>
                      <span className={`cl-pill ${catTone[c.category]} !px-2.5 !py-0.5 !text-xs`}>{c.category}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{c.blurb}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {c.body}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {c.duration}</span>
                    </div>
                  </div>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 p-5 sm:p-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">The path</h4>
                        <ol className="mt-3 space-y-2.5">
                          {c.stages.map((s, i) => (
                            <li key={i} className="flex gap-3 text-sm text-slate-700">
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{i + 1}</span>
                              {s}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">Eligibility</h4>
                          <p className="mt-1.5 text-sm text-slate-700">{c.eligibility}</p>
                        </div>
                        <div>
                          <h4 className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-400"><Wallet className="h-3.5 w-3.5" /> Cost</h4>
                          <p className="mt-1.5 text-sm text-slate-700">{c.cost}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">Where it leads</h4>
                          <ul className="mt-2 space-y-1.5">
                            {c.prospects.map((p) => (
                              <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-500" /> {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <a
                      href={c.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                    >
                      Official website <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex items-start gap-2 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Course structures, eligibility and fees change from time to time. Always confirm the latest exam
            scheme and dates on the official institute website before deciding.
          </span>
        </div>
      </div>
    </>
  )
}
