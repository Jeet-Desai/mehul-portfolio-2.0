import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pin, Sparkles, CalendarClock, Lightbulb, ArrowRight, ExternalLink, Info } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { notices, noticeCategories, type Notice, type NoticeCategory } from '../data/notices'
import { usePageTitle } from '../lib/usePageTitle'

const catIcon: Record<NoticeCategory, LucideIcon> = {
  'Site update': Sparkles,
  'Exam info': CalendarClock,
  'Study tip': Lightbulb,
}

/** Parse a YYYY-MM-DD string as a LOCAL date (avoids the UTC day-shift). */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const isInternal = (to: string) => to.startsWith('/')

function NoticeCard({ n }: { n: Notice }) {
  const Icon = catIcon[n.category]
  return (
    <div className={`cl-card p-5 sm:p-6 ${n.pinned ? 'border-brand-600' : ''}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="inline-flex items-center gap-1.5 font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-brand-600">
          <Icon className="h-3.5 w-3.5" />
          {n.category}
        </span>
        {n.pinned && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600">
            <Pin className="h-3 w-3" /> Pinned
          </span>
        )}
        <span className="ml-auto font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
          {formatDate(n.date)}
        </span>
      </div>

      <h3 className="mt-3 font-display text-xl font-semibold leading-snug">{n.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{n.body}</p>

      {n.link &&
        (isInternal(n.link.to) ? (
          <Link
            to={n.link.to}
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-600 hover:text-brand-700"
          >
            {n.link.label} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <a
            href={n.link.to}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-600 hover:text-brand-700"
          >
            {n.link.label} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ))}
    </div>
  )
}

export default function NoticeBoard() {
  usePageTitle('Notice Board', 'Exam updates, study tips and site announcements — pinned first.')
  const [filter, setFilter] = useState<NoticeCategory | 'All'>('All')

  const list = useMemo(() => {
    const base = filter === 'All' ? notices : notices.filter((n) => n.category === filter)
    // Pinned first, then most-recent first.
    return [...base].sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1
      return a.date < b.date ? 1 : -1
    })
  }, [filter])

  return (
    <>
      <PageHeader
        eyebrow="Notice Board"
        title="Announcements &"
        titleAccent="updates."
        subtitle="What's new on AccrualSense, study pointers, and where to confirm official exam schedules — so you never miss a thing."
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* filter chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['All', ...noticeCategories] as const).map((c) => (
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
          {list.map((n) => (
            <NoticeCard key={n.id} n={n} />
          ))}
        </div>

        {list.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">No notices in this category yet.</p>
        )}

        <div className="mt-8 flex items-start gap-2.5 rounded-[10px] border border-slate-200 bg-slate-100 p-4 text-xs leading-relaxed text-slate-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <span>
            This board carries AccrualSense updates and general study guidance. It never lists official exam
            dates — exam schedules and syllabus schemes change every session, so always confirm them on your
            university or institute's official website.
          </span>
        </div>
      </div>
    </>
  )
}
