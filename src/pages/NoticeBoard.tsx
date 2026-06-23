import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pin, Sparkles, CalendarClock, Lightbulb, ArrowRight, ExternalLink, Info } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { notices, noticeCategories, type Notice, type NoticeCategory } from '../data/notices'

const catTone: Record<NoticeCategory, string> = {
  'Site update': 'bg-brand-100 text-brand-700',
  'Exam info': 'bg-sun-100 text-sun-600',
  'Study tip': 'bg-mint-100 text-mint-600',
}

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
    <div className="cl-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`cl-pill ${catTone[n.category]} !px-2.5 !py-0.5 !text-xs`}>
          <Icon className="h-3.5 w-3.5" />
          {n.category}
        </span>
        {n.pinned && (
          <span className="cl-pill bg-rose-100 text-rose-600 !px-2.5 !py-0.5 !text-xs">
            <Pin className="h-3.5 w-3.5" /> Pinned
          </span>
        )}
        <span className="ml-auto text-xs font-medium text-slate-400">{formatDate(n.date)}</span>
      </div>

      <h3 className="mt-3 text-lg font-bold">{n.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{n.body}</p>

      {n.link &&
        (isInternal(n.link.to) ? (
          <Link
            to={n.link.to}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {n.link.label} <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <a
            href={n.link.to}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {n.link.label} <ExternalLink className="h-4 w-4" />
          </a>
        ))}
    </div>
  )
}

export default function NoticeBoard() {
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
        title="Announcements & updates"
        subtitle="What's new on CommerceLab, study pointers, and where to confirm official exam schedules — so you never miss a thing."
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* filter chips */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['All', ...noticeCategories] as const).map((c) => (
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
          {list.map((n) => (
            <NoticeCard key={n.id} n={n} />
          ))}
        </div>

        {list.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">No notices in this category yet.</p>
        )}

        <div className="mt-8 flex items-start gap-2 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            This board carries CommerceLab updates and general study guidance. It never lists official exam
            dates — exam schedules and syllabus schemes change every session, so always confirm them on your
            university or institute's official website.
          </span>
        </div>
      </div>
    </>
  )
}
