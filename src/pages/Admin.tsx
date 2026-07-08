import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Inbox,
  Users as UsersIcon,
  Send,
  Trash2,
  Loader2,
  Search,
  Pencil,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserPlus,
  Activity,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { usePageTitle } from '../lib/usePageTitle'
import {
  listAllDoubts,
  answerDoubt,
  deleteDoubt,
  type Doubt,
  type DoubtStatus,
} from '../lib/doubts'
import { listProfiles, computeStats, type Profile } from '../lib/profiles'

type Tab = 'doubts' | 'users'

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

/** Relative "2h ago" style for last-seen — falls back to a date past a week. */
function relative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return fmtDate(iso)
}

export default function Admin() {
  usePageTitle('Admin', "Answer student doubts and see who's using AccrualSense.")
  const [tab, setTab] = useState<Tab>('doubts')

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="The staff room,"
        titleAccent="Dr. Desai."
        subtitle="Answer student doubts — your replies publish to the Answered-doubts feed — and see who's learning here."
      />

      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        {/* segmented control */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:bg-white">
          {(
            [
              { id: 'doubts', label: 'Doubts', icon: Inbox },
              { id: 'users', label: 'Users', icon: UsersIcon },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                tab === t.id ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">{tab === 'doubts' ? <DoubtsPanel /> : <UsersPanel />}</div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ Doubts -- */

const DOUBT_FILTERS: { id: DoubtStatus | 'all'; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'answered', label: 'Answered' },
  { id: 'all', label: 'All' },
]

function DoubtsPanel() {
  const [filter, setFilter] = useState<DoubtStatus | 'all'>('pending')
  const [doubts, setDoubts] = useState<Doubt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await listAllDoubts(filter === 'all' ? undefined : filter)
    setDoubts(data)
    setError(error)
    setLoading(false)
  }, [filter])

  useEffect(() => {
    load()
  }, [load])

  const pendingCount = useMemo(() => doubts.filter((d) => d.status === 'pending').length, [doubts])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {DOUBT_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-[15px] py-[7px] text-[12.5px] transition ${
                filter === f.id
                  ? 'bg-brand-600 font-bold text-white'
                  : 'bg-slate-100 font-semibold text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {filter !== 'answered' && pendingCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sun-100 px-3 py-1 text-[12px] font-bold text-sun-600">
            <Clock className="h-3.5 w-3.5" /> {pendingCount} waiting
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid min-h-[30vh] place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
        </div>
      ) : error ? (
        <ErrorNote error={error} />
      ) : doubts.length === 0 ? (
        <EmptyNote icon={CheckCircle2} text={filter === 'pending' ? 'No doubts waiting — inbox zero.' : 'Nothing here yet.'} />
      ) : (
        <div className="mt-5 space-y-4">
          {doubts.map((d) => (
            <DoubtCard key={d.id} doubt={d} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  )
}

function DoubtCard({ doubt, onChanged }: { doubt: Doubt; onChanged: () => void }) {
  const answered = doubt.status === 'answered'
  const [editing, setEditing] = useState(!answered)
  const [text, setText] = useState(doubt.answer ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async () => {
    if (!text.trim()) return
    setBusy(true)
    setErr(null)
    const { error } = await answerDoubt(doubt.id, text)
    setBusy(false)
    if (error) setErr(error)
    else onChanged()
  }

  const remove = async () => {
    setBusy(true)
    const { error } = await deleteDoubt(doubt.id)
    setBusy(false)
    if (error) setErr(error)
    else onChanged()
  }

  return (
    <div className="cl-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
            {doubt.category && (
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-600">{doubt.category}</span>
            )}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
                answered ? 'bg-mint-100 text-mint-600' : 'bg-sun-100 text-sun-600'
              }`}
            >
              {answered ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {answered ? 'Answered' : 'Pending'}
            </span>
          </div>
          <p className="mt-2.5 text-[15px] font-semibold leading-relaxed text-slate-900">{doubt.question}</p>
          <p className="mt-1.5 text-xs text-slate-400">
            {(doubt.student_name || 'A student')}
            {doubt.student_email ? ` · ${doubt.student_email}` : ''} · asked {fmtDateTime(doubt.created_at)}
          </p>
        </div>
        <button
          onClick={remove}
          disabled={busy}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40"
          aria-label="Delete doubt"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {answered && !editing ? (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{doubt.answer}</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">
              {doubt.answered_at ? `Answered ${fmtDateTime(doubt.answered_at)}` : ''}
            </span>
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-brand-600 hover:bg-brand-50"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit answer
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your answer — it publishes to the public Answered-doubts feed…"
            rows={4}
            className="w-full rounded-[9px] border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm leading-relaxed outline-none transition focus:border-brand-600"
          />
          {err && <p className="mt-1.5 text-xs text-rose-500">{err}</p>}
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={submit}
              disabled={busy || !text.trim()}
              className="btn-accent px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {answered ? 'Update answer' : 'Post answer'}
            </button>
            {answered && (
              <button
                onClick={() => {
                  setEditing(false)
                  setText(doubt.answer ?? '')
                }}
                className="btn-outline px-4 py-2 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------- Users -- */

function UsersPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const { data, error } = await listProfiles()
      setProfiles(data)
      setError(error)
      setLoading(false)
    })()
  }, [])

  const stats = useMemo(() => computeStats(profiles, Date.now()), [profiles])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return profiles
    return profiles.filter((p) =>
      ((p.full_name || '') + ' ' + (p.email || '')).toLowerCase().includes(term),
    )
  }, [q, profiles])

  if (loading)
    return (
      <div className="grid min-h-[30vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    )
  if (error) return <ErrorNote error={error} />

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={UsersIcon} label="Total users" value={stats.total} />
        <StatCard icon={UserPlus} label="New this week" value={stats.newThisWeek} />
        <StatCard icon={Activity} label="Active today" value={stats.activeToday} />
        <StatCard icon={ShieldCheck} label="Admins" value={stats.admins} />
      </div>

      <Reveal className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="h2-marker text-[22px]">All users</h2>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or email…"
              className="w-44 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </Reveal>

      {filtered.length === 0 ? (
        <EmptyNote icon={UsersIcon} text={profiles.length === 0 ? 'No users have signed up yet.' : 'No users match that search.'} />
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Last seen</th>
                  <th className="px-4 py-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.full_name} email={p.email} url={p.avatar_url} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{p.full_name || 'Unnamed'}</p>
                          <p className="truncate text-xs text-slate-400">{p.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{fmtDate(p.created_at)}</td>
                    <td className="px-4 py-3 text-slate-600">{relative(p.last_seen_at)}</td>
                    <td className="px-4 py-3">
                      {p.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600">
                          <ShieldCheck className="h-3 w-3" /> Admin
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Student</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ shared -- */

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersIcon
  label: string
  value: number
}) {
  return (
    <div className="cl-card p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-bold uppercase tracking-[0.08em]">{label}</span>
      </div>
      <p className="mt-2 font-sans text-3xl font-bold text-slate-900 tabular-nums">{value}</p>
    </div>
  )
}

function Avatar({ name, email, url }: { name: string | null; email: string | null; url: string | null }) {
  if (url)
    return <img src={url} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" referrerPolicy="no-referrer" />
  const seed = (name || email || '?').trim()
  const initials = seed
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('')
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-[13px] font-bold text-brand-600">
      {initials || '?'}
    </span>
  )
}

function ErrorNote({ error }: { error: string }) {
  return (
    <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
      Couldn’t load — {error}. If this says a table is missing, run <code>supabase/schema.sql</code> first
      (see <code>docs/ADMIN.md</code>).
    </div>
  )
}

function EmptyNote({ icon: Icon, text }: { icon: typeof UsersIcon; text: string }) {
  return (
    <div className="mt-6 grid place-items-center rounded-xl border border-dashed border-slate-200 py-14 text-center">
      <Icon className="h-7 w-7 text-slate-300" />
      <p className="mt-2 text-sm text-slate-400">{text}</p>
    </div>
  )
}
