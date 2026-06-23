# CommerceLab — *by Dr. Mehulkumar Desai*

A free learning hub for every commerce student in India (B.Com, M.Com, BBA, BCA, and
CA/CS/CMA aspirants). The **2.0 redesign** of the original portfolio.

> The original v1 (built solely by the owner) lives untouched at
> [Jeet-Desai/Mehul-Portfolio](https://github.com/Jeet-Desai/Mehul-Portfolio) —
> live at https://jeet-desai.github.io/Mehul-Portfolio/

## What it is

Not just a portfolio — a tool students open every week, especially before exams. Live today:
**18 step-by-step calculators**, **practice quizzes**, **formula sheets**, a **career guide**, a
**notice board**, and an **AI doubt-tutor**. Light/dark mode throughout. See [`ROADMAP.md`](./ROADMAP.md)
for the full plan and phases.

## Tech stack

- **Vite + React + TypeScript** — 100% client-side; content lives in `src/data/*` (data-driven).
- **Tailwind CSS v4** (CSS-first config in `src/index.css`; dark mode via neutral-ramp inversion).
- **React Router** · **Recharts** (lazy-loaded charts) · **Framer Motion** · **lucide-react**.
- **AI doubt-tutor** (optional): a **Vercel Edge Function** (`api/tutor.ts`) proxying any
  OpenAI-compatible API — defaults to the **Groq** free tier. Dormant until a key is set; see
  [`docs/AI_TUTOR.md`](./docs/AI_TUTOR.md). No database, no Firebase.

## Develop

```bash
pnpm install      # install dependencies
pnpm dev          # start the dev server (http://localhost:5173)
pnpm build        # type-check + production build
pnpm preview      # preview the production build
```

## Deploy (Vercel)

The app is a static SPA + one optional Edge Function — Vercel needs **zero config**.

1. **Import the repo** at [vercel.com/new](https://vercel.com/new). Framework preset **Vite** is
   auto-detected: build `pnpm build`, output `dist`. `vercel.json` already handles SPA routing, and
   `/api/*` is served as a function before the catch-all rewrite.
2. **Deploy.** The whole site works immediately. The AI tutor shows a friendly "not switched on yet"
   until you add a key.
3. **(Optional) Switch on the AI tutor** — add `LLM_API_KEY` (free Groq key) in
   **Settings → Environment Variables** and redeploy. Full steps: [`docs/AI_TUTOR.md`](./docs/AI_TUTOR.md).

> The key lives only in Vercel — never committed, never on a local machine. In `pnpm dev` the tutor
> uses a local mock and makes no network calls.

## Project structure

```
api/
  tutor.ts        # Vercel Edge Function — OpenAI-compatible AI-tutor proxy (optional)
src/
  components/     # Navbar, Footer, Layout, TutorChat, shared calc/ UI
  pages/          # Home, About, Research, LearnHub, Formulas, Practice, Ask, Career, NoticeBoard, ...
  calculators/    # one component per tool, lazy-registered in registry.ts
  lib/            # pure math + helpers (finance, incomeTax, capitalGains, tds, gstItc, chartTheme, tutor)
  data/           # site content — single source of truth (formulas, notices, quizzes, careers, faq)
public/           # images, resume, favicon
docs/AI_TUTOR.md  # how to switch the tutor on
```
