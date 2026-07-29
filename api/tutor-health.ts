/* ----------------------------------------------------------------------------
   AI doubt-tutor — provider health check (Vercel Edge Function + Cron).

   Why this exists: the tutor talks to Groq, and Groq periodically DEPRECATES and
   shuts down models (e.g. the old vision default meta-llama/llama-4-scout-17b-16e-
   instruct, shut down Jun 2026). When that happens the model just starts returning
   errors — nothing in our code changes, and because `vite dev` mocks the tutor with
   zero egress, no local/CI test ever calls the live provider. So a shutdown was only
   discovered when a student hit it in production.

   This endpoint fires a tiny real request at BOTH the text and vision models and
   reports which are alive. Run it on a schedule (see vercel.json `crons`) so a dead
   model shows up in Vercel logs (and any uptime monitor watching this URL) instead
   of a student finding it. It uses ~a handful of tokens per run.

   Access:
     - GET only.
     - If CRON_SECRET is set, requires `Authorization: Bearer <CRON_SECRET>` — Vercel
       Cron sends this automatically. This stops the public from burning the API quota.
       (During first-time setup, before you set CRON_SECRET, it's open so you can curl it.)

   Responses:
     200 { status: 'dormant' }                         — no LLM_API_KEY (tutor off)
     200 { status: 'ok', models: {...} }                — every probed model answered
     503 { status: 'degraded', models: {...} }          — at least one model is down
---------------------------------------------------------------------------- */

export const config = { runtime: 'edge' }

// Smallest possible valid image: a 1x1 transparent PNG as a data URL. Enough to
// exercise the vision model's image path without shipping real pixels.
const PIXEL_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

type ProbeResult = { model: string; ok: boolean; status: number; detail?: string }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') return json({ error: 'method_not_allowed' }, 405)

  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization') || ''
    if (auth !== `Bearer ${cronSecret}`) return json({ error: 'unauthorized' }, 401)
  }

  const apiKey = process.env.LLM_API_KEY
  const baseUrl = (process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '')
  const textModel = process.env.LLM_MODEL || 'llama-3.3-70b-versatile'
  const visionModel = process.env.LLM_VISION_MODEL || 'qwen/qwen3.6-27b'

  // Dormant until a key is configured — mirrors api/tutor.ts. Not a failure.
  if (!apiKey) return json({ status: 'dormant', message: 'No LLM_API_KEY set — tutor is off.' })

  const [text, vision] = await Promise.all([
    probe(baseUrl, apiKey, textModel, [{ role: 'user', content: 'ping' }]),
    probe(baseUrl, apiKey, visionModel, [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'reply with the single word: ok' },
          { type: 'image_url', image_url: { url: PIXEL_PNG } },
        ],
      },
    ]),
  ])

  const models = { text, vision }
  const healthy = text.ok && vision.ok
  if (!healthy) {
    // Surface in Vercel logs so a dead model is greppable / alertable.
    console.error(`[tutor-health] DEGRADED ${JSON.stringify(models)}`)
    return json({ status: 'degraded', models }, 503)
  }
  return json({ status: 'ok', models })
}

async function probe(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: unknown[],
): Promise<ProbeResult> {
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, max_tokens: 5, temperature: 0 }),
    })
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 200)
      return { model, ok: false, status: res.status, detail }
    }
    return { model, ok: true, status: res.status }
  } catch (e) {
    return { model, ok: false, status: 0, detail: e instanceof Error ? e.message : 'network error' }
  }
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
