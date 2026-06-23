/* ----------------------------------------------------------------------------
   CommerceLab AI doubt-tutor — serverless proxy (Vercel Edge Function).

   PROVIDER-AGNOSTIC: this targets any OpenAI-compatible /chat/completions API.
   Defaults to the Groq free tier (open models, no credit card). Switch provider
   purely with env vars — no code change:

     LLM_API_KEY    (required to switch the tutor ON; if absent → 503 "not configured")
     LLM_BASE_URL   default https://api.groq.com/openai/v1
     LLM_MODEL      default llama-3.3-70b-versatile

   The API key lives ONLY in Vercel's env-var dashboard — never in the repo, never
   on a local disk. Locally the client uses a mock (see src/lib/tutor.ts), so this
   function is never invoked in `vite dev` and makes zero network calls from a dev
   machine. It stays dormant until a key is set in Vercel.

   NOTE: the rate limiter below is per-isolate (best-effort). For durable limits
   across instances, back it with Vercel KV / Upstash Redis.
---------------------------------------------------------------------------- */

export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `You are the CommerceLab AI doubt-tutor, built in the teaching style of Dr. Mehulkumar Desai, a professor of Commerce with 22 years of experience (specialism: Cost & Management Accounting). You help Indian commerce students — B.Com, M.Com, BBA, BCA, and CA / CS / CMA aspirants.

How you teach:
- Be encouraging, clear and practical. Explain the METHOD, not just the final answer — show step-by-step working like a teacher at the board.
- Use simple language and small worked numerical examples where helpful. Use ₹ for money.
- Stay India-first (Indian syllabi, standards and terminology).
- If the student writes in Hindi or Gujarati, or asks you to, reply in that language. Otherwise reply in English.

Scope:
- Answer questions about commerce, accounting, costing, financial management, economics, business studies, taxation and related exams/careers.
- If a question is clearly outside commerce/business, gently say it's outside your area and steer back.

Accuracy (important — you represent a real professor):
- Do NOT state specific current tax slabs, rates, due dates or statutory thresholds as definitive — these change with each Budget. Explain the concept and method, and tell the student to confirm live figures on the official source (incometax.gov.in, cbic.gov.in, ICAI/ICSI/ICMAI) or use CommerceLab's calculators.
- If you are unsure, say so honestly rather than inventing facts.
- Keep answers focused and reasonably concise.`

const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 12
const hits = new Map<string, number[]>()

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const apiKey = process.env.LLM_API_KEY
  const baseUrl = (process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '')
  const model = process.env.LLM_MODEL || 'llama-3.3-70b-versatile'

  // Dormant until a key is configured in the host's env. Degrades gracefully.
  if (!apiKey) {
    return json(
      { error: 'not_configured', message: 'The AI tutor is not switched on yet.' },
      503,
    )
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(ip)) {
    return json(
      { error: 'rate_limited', message: 'That’s a lot of questions in a short time — please wait a moment and try again.' },
      429,
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return json({ error: 'bad_request' }, 400)
  }

  const incoming = (body as { messages?: unknown })?.messages
  const messages = Array.isArray(incoming)
    ? incoming
        .filter(
          (m): m is { role: 'user' | 'assistant'; content: string } =>
            !!m &&
            typeof (m as { content?: unknown }).content === 'string' &&
            ((m as { role?: unknown }).role === 'user' || (m as { role?: unknown }).role === 'assistant'),
        )
        .slice(-12) // keep recent context only
        .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    : []

  if (messages.length === 0) return json({ error: 'empty' }, 400)

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.3,
        max_tokens: 900,
      }),
    })

    if (!upstream.ok) {
      const detail = (await upstream.text()).slice(0, 300)
      return json(
        { error: 'upstream', status: upstream.status, message: 'The tutor had trouble answering just now. Please try again.', detail },
        502,
      )
    }

    const data = (await upstream.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const reply = data?.choices?.[0]?.message?.content?.trim() || ''
    if (!reply) return json({ error: 'empty_reply', message: 'The tutor returned an empty answer. Please try rephrasing.' }, 502)

    return json({ reply })
  } catch {
    return json({ error: 'network', message: 'Could not reach the tutor service. Please try again.' }, 502)
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > MAX_PER_WINDOW
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
