# AI doubt-tutor — how to switch it on

The tutor is **built but dormant**. Nothing runs the model on a local machine — in
`vite dev` the chat uses a mock and makes **zero network calls**. It only goes live
once you add a key in Vercel and deploy. No code change is needed to turn it on.

## What's in the repo
- `api/tutor.ts` — Vercel **Edge Function**. A provider-agnostic proxy to any
  OpenAI-compatible `/chat/completions` endpoint. Holds the system prompt (Dr. Desai's
  teaching persona) server-side, sanitises input, and rate-limits per IP (best-effort).
- `src/lib/tutor.ts` — client. Mock in dev; calls `/api/tutor` in production.
- `src/lib/attachments.ts` — turns picked files into what the model can read (see *Attachments* below).
- `src/components/TutorChat.tsx` — the chat UI on `/ask`.
- `.env.example` — the env vars (documentation only; no secrets).

## Switch it on (≈ 5 minutes, free, no credit card)

1. **Get a free Groq key.** Sign in at <https://console.groq.com> (Google/GitHub login,
   no card) → **API Keys** → create a key. Copy it.
2. **Add it to Vercel.** Project → **Settings → Environment Variables**, add:
   - `LLM_API_KEY` = your Groq key  *(required)*
   - `LLM_BASE_URL` = `https://api.groq.com/openai/v1`  *(optional — this is the default)*
   - `LLM_MODEL` = `llama-3.3-70b-versatile`  *(optional — text questions; this is the default)*
   - `LLM_VISION_MODEL` = `meta-llama/llama-4-scout-17b-16e-instruct`  *(optional — used
     automatically when a student attaches an image; this is the default)*
3. **Redeploy** (Deployments → Redeploy, or push a commit). The `/ask` chat is now live.

The same free Groq key covers both models — no extra signup. The key lives only in Vercel.
It is never committed and never written to a local file.

## Attachments (images + PDF/.txt)

Students can attach files in the chat (paperclip button). Groq's vision models read
**images only**, so the browser does the rest before anything is sent:

- **Images** (`src/lib/attachments.ts`) are downscaled (longest edge ≤ 2000 px) and
  re-encoded as JPEG so they stay under Groq's **4 MB base64 / 5-images-per-request** limits,
  then sent as `image_url` parts. The proxy auto-switches to `LLM_VISION_MODEL` whenever an
  image is present.
- **PDFs** have their text extracted client-side with **pdf.js** (lazy-loaded — it never
  weighs down the main bundle) and sent as plain text. ⚠️ *Scanned / photo-only PDFs have no
  selectable text (no OCR) — the UI tells the student to snap a photo of the page instead.*
- **.txt** files are read directly.

Extracted text is capped (~12 000 chars/file) and folded into the prompt; the student's
chat bubble shows only their typed question + attachment chips, not the raw dump.

**Want native PDF/Word/Excel ingestion (incl. scanned docs)?** Switch the provider to
**Google Gemini** (also free tier, also OpenAI-compatible — no code change, just point
`LLM_BASE_URL`/`LLM_MODEL`/`LLM_VISION_MODEL` at Gemini). Gemini ingests documents natively,
so you could then drop the client-side pdf.js step.

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
