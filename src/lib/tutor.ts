/* ----------------------------------------------------------------------------
   Client for the AI doubt-tutor.

   - In local dev (`vite dev`) it returns a MOCK reply and makes NO network call —
     so the chat is demoable offline with zero egress and no key.
   - In production it POSTs to the `/api/tutor` Edge Function, which talks to the
     LLM provider server-side. The function returns 503 until a key is configured,
     and this client surfaces that as a friendly "not switched on yet" state.
---------------------------------------------------------------------------- */

/* OpenAI-compatible multimodal content parts. A user message is either a plain
   string (text-only) or an array of parts (text + images) when files are attached. */
export type TutorTextPart = { type: 'text'; text: string }
export type TutorImagePart = { type: 'image_url'; image_url: { url: string } }
export type TutorContentPart = TutorTextPart | TutorImagePart

export type TutorMessage = { role: 'user' | 'assistant'; content: string | TutorContentPart[] }

/** Flatten any message content to readable text (for previews, the mock, etc.). */
export function contentToText(content: string | TutorContentPart[]): string {
  if (typeof content === 'string') return content
  return content
    .filter((p): p is TutorTextPart => p.type === 'text')
    .map((p) => p.text)
    .join('\n')
}

export type TutorResult =
  | { ok: true; reply: string }
  | { ok: false; kind: 'not_configured' | 'rate_limited' | 'error'; message: string }

/** True only in `vite dev`; false in the production build. */
export const TUTOR_IS_MOCK = import.meta.env.DEV

function mockReply(messages: TutorMessage[]): string {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  const last = (lastUser ? contentToText(lastUser.content).trim() : '') || 'your question'
  const images = Array.isArray(lastUser?.content)
    ? lastUser!.content.filter((p) => p.type === 'image_url').length
    : 0
  const attachLine =
    images > 0
      ? `I can see you attached ${images} image${images > 1 ? 's' : ''} — once deployed, I'll read ${images > 1 ? 'them' : 'it'} too.`
      : 'Attach a photo of a sum, a PDF or notes and I’ll work through them once deployed.'
  return [
    '👋 This is a local preview of the AI doubt-tutor — no model is called on your machine.',
    '',
    `Once deployed with a free API key, I'll answer “${last}” step by step, in Dr. Desai's teaching style.`,
    attachLine,
    '',
    'For now, try the calculators (they show full working) and the Formula Sheets for revision.',
  ].join('\n')
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function safeJson(res: Response): Promise<Record<string, unknown> | null> {
  try {
    return (await res.json()) as Record<string, unknown>
  } catch {
    return null
  }
}

export async function askTutor(messages: TutorMessage[]): Promise<TutorResult> {
  if (TUTOR_IS_MOCK) {
    await delay(450)
    return { ok: true, reply: mockReply(messages) }
  }

  try {
    const res = await fetch('/api/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })

    if (res.status === 503) {
      return { ok: false, kind: 'not_configured', message: 'The AI tutor isn’t switched on yet.' }
    }
    if (res.status === 429) {
      const d = await safeJson(res)
      return { ok: false, kind: 'rate_limited', message: (d?.message as string) || 'Please wait a moment and try again.' }
    }
    if (!res.ok) {
      const d = await safeJson(res)
      return { ok: false, kind: 'error', message: (d?.message as string) || 'The tutor had trouble answering. Please try again.' }
    }

    const data = await safeJson(res)
    const reply = (data?.reply as string) || ''
    if (!reply) return { ok: false, kind: 'error', message: 'The tutor returned an empty answer. Please try rephrasing.' }
    return { ok: true, reply }
  } catch {
    return { ok: false, kind: 'error', message: 'Could not reach the tutor. Please check your connection and try again.' }
  }
}
