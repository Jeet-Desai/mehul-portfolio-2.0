import { BookOpen, FileText, ExternalLink } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import {
  researchStats,
  scholars,
  researchAreas,
  books,
  publications,
  scholarUrl,
} from '../data/research'
import { usePageTitle } from '../lib/usePageTitle'

/* dashed hairline "coming soon" placeholder — dim serif text, no invented data */
function EmptyState({ icon: Icon, title, hint }: { icon: typeof BookOpen; title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 p-8 text-center">
      <Icon className="h-6 w-6 text-slate-300" />
      <p className="font-display text-lg font-medium text-slate-500">{title}</p>
      <p className="max-w-md text-sm leading-relaxed text-slate-400">{hint}</p>
    </div>
  )
}

export default function Research() {
  usePageTitle('Research & Publications')
  return (
    <>
      <PageHeader
        eyebrow="Research"
        title="Publications &"
        titleAccent="scholarship."
        subtitle="Two decades of research in Accounting, Finance and Management — and the scholars it has shaped."
      >
        <div className="mt-5 flex flex-wrap gap-2">
          {researchAreas.map((a) => (
            <span key={a} className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600">
              {a}
            </span>
          ))}
        </div>
        {scholarUrl && (
          <a
            href={scholarUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-accent mt-5 px-5 py-2.5 text-sm"
          >
            <ExternalLink className="h-4 w-4" /> Google Scholar profile
          </a>
        )}
      </PageHeader>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* research output */}
        <Reveal>
          <h2 className="h2-marker text-2xl">Research output</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {researchStats.map((s) => (
              <div key={s.label} className="cl-card rounded-[10px] p-5 text-center">
                <p className="font-display text-[34px] font-semibold leading-tight text-brand-600">{s.value}</p>
                <p className="mt-1 text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* scholars guided */}
        <h2 className="h2-marker mt-12 text-2xl">Scholars mentored</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {scholars.map((s) => (
            <div key={s.label} className="cl-card rounded-[10px] p-5 text-center">
              <p className="font-display text-[34px] font-semibold leading-tight text-brand-600">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* books */}
        <h2 className="h2-marker mt-12 text-2xl">Books authored</h2>
        <div className="mt-4">
          {books.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((b) => (
                <div key={b.title} className="cl-card p-5">
                  <p className="font-display text-[17px] font-semibold leading-snug text-slate-900">{b.title}</p>
                  <p className="mt-1.5 text-sm text-slate-500">
                    {[b.publisher, b.year].filter(Boolean).join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="Book details coming soon"
              hint="Three authored books — titles, publishers and covers will be added here."
            />
          )}
        </div>

        {/* publications */}
        <h2 className="h2-marker mt-12 text-2xl">Selected publications</h2>
        <div className="mt-4">
          {publications.length ? (
            <div className="space-y-3">
              {publications.map((p) => (
                <div key={p.title} className="cl-card flex items-start justify-between gap-4 p-5">
                  <div>
                    <p className="font-display text-[17px] font-semibold leading-snug text-slate-900">{p.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {[p.journal, p.year].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer" className="shrink-0 text-brand-600 hover:text-brand-700">
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="Publication list coming soon"
              hint="The full list of 36 published papers will appear here — share a Google Scholar or ResearchGate link and it can be populated quickly."
            />
          )}
        </div>
      </div>
    </>
  )
}
