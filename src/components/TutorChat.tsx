import { useEffect, useRef, useState } from 'react'
import { Sparkles, Send, Loader2, User, Info } from 'lucide-react'
import { askTutor, TUTOR_IS_MOCK, type TutorMessage } from '../lib/tutor'

const SUGGESTIONS = [
  'Explain break-even point with a simple example',
  'Difference between FIFO and LIFO?',
  'How does HRA exemption work?',
  'NPV vs IRR — when do they disagree?',
]

type ChatMsg = TutorMessage & { id: number }

export default function TutorChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const idRef = useRef(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || loading) return
    setNotice(null)
    const userMsg: ChatMsg = { id: ++idRef.current, role: 'user', content: q }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)
    const res = await askTutor(history.map(({ role, content }) => ({ role, content })))
    setLoading(false)
    if (res.ok) {
      setMessages((m) => [...m, { id: ++idRef.current, role: 'assistant', content: res.reply }])
    } else {
      setNotice(res.message)
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void send(input)
  }

  const empty = messages.length === 0

  return (
    <div className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm">
      {/* header */}
      <div className="flex items-center gap-3 bg-gradient-to-br from-brand-500 to-brand-700 px-5 py-4 text-white">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/20">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-bold leading-tight">AI doubt-tutor</h2>
          <p className="text-xs text-white/85">
            Step-by-step answers in Dr. Desai's style — in English, हिंदी or ગુજરાતી.
          </p>
        </div>
        {TUTOR_IS_MOCK && (
          <span className="ml-auto shrink-0 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold">
            Local preview
          </span>
        )}
      </div>

      {/* messages */}
      <div ref={listRef} className="max-h-[26rem] min-h-[12rem] space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
        {empty && (
          <div className="py-4 text-center">
            <p className="text-sm text-slate-500">
              Ask anything in commerce — accounting, costing, finance, tax, economics.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end gap-2.5">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-sm text-white">
                {m.content}
              </div>
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                <User className="h-4 w-4" />
              </span>
            </div>
          ) : (
            <div key={m.id} className="flex gap-2.5">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-slate-100 px-4 py-2.5 text-sm leading-relaxed text-slate-700">
                {m.content}
              </div>
            </div>
          ),
        )}

        {loading && (
          <div className="flex gap-2.5">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-600">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md bg-slate-100 px-4 py-2.5 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </div>
          </div>
        )}

        {notice && (
          <div className="flex items-start gap-2 rounded-xl bg-sun-50 p-3 text-xs text-sun-600">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}
      </div>

      {/* input */}
      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-slate-100 p-3 sm:p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your commerce doubt…"
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          aria-label="Send"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </form>
    </div>
  )
}
