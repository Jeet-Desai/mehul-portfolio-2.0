import { useEffect, useRef, useState } from 'react'
import {
  Sparkles,
  Send,
  Loader2,
  User,
  Info,
  Paperclip,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react'
import {
  askTutor,
  contentToText,
  TUTOR_IS_MOCK,
  type TutorMessage,
  type TutorContentPart,
} from '../lib/tutor'
import {
  processFile,
  classify,
  formatBytes,
  ACCEPT_ATTR,
  MAX_IMAGES,
  type Attachment,
  type AttachmentKind,
} from '../lib/attachments'
import Markdown from './Markdown'

const SUGGESTIONS = [
  'Explain break-even point with a simple example',
  'Difference between FIFO and LIFO?',
  'How does HRA exemption work?',
  'NPV vs IRR — when do they disagree?',
]

type ChatAtt = { name: string; kind: AttachmentKind; thumb?: string }
type ChatMsg = TutorMessage & { id: number; display?: string; atts?: ChatAtt[] }

export default function TutorChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const idRef = useRef(0)
  const listRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading, attachments])

  const reading = attachments.some((a) => a.status === 'reading')
  const ready = attachments.filter((a) => a.status === 'ready')

  const pickFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    setFileError(null)
    let imageCount = attachments.filter((a) => a.kind === 'image').length
    const accepted: { file: File; id: string; kind: AttachmentKind }[] = []

    for (const file of Array.from(fileList)) {
      const kind = classify(file)
      if (!kind) {
        setFileError(`"${file.name}" isn’t a supported file — use an image, PDF or .txt.`)
        continue
      }
      if (kind === 'image') {
        if (imageCount >= MAX_IMAGES) {
          setFileError(`You can attach up to ${MAX_IMAGES} images.`)
          continue
        }
        imageCount++
      }
      accepted.push({ file, id: crypto.randomUUID(), kind })
    }

    if (accepted.length === 0) return

    // Show "reading" placeholders immediately, then swap in the processed result.
    setAttachments((prev) => [
      ...prev,
      ...accepted.map(({ file, id, kind }) => ({
        id,
        name: file.name,
        size: file.size,
        kind,
        status: 'reading' as const,
      })),
    ])

    await Promise.all(
      accepted.map(async ({ file, id }) => {
        const result = await processFile(file)
        setAttachments((prev) => prev.map((a) => (a.id === id ? { ...result, id } : a)))
      }),
    )
  }

  const removeAttachment = (id: string) => setAttachments((prev) => prev.filter((a) => a.id !== id))

  const send = async (text: string) => {
    const q = text.trim()
    const usable = attachments.filter((a) => a.status === 'ready')
    if ((!q && usable.length === 0) || loading || reading) return
    setNotice(null)
    setFileError(null)

    const images = usable.filter((a) => a.kind === 'image' && a.dataUrl)
    const docs = usable.filter((a) => a.kind !== 'image' && a.text)

    // Fold extracted PDF/txt text into the prompt the model receives.
    let prompt = q || (usable.length ? 'Please look at what I’ve attached and help me with it.' : '')
    for (const d of docs) {
      const label = d.kind === 'pdf' ? 'PDF' : 'file'
      prompt += `\n\n[Attached ${label} "${d.name}"${d.truncated ? ' — truncated' : ''}]:\n${d.text}`
    }

    const content: string | TutorContentPart[] = images.length
      ? [
          { type: 'text', text: prompt },
          ...images.map((a) => ({ type: 'image_url' as const, image_url: { url: a.dataUrl! } })),
        ]
      : prompt

    const atts: ChatAtt[] = usable.map((a) => ({
      name: a.name,
      kind: a.kind,
      thumb: a.kind === 'image' ? a.dataUrl : undefined,
    }))

    const userMsg: ChatMsg = { id: ++idRef.current, role: 'user', content, display: q, atts }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setAttachments([])
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
  const canSend = !loading && !reading && (input.trim().length > 0 || ready.length > 0)

  return (
    <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white">
      {/* header — ink bar with accent icon tile (inverts to light in dark mode) */}
      <div className="flex items-center gap-4 bg-slate-900 px-6 py-5 text-slate-50">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-[20px] font-semibold leading-tight text-slate-50">
            AI doubt-tutor
          </h2>
          <p className="mt-0.5 text-[13px] opacity-70">
            Step-by-step answers in Dr. Desai's style — in English, हिंदी or ગુજરાતી.
          </p>
        </div>
        {TUTOR_IS_MOCK && (
          <span className="ml-auto shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold">
            Local preview
          </span>
        )}
      </div>

      {/* messages */}
      <div ref={listRef} className="max-h-[26rem] min-h-[12rem] space-y-4 overflow-y-auto px-4 py-6 sm:px-6">
        {empty && (
          <div className="py-2 text-center">
            <p className="text-[16px] font-semibold text-slate-900">
              Ask anything in commerce — accounting, costing, finance, tax, economics.
            </p>
            <p className="mt-1 text-[13px] text-slate-400">
              Stuck on a sum? Attach a photo, a PDF or your notes and ask.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[13px] font-medium text-slate-900 transition hover:border-brand-600 hover:text-brand-600"
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
              <div className="flex max-w-[85%] flex-col items-end gap-1.5">
                {m.atts && m.atts.length > 0 && (
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {m.atts.map((a, i) =>
                      a.thumb ? (
                        <img
                          key={i}
                          src={a.thumb}
                          alt={a.name}
                          className="h-16 w-16 rounded-[10px] border border-slate-200 object-cover"
                        />
                      ) : (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600"
                        >
                          <FileText className="h-3.5 w-3.5 text-brand-600" />
                          <span className="max-w-[10rem] truncate">{a.name}</span>
                        </span>
                      ),
                    )}
                  </div>
                )}
                {(m.display || contentToText(m.content)) && (
                  <div className="ink-card px-4 py-2.5 text-sm">
                    {m.display || contentToText(m.content)}
                  </div>
                )}
              </div>
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500">
                <User className="h-4 w-4" />
              </span>
            </div>
          ) : (
            <div key={m.id} className="flex gap-2.5">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="max-w-[85%] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700">
                <Markdown text={contentToText(m.content)} />
              </div>
            </div>
          ),
        )}

        {loading && (
          <div className="flex gap-2.5">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </div>
          </div>
        )}

        {notice && (
          <div className="flex items-start gap-2 rounded-[10px] bg-sun-50 p-3 text-xs text-sun-600">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}
      </div>

      {/* attachment tray */}
      {(attachments.length > 0 || fileError) && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 pt-3 sm:px-5">
          {fileError && (
            <p className="mb-2 flex items-center gap-1.5 text-xs text-rose-500">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {fileError}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {attachments.map((a) => (
              <AttachmentChip key={a.id} att={a} onRemove={() => removeAttachment(a.id)} />
            ))}
          </div>
        </div>
      )}

      {/* input — footer row on paper */}
      <form
        onSubmit={onSubmit}
        className={`flex items-center gap-3 bg-slate-50 p-4 sm:px-5 ${
          attachments.length > 0 || fileError ? '' : 'border-t border-slate-200'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          className="hidden"
          onChange={(e) => {
            void pickFiles(e.target.files)
            e.target.value = '' // allow re-picking the same file
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Attach an image, PDF or notes"
          title="Attach an image, PDF or notes"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] text-slate-400 transition hover:bg-slate-100 hover:text-brand-600"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your commerce doubt…"
          className="w-full rounded-[10px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-600"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </form>
    </div>
  )
}

function AttachmentChip({ att, onRemove }: { att: Attachment; onRemove: () => void }) {
  const error = att.status === 'error'
  return (
    <span
      className={`group relative inline-flex max-w-[14rem] items-center gap-2 rounded-[10px] border px-2.5 py-1.5 text-xs ${
        error
          ? 'border-rose-200 bg-rose-50 text-rose-600'
          : 'border-slate-200 bg-white text-slate-600'
      }`}
    >
      {att.status === 'reading' ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" />
      ) : error ? (
        <AlertCircle className="h-4 w-4 shrink-0" />
      ) : att.kind === 'image' && att.dataUrl ? (
        <img src={att.dataUrl} alt="" className="h-7 w-7 shrink-0 rounded object-cover" />
      ) : (
        <FileText className="h-4 w-4 shrink-0 text-brand-600" />
      )}
      <span className="min-w-0 leading-tight">
        <span className="block truncate font-medium">{att.name}</span>
        <span className="block text-[11px] opacity-70">
          {error
            ? att.error
            : att.status === 'reading'
              ? 'Reading…'
              : att.kind === 'image'
                ? `Image · ${formatBytes(att.size)}`
                : att.truncated
                  ? 'Text · shortened'
                  : att.kind === 'pdf'
                    ? 'PDF · text read'
                    : 'Text file'}
        </span>
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${att.name}`}
        className="ml-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  )
}
