# AI doubt-tutor — how to switch it on

The tutor is **built but dormant**. Nothing runs the model on a local machine — in
`vite dev` the chat uses a mock and makes **zero network calls**. It only goes live
once you add a key in Vercel and deploy. No code change is needed to turn it on.

## What's in the repo
- `api/tutor.ts` — Vercel **Edge Function**. A provider-agnostic proxy to any
  OpenAI-compatible `/chat/completions` endpoint. Holds the system prompt (Dr. Desai's
  teaching persona) server-side, sanitises input, and rate-limits per IP (best-effort).
- `src/lib/tutor.ts` — client. Mock in dev; calls `/api/tutor` in production.
- `src/components/TutorChat.tsx` — the chat UI on `/ask`.
- `.env.example` — the three env vars (documentation only; no secrets).

## Switch it on (≈ 5 minutes, free, no credit card)

1. **Get a free Groq key.** Sign in at <https://console.groq.com> (Google/GitHub login,
   no card) → **API Keys** → create a key. Copy it.
2. **Add it to Vercel.** Project → **Settings → Environment Variables**, add:
   - `LLM_API_KEY` = your Groq key  *(required)*
   - `LLM_BASE_URL` = `https://api.groq.com/openai/v1`  *(optional — this is the default)*
   - `LLM_MODEL` = `llama-3.3-70b-versatile`  *(optional — this is the default)*
3. **Redeploy** (Deployments → Redeploy, or push a commit). The `/ask` chat is now live.

The key lives only in Vercel. It is never committed and never written to a local file.

## Use a different free provider
The proxy speaks the OpenAI format, so just change the env vars — no code change:
- **OpenRouter** — `LLM_BASE_URL=https://openrouter.ai/api/v1`, pick a `:free` model id.
- **Cerebras** — `LLM_BASE_URL=https://api.cerebras.ai/v1`, set a supported `LLM_MODEL`.

## Notes / future hardening
- **Rate limiting** in `api/tutor.ts` is per-isolate (resets per cold start). For durable
  limits across instances, back `isRateLimited` with Vercel KV / Upstash Redis.
- The model is told **not** to assert live tax slabs/rates as fact (they change each Budget)
  and to point students at official sources / the calculators. Keep that guard if you edit
  the system prompt.
- Want streaming replies? Switch the upstream call to `stream: true` and pipe the response
  body through; the current version is non-streaming for simplicity and robustness.
