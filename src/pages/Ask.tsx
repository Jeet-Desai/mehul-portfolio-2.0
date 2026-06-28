import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  ChevronDown,
  Send,
  Inbox,
  Trash2,
  Mail,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import TutorChat from '../components/TutorChat'
import { faqs, faqCategories } from '../data/faq'
import { contact } from '../data/site'

type Doubt = { id: number; name: string; text: string; at: string }
const STORE = 'cl-doubts'

function loadDoubts(): Doubt[] {
  try {
    return JSON.parse(localStorage.getItem(STORE) || '[]')
  } catch {
    return []
  }
}

export default function Ask() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('All')
  const [openId, setOpenId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [doubts, setDoubts] = useState<Doubt[]>([])

  useEffect(() => setDoubts(loadDoubts()), [])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return faqs.filter(
      (f) =>
        (cat === 'All' || f.category === cat) &&
        (!term || (f.question + ' ' + f.answer).toLowerCase().includes(term)),
    )
  }, [q, cat])

  const save = (list: Doubt[]) => {
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
    const d: Doubt = { id: Date.now(), name: name.trim() || 'Anonymous', text: text.trim(), at: new Date().toLocaleDateString('en-IN') }
    save([d, ...doubts])
    setText('')
  }

  const remove = (id: number) => save(doubts.filter((d) => d.id !== id))

  const mailtoFor = (d: Doubt) =>
    `mailto:${contact.email}?subject=${encodeURIComponent('Doubt from an AccrualSense student')}&body=${encodeURIComponent(`${d.text}\n\n— ${d.name}`)}`

  return (
    <>
      <PageHeader
        eyebrow="Ask AccrualSense"
        title="Your commerce doubt-tutor"
        subtitle="Ask the AI tutor for instant step-by-step help, browse worked answers to common doubts, or post your own."
      />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* AI doubt-tutor */}
        <div className="mb-12">
          <TutorChat />
        </div>

        {/* FAQ */}
        <h2 className="text-xl font-bold">Answered doubts</h2>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search doubts — break-even, GST, NPV…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(['All', ...faqCategories] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                cat === c ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {filtered.map((f) => {
            const isOpen = openId === f.id
            return (
              <div key={f.id} className="cl-card overflow-hidden p-0 hover:translate-y-0">
                <button onClick={() => setOpenId(isOpen ? null : f.id)} className="flex w-full items-center gap-3 p-5 text-left">
                  <span className="cl-pill bg-brand-50 text-brand-700 !px-2.5 !py-0.5 !text-xs">{f.category}</span>
                  <span className="min-w-0 flex-1 font-semibold text-slate-800">{f.question}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && <p className="border-t border-slate-100 p-5 text-sm leading-relaxed text-slate-600">{f.answer}</p>}
              </div>
            )
          })}
          {filtered.length === 0 && <p className="text-sm text-slate-500">No matching doubts yet — try the Doubt Box below.</p>}
        </div>

        {/* Doubt Box */}
        <h2 className="mt-12 text-xl font-bold">Doubt Box</h2>
        <p className="mt-1 text-sm text-slate-500">
          Post a doubt — it’s saved on this device. Use “Email to Dr. Desai” to send it across; the best ones
          become public FAQs above.
        </p>
        <form onSubmit={submit} className="mt-4 cl-card p-6 hover:translate-y-0">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional — leave blank to stay anonymous)"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your commerce doubt here…"
            rows={4}
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-40"
          >
            <Send className="h-4 w-4" /> Post doubt
          </button>
        </form>

        {doubts.length > 0 && (
          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
              <Inbox className="h-4 w-4" /> Your posted doubts
            </h3>
            <div className="mt-3 space-y-3">
              {doubts.map((d) => (
                <div key={d.id} className="cl-card p-4 hover:translate-y-0">
                  <p className="text-sm text-slate-700">{d.text}</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">{d.name} · {d.at}</span>
                    <div className="flex items-center gap-1">
                      <a href={mailtoFor(d)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50">
                        <Mail className="h-3.5 w-3.5" /> Email to Dr. Desai
                      </a>
                      <button onClick={() => remove(d.id)} className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500" aria-label="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
