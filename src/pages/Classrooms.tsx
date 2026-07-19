import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  Users,
  Plus,
  KeyRound,
  Loader2,
  ArrowRight,
  BookOpen,
  Archive,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { usePageTitle } from '../lib/usePageTitle'
import { useAuth } from '../lib/auth'
import { useMyRole } from '../lib/role'
import {
  listOwnedClassrooms,
  listJoinedClassrooms,
  createClassroom,
  countMembers,
  type Classroom,
} from '../lib/classrooms'

/** Best display name we have for the signed-in user (metadata → email). */
export function displayName(user: { email?: string; user_metadata?: Record<string, unknown> } | null): string | null {
  if (!user) return null
  const meta = user.user_metadata ?? {}
  const name = (meta.full_name as string) || (meta.name as string)
  return name?.trim() || user.email || null
}

export default function Classrooms() {
  usePageTitle('Classrooms', 'Join your teacher’s virtual classroom — announcements, doubts and classmates in one place.')
  const { user } = useAuth()
  const { role, roleLoading } = useMyRole()
  const isTeacher = role === 'teacher' || role === 'admin'

  const [owned, setOwned] = useState<Classroom[]>([])
  const [joined, setJoined] = useState<Classroom[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [own, mem] = await Promise.all([
      listOwnedClassrooms(user.id),
      listJoinedClassrooms(user.id),
    ])
    setOwned(own.data)
    setJoined(mem.data)
    setError(own.error || mem.error)
    setCounts(await countMembers([...own.data, ...mem.data].map((c) => c.id)))
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <PageHeader
        eyebrow="Classrooms"
        title="Your class,"
        titleAccent="online."
        subtitle="Teachers open a classroom and share one link; students join in a tap — announcements, doubts and the full roster in one place."
      />

      <div className="mx-auto max-w-5xl space-y-10 px-4 pb-16 sm:px-6">
        {loading || roleLoading ? (
          <div className="grid min-h-[30vh] place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
                Couldn’t load classrooms — {error}. If this mentions a missing table, run{' '}
                <code>supabase/classrooms.sql</code> first.
              </div>
            )}

            {/* owned.length covers a demoted teacher: their classes keep working
                (ownership is by id, not role) — they just can't create new ones */}
            {(isTeacher || owned.length > 0) && (
              <TeachSection classes={owned} counts={counts} onCreated={load} canCreate={isTeacher} />
            )}

            <JoinedSection classes={joined} counts={counts} showEmpty={!isTeacher || joined.length > 0} />

            <JoinByCode />
          </>
        )}
      </div>
    </>
  )
}

/* ------------------------------------------------------- teacher section -- */

function TeachSection({
  classes,
  counts,
  onCreated,
  canCreate,
}: {
  classes: Classroom[]
  counts: Record<string, number>
  onCreated: () => void
  canCreate: boolean
}) {
  const [creating, setCreating] = useState(false)

  return (
    <Reveal>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="h2-marker text-[22px]">Classes you teach</h2>
        {canCreate && (
          <button onClick={() => setCreating((v) => !v)} className="btn-accent px-4 py-2 text-sm">
            <Plus className="h-4 w-4" /> New classroom
          </button>
        )}
      </div>

      {creating && <CreateForm onDone={() => { setCreating(false); onCreated() }} onCancel={() => setCreating(false)} />}

      {classes.length === 0 && !creating ? (
        <div className="mt-4 grid place-items-center rounded-xl border border-dashed border-slate-200 py-12 text-center">
          <GraduationCap className="h-7 w-7 text-slate-300" />
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            No classrooms yet. Create one and share its join link — your students appear here as they join.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {classes.map((c) => (
            <ClassCard key={c.id} c={c} memberCount={counts[c.id] ?? 0} teaching />
          ))}
        </div>
      )}
    </Reveal>
  )
}

function CreateForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [allowPosts, setAllowPosts] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !name.trim()) return
    setBusy(true)
    setErr(null)
    const { error } = await createClassroom({
      ownerId: user.id,
      ownerName: displayName(user),
      name,
      subject,
      description,
      allowStudentPosts: allowPosts,
    })
    setBusy(false)
    if (error) setErr(error)
    else onDone()
  }

  const field =
    'mt-1.5 w-full rounded-[9px] border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-600'

  return (
    <form onSubmit={submit} className="cl-card mt-4 space-y-3 p-5">
      <label className="block">
        <span className="text-[12.5px] font-semibold text-slate-600">Class name *</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. TY B.Com — Cost Accounting (Div A)" className={field} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[12.5px] font-semibold text-slate-600">Subject</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Cost Accounting" className={field} />
        </label>
        <label className="flex items-end gap-2 pb-2.5">
          <input type="checkbox" checked={allowPosts} onChange={(e) => setAllowPosts(e.target.checked)} className="h-4 w-4 accent-brand-600" />
          <span className="text-[12.5px] font-semibold text-slate-600">Students can post to the stream</span>
        </label>
      </div>
      <label className="block">
        <span className="text-[12.5px] font-semibold text-slate-600">Description</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What is this class about? (optional)" className={field} />
      </label>
      {err && <p className="text-sm text-rose-500">{err}</p>}
      <div className="flex items-center gap-2">
        <button type="submit" disabled={busy || !name.trim()} className="btn-accent px-4 py-2 text-sm disabled:opacity-40">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create classroom
        </button>
        <button type="button" onClick={onCancel} className="btn-outline px-4 py-2 text-sm">Cancel</button>
      </div>
    </form>
  )
}

/* ------------------------------------------------------- student section -- */

function JoinedSection({
  classes,
  counts,
  showEmpty,
}: {
  classes: Classroom[]
  counts: Record<string, number>
  showEmpty: boolean
}) {
  if (classes.length === 0 && !showEmpty) return null
  return (
    <Reveal>
      <h2 className="h2-marker text-[22px]">Classes you’ve joined</h2>
      {classes.length === 0 ? (
        <div className="mt-4 grid place-items-center rounded-xl border border-dashed border-slate-200 py-12 text-center">
          <BookOpen className="h-7 w-7 text-slate-300" />
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            You haven’t joined a classroom yet. Ask your teacher for the class code or join link.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {classes.map((c) => (
            <ClassCard key={c.id} c={c} memberCount={counts[c.id] ?? 0} />
          ))}
        </div>
      )}
    </Reveal>
  )
}

function ClassCard({ c, memberCount, teaching = false }: { c: Classroom; memberCount: number; teaching?: boolean }) {
  return (
    <Link to={`/classrooms/${c.id}`} className="cl-card cl-card-lift block p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[16px] font-bold text-slate-900">{c.name}</p>
          <p className="mt-0.5 truncate text-xs text-slate-400">
            {c.subject || 'General'} · {teaching ? 'You teach this class' : c.owner_name || 'Teacher'}
          </p>
        </div>
        {c.archived ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
            <Archive className="h-3 w-3" /> Archived
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600">
            <Users className="h-3 w-3" /> {memberCount}
          </span>
        )}
      </div>
      {c.description && <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-600">{c.description}</p>}
      <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-brand-600">
        Open classroom <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  )
}

/* ----------------------------------------------------------- join by code -- */

function JoinByCode() {
  const [code, setCode] = useState('')
  const navigate = useNavigate()
  return (
    <Reveal>
      <div className="cl-card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-600">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[15px] font-bold text-slate-900">Have a class code?</p>
            <p className="text-xs text-slate-400">Enter the 6-character code your teacher shared.</p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (code.trim()) navigate(`/classrooms/join/${code.trim().toUpperCase()}`)
          }}
          className="flex items-center gap-2"
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. K7XM2P"
            maxLength={6}
            className="w-32 rounded-[9px] border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-bold tracking-[0.15em] uppercase outline-none transition focus:border-brand-600"
          />
          <button type="submit" disabled={code.trim().length < 6} className="btn-accent px-4 py-2.5 text-sm disabled:opacity-40">
            Join <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </Reveal>
  )
}
