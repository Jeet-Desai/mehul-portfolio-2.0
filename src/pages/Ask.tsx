import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  ChevronDown,
  Send,
  Inbox,
  Trash2,
  Mail,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import TutorChat from '../components/TutorChat'
import { faqs, faqCategories, type Faq } from '../data/faq'
import { contact } from '../data/site'
import { usePageTitle } from '../lib/usePageTitle'
import { authEnabled } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth'
import {
  postDoubt,
  listAnsweredDoubts,
  listMyDoubts,
  deleteDoubt,
  type Doubt,
} from '../lib/doubts'

/* ---- localStorage fallback (used only when Supabase is DORMANT) ------------ */
type LocalDoubt = { id: number; name: string; text: string; at: string }
const STORE = 'cl-doubts'
function loadLocalDoubts(): LocalDoubt[] {
  try {
    return JSON.parse(localStorage.getItem(STORE) || '[]')
  } catch {
    return []
  }
}

/** A worked answer for the "Answered doubts" feed — either a curated FAQ or a
    Supabase-answered student doubt, normalised to one shape. */
type AnsweredItem = Faq & { source: 'faq' | 'student'; name?: string | null; at?: string | null }

export default function Ask() {
  usePageTitle(
    'Ask AI — Commerce Doubt Tutor',
    'Ask commerce doubts and get guided answers — plus worked answers from Dr. Desai and 24 years of classroom questions.',
  )
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('All')
  const [openId, setOpenId] = useState<string | null>(null)

  // Supabase-backed answered doubts (only when keyed).
  const [answered, setAnswered] = useState<Doubt[]>([])
  useEffect(() => {
    if (!authEnabled) return
    listAnsweredDoubts().then(({ data }) => setAnswered(data))
  }, [])

  // Merge curated FAQs + student-answered doubts into one searchable feed.
  const answeredItems: AnsweredItem[] = useMemo(() => {
    const faqItems: AnsweredItem[] = faqs.map((f) => ({ ...f, source: 'faq' }))
    const studentItems: AnsweredItem[] = answered.map((d) => ({
      id: `d-${d.id}`,
      category: d.category || 'Doubt',
      question: d.question,
      answer: d.answer || '',
      source: 'student',
      name: d.student_name,
      at: d.answered_at,
    }))
    // Student answers (freshest, most relevant) first, then the curated FAQs.
    return [...studentItems, ...faqItems]
  }, [answered])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return answeredItems.filter(
      (f) =>
        (cat === 'All' || f.category === cat) &&
        (!term || (f.question + ' ' + f.answer).toLowerCase().includes(term)),
    )
  }, [q, cat, answeredItems])

  // Categories: curated set plus any category a student doubt introduced.
  const categories = useMemo(() => {
    const extra = answered.map((d) => d.category).filter((c): c is string => !!c && !(faqCategories as readonly string[]).includes(c))
    return ['All', ...faqCategories, ...Array.from(new Set(extra))]
  }, [answered])

  return (
    <>
      <PageHeader
        eyebrow="Ask AccrualSense"
        title="Your commerce"
        titleAccent="doubt-tutor."
        subtitle="Ask the AI tutor for instant step-by-step help, browse worked answers to common doubts, or post your own for Dr. Desai to answer."
      />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* AI doubt-tutor */}
        <div className="mb-10">
          <TutorChat />
        </div>

        {/* Answered doubts */}
        <Reveal>
          <h2 className="h2-marker text-[28px]">Answered doubts</h2>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-[18px] py-3.5 transition focus-within:border-brand-600">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search doubts — break-even, GST, NPV…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="mt-3.5 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full px-[15px] py-[7px] text-[12.5px] transition ${
                  cat === c
                    ? 'bg-brand-600 font-bold text-white'
                    : 'bg-slate-100 font-semibold text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-4 space-y-3">
          {filtered.map((f) => {
            const isOpen = openId === f.id
            return (
              <div
                key={f.id}
                className={`overflow-hidden rounded-xl border bg-white transition ${
                  isOpen ? 'border-brand-600' : 'border-slate-200'
                }`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : f.id)}
                  className="flex w-full items-center gap-3.5 px-5 py-[18px] text-left"
                >
                  <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600">
                    {f.category}
                  </span>
                  <span className="min-w-0 flex-1 text-[15px] font-semibold text-slate-900">{f.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition ${
                      isOpen ? 'rotate-180 text-brand-600' : 'text-slate-400'
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-200 px-5 py-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{f.answer}</p>
                    {f.source === 'student' && (
                      <p className="mt-3 text-[11px] font-semibold text-brand-600">
                        Answered by Dr. Desai{f.name ? ` · asked by ${f.name}` : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-slate-400">No matching doubts yet — post yours in the Doubt Box below.</p>
          )}
        </div>

        {/* Doubt Box — Supabase when keyed, localStorage otherwise */}
        {authEnabled ? <SupabaseDoubtBox userId={user?.id} userName={displayName(user)} userEmail={user?.email ?? null} /> : <LocalDoubtBox />}
      </div>
    </>
  )
}

function displayName(user: ReturnType<typeof useAuth>['user']): string | null {
  if (!user) return null
  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined
  return meta?.full_name || meta?.name || user.email || null
}

/* --------------------------------------------------- Supabase Doubt Box ----- */

function SupabaseDoubtBox({
  userId,
  userName,
  userEmail,
}: {
  userId?: string
  userName: string | null
  userEmail: string | null
}) {
  const [text, setText] = useState('')
  const [cat, setCat] = useState<string>(faqCategories[0])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mine, setMine] = useState<Doubt[]>([])

  const reload = () => {
    if (userId) listMyDoubts(userId).then(({ data }) => setMine(data))
  }
  useEffect(reload, [userId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !userId) return
    setBusy(true)
    setError(null)
    const { error } = await postDoubt({
      studentId: userId,
      studentName: userName,
      studentEmail: userEmail,
      category: cat,
      question: text,
    })
    setBusy(false)
    if (error) setError(error)
    else {
      setText('')
      reload()
    }
  }

  const remove = async (id: string) => {
    await deleteDoubt(id)
    reload()
  }

  return (
    <>
      <Reveal className="mt-12">
        <h2 className="h2-marker text-[28px]">Doubt Box</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Post a doubt and Dr. Desai will answer it. Once answered it appears in the public{' '}
          <span className="font-semibold">Answered doubts</span> feed above for everyone to learn from.
        </p>
      </Reveal>
      <form onSubmit={submit} className="cl-card mt-4 p-6">
        <label className="block">
          <span className="text-[12.5px] font-semibold text-slate-600">Subject</span>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="mt-1.5 w-full rounded-[9px] border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-600"
          >
            {faqCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 block">
          <span className="text-[12.5px] font-semibold text-slate-600">Your doubt</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your commerce doubt here…"
            rows={4}
            className="mt-1.5 w-full rounded-[9px] border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-600"
          />
        </label>
        {error && <p className="mt-2 text-sm text-rose-500">{error}</p>}
        <button
          type="submit"
          disabled={!text.trim() || busy}
          className="btn-accent mt-4 px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Post doubt
        </button>
      </form>

      {mine.length > 0 && (
        <div className="mt-8">
          <h3 className="flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            <Inbox className="h-4 w-4" /> Your doubts
          </h3>
          <div className="mt-3 space-y-3">
            {mine.map((d) => {
              const done = d.status === 'answered'
              return (
                <div key={d.id} className="cl-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">{d.question}</p>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        done ? 'bg-mint-100 text-mint-600' : 'bg-sun-100 text-sun-600'
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {done ? 'Answered' : 'Pending'}
                    </span>
                  </div>
                  {done && d.answer && (
                    <p className="mt-2.5 whitespace-pre-wrap border-t border-slate-100 pt-2.5 text-sm leading-relaxed text-slate-600">
                      {d.answer}
                    </p>
                  )}
                  {!done && (
                    <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-slate-100 pt-2.5">
                      <span className="text-xs text-slate-400">Waiting for an answer</span>
                      <button
                        onClick={() => remove(d.id)}
                        className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

/* ------------------------------------------- localStorage Doubt Box (dormant) */

function LocalDoubtBox() {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [doubts, setDoubts] = useState<LocalDoubt[]>([])

  useEffect(() => setDoubts(loadLocalDoubts()), [])

  const save = (list: LocalDoubt[]) => {
    setDoubts(list)
    try {
      localStorage.setItem(STORE, JSON.stringify(list))
    } catch {
      /* ignore */
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const d: LocalDoubt = {
      id: Date.now(),
      name: name.trim() || 'Anonymous',
      text: text.trim(),
      at: new Date().toLocaleDateString('en-IN'),
    }
    save([d, ...doubts])
    setText('')
  }

  const remove = (id: number) => save(doubts.filter((d) => d.id !== id))

  const mailtoFor = (d: LocalDoubt) =>
    `mailto:${contact.email}?subject=${encodeURIComponent('Doubt from an AccrualSense student')}&body=${encodeURIComponent(`${d.text}\n\n— ${d.name}`)}`

  return (
    <>
      <Reveal className="mt-12">
        <h2 className="h2-marker text-[28px]">Doubt Box</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Post a doubt — it’s saved on this device. Use “Email to Dr. Desai” to send it across; the best ones
          become public answers above.
        </p>
      </Reveal>
      <form onSubmit={submit} className="cl-card mt-4 p-6">
        <label className="block">
          <span className="text-[12.5px] font-semibold text-slate-600">Your name (optional)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Leave blank to stay anonymous"
            className="mt-1.5 w-full rounded-[9px] border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-600"
          />
        </label>
        <label className="mt-4 block">
          <span className="text-[12.5px] font-semibold text-slate-600">Your doubt</span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your commerce doubt here…"
            rows={4}
            className="mt-1.5 w-full rounded-[9px] border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-600"
          />
        </label>
        <button
          type="submit"
          disabled={!text.trim()}
          className="btn-accent mt-4 px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" /> Post doubt
        </button>
      </form>

      {doubts.length > 0 && (
        <div className="mt-8">
          <h3 className="flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            <Inbox className="h-4 w-4" /> Your posted doubts
          </h3>
          <div className="mt-3 space-y-3">
            {doubts.map((d) => (
              <div key={d.id} className="cl-card p-4">
                <p className="text-sm text-slate-700">{d.text}</p>
                <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-slate-100 pt-2.5">
                  <span className="text-xs text-slate-400">
                    {d.name} · {d.at}
                  </span>
                  <div className="flex items-center gap-1">
                    <a
                      href={mailtoFor(d)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-brand-600 hover:bg-brand-50"
                    >
                      <Mail className="h-3.5 w-3.5" /> Email to Dr. Desai
                    </a>
                    <button
                      onClick={() => remove(d.id)}
                      className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
