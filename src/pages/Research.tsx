import { BookOpen, FileText, GraduationCap, ExternalLink } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import {
  researchStats,
  scholars,
  researchAreas,
  books,
  publications,
  scholarUrl,
} from '../data/research'

function EmptyState({ icon: Icon, title, hint }: { icon: typeof BookOpen; title: string; hint: string }) {
  return (
    <div className="cl-card flex flex-col items-center gap-2 p-8 text-center hover:translate-y-0">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon className="h-6 w-6" />
      </span>
      <p className="font-semibold text-slate-700">{title}</p>
      <p className="max-w-md text-sm text-slate-500">{hint}</p>
    </div>
  )
}

export default function Research() {
  return (
    <>
      <PageHeader
        eyebrow="Research"
        title="Publications & scholarship"
        subtitle="Two decades of research in Accounting, Finance and Management — and the scholars it has shaped."
      >
        <div className="mt-5 flex flex-wrap gap-2">
          {researchAreas.map((a) => (
            <span key={a} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
              {a}
            </span>
          ))}
        </div>
        {scholarUrl && (
          <a
            href={scholarUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-700"
          >
            <ExternalLink className="h-4 w-4" /> Google Scholar profile
          </a>
        )}
      </PageHeader>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* research output */}
        <h2 className="text-xl font-bold">Research output</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {researchStats.map((s) => (
            <div key={s.label} className="cl-card p-5 text-center hover:translate-y-0">
              <p className="font-display text-3xl font-extrabold text-brand-600">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* scholars guided */}
        <h2 className="mt-12 flex items-center gap-2 text-xl font-bold">
          <GraduationCap className="h-5 w-5 text-brand-600" /> Scholars mentored
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {scholars.map((s) => (
            <div key={s.label} className="cl-card p-5 text-center hover:translate-y-0">
              <p className="font-display text-3xl font-extrabold text-mint-600">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* books */}
        <h2 className="mt-12 flex items-center gap-2 text-xl font-bold">
          <BookOpen className="h-5 w-5 text-brand-600" /> Books authored
        </h2>
        <div className="mt-4">
          {books.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {books.map((b) => (
                <div key={b.title} className="cl-card p-5">
                  <p className="font-semibold text-slate-800">{b.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
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
        <h2 className="mt-12 flex items-center gap-2 text-xl font-bold">
          <FileText className="h-5 w-5 text-brand-600" /> Selected publications
        </h2>
        <div className="mt-4">
          {publications.length ? (
            <div className="space-y-3">
              {publications.map((p) => (
                <div key={p.title} className="cl-card flex items-start justify-between gap-4 p-5 hover:translate-y-0">
                  <div>
                    <p className="font-semibold text-slate-800">{p.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
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
