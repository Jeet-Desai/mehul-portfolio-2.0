import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, Clock, Info } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { resourceTopics, resourceSubjects, type ResourceSubject } from '../data/resources'
import { useLang, useUI, subjectLabel, type Lang } from '../lib/lang'

const subjectTone: Record<ResourceSubject, string> = {
  'Financial Statement Analysis': 'bg-brand-100 text-brand-700',
  'Budgetary Control': 'bg-mint-100 text-mint-600',
  'Cost Accounting': 'bg-sun-100 text-sun-600',
}

export default function ResourceLibrary() {
  const [q, setQ] = useState('')
  const [subject, setSubject] = useState<ResourceSubject | 'All'>('All')
  const [lang, setLang] = useLang()
  const ui = useUI(lang)

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return resourceTopics.filter((t) => {
      if (subject !== 'All' && t.subject !== subject) return false
      if (!term) return true
      return [t.title, t.blurb, t.subject, t.level, ...(t.tags ?? [])]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
  }, [q, subject])

  // Group the filtered list by subject, preserving the canonical order.
  const groups = useMemo(
    () =>
      resourceSubjects
        .map((s) => ({ subject: s, items: filtered.filter((t) => t.subject === s) }))
        .filter((g) => g.items.length > 0),
    [filtered],
  )

  return (
    <>
      <PageHeader eyebrow={ui.library} title={ui.heroTitle} subtitle={ui.heroSubtitle} />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* search + language toggle */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={ui.search}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="inline-flex shrink-0 self-start rounded-full border border-slate-200 bg-white p-0.5 text-xs font-bold sm:self-auto">
            {(['en', 'gu'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-full px-3.5 py-1.5 transition ${
                  lang === l ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-brand-600'
                }`}
              >
                {l === 'en' ? 'English' : 'ગુજરાતી'}
              </button>
            ))}
          </div>
        </div>

        {/* subject chips */}
        <div className="mb-8 flex flex-wrap gap-2">
          {(['All', ...resourceSubjects] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                subject === s ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'All' ? ui.allSubjects : subjectLabel(lang, s)}
            </button>
          ))}
        </div>

        {groups.map((g) => (
          <section key={g.subject} className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-bold">{subjectLabel(lang, g.subject)}</h2>
              <span className={`cl-pill ${subjectTone[g.subject]} !px-2.5 !py-0.5 !text-xs`}>
                {g.items.length}
              </span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((t) => {
                const gu = lang === 'gu' ? t.gu : undefined
                return (
                  <Link
                    key={t.id}
                    to={`/resources/${t.id}`}
                    className="cl-card group flex flex-col p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                        <t.icon className="h-6 w-6" />
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5" /> {t.readingMinutes} {ui.minRead}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold">{gu?.title ?? t.title}</h3>
                    <p className="mt-1.5 flex-1 text-sm text-slate-600">{gu?.blurb ?? t.blurb}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-400">{gu?.level ?? t.level}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                        {ui.study} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm text-slate-500">
            {q.trim()
              ? `No topics match "${q}" yet — more are being added.`
              : `${subject} notes are coming soon — more topics are being added.`}
          </p>
        )}

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{ui.disclaimer}</span>
        </div>
      </div>
    </>
  )
}
