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
import { usePageTitle } from '../lib/usePageTitle'

export default function CareerGuide() {
  usePageTitle('Commerce Career Guide', 'CA, CS, CMA, UGC-NET and more — realistic roadmaps, timelines, costs and official links for commerce careers.')
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
        title="What next? Map your"
        titleAccent="commerce career."
        subtitle="The major routes open to every commerce student — B.Com, M.Com, BBA, BCA and 12th-commerce — across professional courses, postgraduate degrees, global qualifications and government careers, with eligibility, structure and prospects."
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* filter chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['All', ...careerCategories] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full px-[15px] py-[7px] text-[12.5px] transition ${
                filter === c
                  ? 'bg-brand-600 font-bold text-white'
                  : 'bg-slate-100 font-semibold text-slate-600 hover:bg-slate-200'
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
              <div key={c.id} className="cl-card cl-card-lift overflow-hidden p-0">
                <button
                  onClick={() => setOpen(isOpen ? null : c.id)}
                  className="flex w-full items-start gap-4 p-5 text-left sm:p-6"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-brand-600">
                      {c.category} · {c.name}
                    </span>
                    <h3 className="mt-1.5 font-display text-[21px] font-semibold leading-snug">
                      {c.fullName}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{c.blurb}</p>
                    <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {c.body}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {c.duration}</span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`mt-1 h-5 w-5 shrink-0 transition ${isOpen ? 'rotate-180 text-brand-600' : 'text-slate-400'}`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-slate-200 p-5 sm:p-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <h4 className="font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">The path</h4>
                        {/* timeline — hairline left rail, accent dots */}
                        <ol className="mt-4 space-y-3 border-l border-slate-200 pl-5">
                          {c.stages.map((s, i) => (
                            <li key={i} className="relative text-sm leading-relaxed text-slate-600">
                              <span
                                aria-hidden
                                className="absolute -left-[24px] top-[7px] h-[7px] w-[7px] rounded-full bg-brand-600"
                              />
                              {s}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">Eligibility</h4>
                          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{c.eligibility}</p>
                        </div>
                        <div>
                          <h4 className="flex items-center gap-1 font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400"><Wallet className="h-3.5 w-3.5" /> Cost</h4>
                          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{c.cost}</p>
                        </div>
                        <div>
                          <h4 className="font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">Where it leads</h4>
                          <ul className="mt-2 space-y-1.5">
                            {c.prospects.map((p) => (
                              <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {p}
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
                      className="btn-outline mt-6 px-4 py-2 text-[13px]"
                    >
                      Official website <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex items-start gap-2.5 rounded-[10px] border border-slate-200 bg-slate-100 p-4 text-xs leading-relaxed text-slate-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span>
            Course structures, eligibility and fees change from time to time. Always confirm the latest exam
            scheme and dates on the official institute website before deciding.
          </span>
        </div>
      </div>
    </>
  )
}
