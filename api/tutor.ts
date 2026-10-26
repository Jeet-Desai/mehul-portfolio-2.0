/* ----------------------------------------------------------------------------
   CommerceLab AI doubt-tutor — serverless proxy (Vercel Edge Function).

   PROVIDER-AGNOSTIC: this targets any OpenAI-compatible /chat/completions API.
   Defaults to the Groq free tier (open models, no credit card). Switch provider
   purely with env vars — no code change:

     LLM_API_KEY        (required to switch the tutor ON; if absent → 503 "not configured")
     LLM_BASE_URL       default https://api.groq.com/openai/v1
     LLM_MODEL          default openai/gpt-oss-120b       (text-only questions)
     LLM_VISION_MODEL   default qwen/qwen3.8-27b          (multimodal — Groq)
                        (used automatically when a message includes an image)

   NOTE (Oct 2026): Groq retired llama-3.3-70b-versatile (16 Aug) and
   qwen/qwen3.6-27b (14 Sep), so every question returned an upstream error.
   Defaults are now openai/gpt-oss-120b (text) and qwen/qwen3.8-27b (vision).
   If Groq deprecates a model again,
   check https://console.groq.com/docs/deprecations and update the default here
   (or set LLM_MODEL / LLM_VISION_MODEL in Vercel to a currently-served model).

   Students can attach images (sent to the vision model), and PDFs/.txt whose
   text is extracted in the browser and arrives as plain text — see
   src/lib/attachments.ts. Groq has no native document ingestion, so only images
   travel as binary; everything else is already text by the time it reaches here.

   The API key lives ONLY in Vercel's env-var dashboard — never in the repo, never
   on a local disk. Locally the client uses a mock (see src/lib/tutor.ts), so this
   function is never invoked in `vite dev` and makes zero network calls from a dev
   machine. It stays dormant until a key is set in Vercel.

   NOTE: the rate limiter below is per-isolate (best-effort). For durable limits
   across instances, back it with Vercel KV / Upstash Redis.
---------------------------------------------------------------------------- */

export const config = { runtime: 'edge' }

const SYSTEM_PROMPT = `You are the CommerceLab AI doubt-tutor, built in the teaching style of Dr. Mehulkumar Desai — a professor of Commerce with 22 years of experience (specialism: Cost & Management Accounting). You help Indian commerce students: B.Com, M.Com, BBA, BCA and CA / CS / CMA aspirants. You are a specialist commerce teacher, NOT a generic assistant — a student should feel your answer is clearer, more methodical and more exam-ready than a general chatbot's.

DEFAULT BEHAVIOUR — teach, don't interrogate:
- The student will often type very little ("explain this", "solve", "help", or just attach a photo of a sum). Do NOT ask them to rephrase or write a longer prompt. Infer what they need and teach it fully. Only ask a clarifying question if the task is genuinely impossible to attempt.
- If an image or file is attached, assume it is an academic commerce problem, sum, question or notes. READ it and WORK THROUGH it — do not merely describe the picture. (Describe an image only if it is clearly not academic content.)

HOW TO ANSWER (the Dr. Desai method) — for any concept or numerical, structure it like a teacher at the board:
1. Start with one plain-language line stating what the topic/problem is about.
2. **Concept** — explain the idea simply, in your own words, before any maths. Name the governing principle, standard or section where relevant (e.g. AS/Ind AS, the Companies Act, the Income-tax Act, GST law, ICAI/ICSI/ICMAI syllabus terms) so the student knows the authority behind it.
3. **Formula / rule** — state it clearly.
4. **Step-by-step working** — number the steps. Identify the given data, substitute values, and show each line of calculation. Use ₹ for money and Indian number formatting (lakh/crore) where natural.
5. **Answer** — state the final result in **bold**.
6. **Note / exam tip** — a short takeaway, common mistake to avoid, or where this is tested. Keep it brief.
Adapt the depth to the question: a one-line definition doesn't need all six parts, but a numerical or "explain" request should be thorough and easy to follow.

FORMATTING — your replies are rendered as Markdown, so format for clarity:
- Use short bold sub-headings (e.g. **Concept**, **Working**, **Answer**), numbered lists for steps, and bullets for lists.
- For any tabular working — ledger accounts, cost sheets, trial balances, comparative statements, amortisation/depreciation schedules — use a Markdown pipe table. It renders as a real table.
- Use \`inline code\` or fenced code only for actual formulae/expressions if it aids clarity. Bold the key terms and the final answer. Keep paragraphs short.
- NEVER use LaTeX or any maths markup — no math delimiters, no commands such as text{}, frac{}, times or boxed{}. The chat cannot render them and the student would see raw code. Write every formula in plain text on its own line using × ÷ + − = and ₹, e.g. **Cost of Production = Works Cost + Opening WIP − Closing WIP**, and show substitutions the same way: ₹16,80,000 + ₹1,80,000 = ₹18,60,000.

LANGUAGE:
- Reply in English by default. If the student writes in Hindi or Gujarati, or asks you to, reply fully in that language (keep technical terms recognisable).

SCOPE:
- Commerce, accounting, costing, financial management, economics, business studies, taxation, auditing, and related exams/careers. If a question is clearly outside this, gently say so and steer back.

ACCURACY — you represent a real professor, so be trustworthy:
- Ground explanations in reliable, official sources: name the relevant standard, section or authority. For live figures, point students to the official source (incometax.gov.in, cbic.gov.in, mca.gov.in, ICAI/ICSI/ICMAI) or CommerceLab's calculators.
- Do NOT assert specific current tax slabs, rates, due dates or statutory thresholds as definitive — these change with each Budget. Teach the concept and method, and tell the student to confirm the live figure.
- NEVER invent a citation, section number, standard, case name or figure. If you are unsure, say so honestly rather than guessing.`

const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 12
const hits = new Map<string, number[]>()

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const apiKey = process.env.LLM_API_KEY
  const baseUrl = (process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '')
  const textModel = process.env.LLM_MODEL || 'openai/gpt-oss-120b'
  const visionModel = process.env.LLM_VISION_MODEL || 'qwen/qwen3.8-27b'

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
          (m): m is { role: 'user' | 'assistant'; content: unknown } =>
            !!m &&
            ((m as { role?: unknown }).role === 'user' || (m as { role?: unknown }).role === 'assistant'),
        )
        .slice(-12) // keep recent context only
        .map((m) => ({ role: m.role, content: sanitizeContent(m.content) }))
        .filter((m) => m.content !== null)
    : []

  if (messages.length === 0) return json({ error: 'empty' }, 400)

  // Any image present → use the vision-capable model; otherwise the text model.
  const hasImage = messages.some(
    (m) => Array.isArray(m.content) && m.content.some((p) => (p as { type?: string }).type === 'image_url'),
  )
  const model = hasImage ? visionModel : textModel

  // The Groq vision model (qwen/qwen3.8-27b) is a REASONING model: by default it
  // emits its chain-of-thought in <think>…</think> before the answer. Ask Groq to
  // hide it so students only see the final answer. Harmless on non-reasoning models,
  // but we only send it for the vision model to avoid any provider-specific 400.
  const payload: Record<string, unknown> = {
    model,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    temperature: 0.3,
    // Reasoning models spend part of the budget on hidden thinking before the
    // answer, so give the vision path more headroom to avoid a truncated reply.
    // The text model (gpt-oss) also reasons first, and those tokens count against
    // max_tokens — 900 could leave nothing for the answer itself.
    max_tokens: 2200,
  }
  if (hasImage) payload.reasoning_format = 'hidden'
  // gpt-oss: 'low' made it rush multi-step sums (a dropped figure, a mis-added
  // total). Accuracy matters more than speed for a tutor, so think a bit longer — but keep
  // replies fast and cheap against the free-tier token limits.
  else if (model.startsWith('openai/gpt-oss')) payload.reasoning_effort = 'medium'

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!upstream.ok) {
      const detail = (await upstream.text()).slice(0, 300)
      // Surface upstream failures in Vercel logs — a model deprecation (e.g. a
      // decommissioned vision model) shows up here as a 4xx/5xx from Groq.
      console.error(`[tutor] upstream ${upstream.status} (model=${model}): ${detail}`)
      return json(
        { error: 'upstream', status: upstream.status, message: 'The tutor had trouble answering just now. Please try again.', detail },
        502,
      )
    }

    const data = (await upstream.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const reply = stripReasoning(data?.choices?.[0]?.message?.content || '')
    if (!reply) return json({ error: 'empty_reply', message: 'The tutor returned an empty answer. Please try rephrasing.' }, 502)

    return json({ reply })
  } catch {
    return json({ error: 'network', message: 'Could not reach the tutor service. Please try again.' }, 502)
  }
}

/**
 * Strip a reasoning model's chain-of-thought from the reply. Belt-and-suspenders
 * for `reasoning_format: 'hidden'`: if a provider ignores that flag (or a future
 * model default changes), we still never show students the raw <think> block.
 * Handles a full <think>…</think> pair, and a dangling </think> with no opener
 * (reasoning that ran up to the answer). No-op on clean answers.
 */
function stripReasoning(text: string): string {
  let out = text.replace(/<think>[\s\S]*?<\/think>/gi, '')
  // Opener stripped/absent but a closer remains → drop everything up to it.
  if (/<\/think>/i.test(out)) out = out.replace(/^[\s\S]*?<\/think>/i, '')
  // Any stray unmatched opener → drop from it to the end (never leak partial CoT).
  out = out.replace(/<think>[\s\S]*$/i, '')
  return out.trim()
}

type TextPart = { type: 'text'; text: string }
type ImagePart = { type: 'image_url'; image_url: { url: string } }
type Part = TextPart | ImagePart

/**
 * Normalise one message's content. Accepts a plain string or an array of
 * OpenAI-style parts (text + image_url). Caps text length and image count,
 * and only allows data:/http(s) image URLs. Returns null if nothing usable.
 */
function sanitizeContent(content: unknown): string | Part[] | null {
  if (typeof content === 'string') {
    const t = content.slice(0, 4000)
    return t.trim() ? t : null
  }
  if (!Array.isArray(content)) return null

  const parts: Part[] = []
  let images = 0
  for (const raw of content) {
    const type = (raw as { type?: unknown })?.type
    if (type === 'text' && typeof (raw as { text?: unknown }).text === 'string') {
      const t = (raw as { text: string }).text.slice(0, 4000)
      if (t.trim()) parts.push({ type: 'text', text: t })
    } else if (type === 'image_url' && images < 5) {
      const url = (raw as { image_url?: { url?: unknown } }).image_url?.url
      if (typeof url === 'string' && (url.startsWith('data:image/') || /^https?:\/\//.test(url))) {
        parts.push({ type: 'image_url', image_url: { url } })
        images++
      }
    }
  }
  return parts.length ? parts : null
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
