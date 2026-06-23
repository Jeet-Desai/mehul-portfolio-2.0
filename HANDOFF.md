# Handoff — CommerceLab (next session)

The product now spans **every pillar as a real, thin slice** (not just calculators). Read `ROADMAP.md`
for the full vision. Current as of the "full vertical slice" session.

## What this is
**CommerceLab — *by Dr. Mehulkumar Desai*** — a free learning hub for all Indian commerce students
(B.Com/M.Com/BBA/BCA + CA/CS/CMA). Vite + React + TS + **Tailwind v4** + recharts + framer-motion.
100% client-side (no backend). Repo `Jeet-Desai/mehul-portfolio-2.0` (private), branch `main`.

## Direction (IMPORTANT — set by the user this session)
**Breadth over depth.** We stopped adding more calculators (had 16) and built a *full vertical slice*
across the site map instead. Keep new features **client-side + data-driven** (matches the public-shippable,
low-friction goal). Favour making every pillar real before deepening any one.

## Status — what's live now
- ✅ **18 calculators** (`/learn`): break-even · income-tax · GST · EMI · depreciation · SIP · compound-interest ·
  TVM · HRA · WACC · CAGR/XIRR · Capital Budgeting · **Capital Gains** · Ratio Analysis · **TDS section-wise** ·
  **GST ITC set-off** · **Bond pricing & YTM** · **Inventory FIFO/LIFO/WAvg**. (TDS & GST ITC statutory — rates
  web-verified Jun 2026; see notes below.)
- ✅ **Formula Sheets** (`/formulas`) — searchable cheat-sheets, ~48 formulas grouped by 6 subjects
  (`src/data/formulas.ts`), each linked to its calculator. Tax kept *structural* (no slab numbers — they change).
  Entry points: LearnHub CTA + footer.
- ✅ **Notice Board** (`/notices`) — data-driven (`src/data/notices.ts`), filter chips, pinned-first sort.
  Honest content only: real site updates + study tips + exam-info that *links to* official sources (never asserts dates).
- ✅ **AI doubt-tutor** (`/ask`) — live chat UI, but the backend is **inert until keyed** (see below).
- ✅ **Dark mode** — class-based toggle; charts now re-theme too via `src/lib/chartTheme.ts` (CSS-var chrome).
- ✅ **Practice & Quizzes** (`/practice`) — quiz player, 5 topics + mixed, 30 seeded MCQs (`src/data/quizzes.ts`),
  reveal-reasoning, difficulty tags, beat-the-clock timer, score + review.
- ✅ **Career Guide** (`/career`) — 7 paths (`src/data/careers.ts`), filter chips, expandable roadmaps + official links.
- ✅ Real already: Home, About, Contact (mailto), Research (stats only).

## AI doubt-tutor — built but DORMANT (wants free, no-card)
- **NOT Anthropic.** Provider-agnostic OpenAI-compatible proxy, default = **Groq free tier** (open models, no card).
- `api/tutor.ts` (Vercel **Edge** fn, outside `src` so tsc/vite ignore it), `src/lib/tutor.ts` (client — **mocks in
  `vite dev`, zero egress**), `src/components/TutorChat.tsx` (chat on `/ask`). Env vars: `LLM_API_KEY` / `LLM_BASE_URL`
  / `LLM_MODEL`. Returns 503 "not switched on" until a key is set.
- **To go live:** add a Groq key in Vercel env + redeploy. Full steps in `docs/AI_TUTOR.md`. Key lives ONLY in Vercel.
- System prompt forbids asserting live tax rates as fact (honesty rule). Rate-limit is per-isolate (note in code).

## Open / deferred (pick from here)
- **More calculators**: Marginal-vs-Absorption costing & PPF/EPF/NPS/FD-RD suite;
  🏆 flagship **Journal→Ledger→Trial Balance** simulator (own focused session).
- **Learn Hub infra** — category-filter chips on `/learn`; resource library (notes/past papers, data-driven); PDF export.
- **Research data** — `src/data/research.ts` `books`/`publications` are intentionally `[]`. Fill ONLY when the
  user provides a real list / Scholar link. **Do NOT invent citations.**
- **AI tutor next** (optional): streaming replies; durable rate-limit via Vercel KV/Upstash.
- **Deploy** — Vercel-ready (`vercel.json` SPA rewrites; `/api/*` resolves before the catch-all). User connects it.

## Conventions (follow exactly)
- **Calculators**: `src/calculators/<Name>.tsx`, lazy-registered in `registry.ts` (`load: () => import('./<Name>')`);
  reuse `src/components/calc/*` (`CalcField`, `CalcSteps`, `HeroResult`/`ResultRow`/`ResultPanel`) and
  `src/lib/format.ts`; pure math in `src/lib/*.ts` (reuse `finance.ts`). Every tool shows step-by-step working.
  Layout `grid lg:grid-cols-5` (inputs `lg:col-span-2`, results `lg:col-span-3`). Parse date-only inputs as LOCAL
  (`parseLocalDate` in `CapitalGains.tsx`). Statutory tools → web-verify rates first + visible in-tool disclaimer.
- **Pages**: eager-imported in `App.tsx` (only calculators are lazy); use `PageHeader`; content from `src/data/*.ts`.
- **Dark mode (Tailwind v4)**: v4 utilities resolve colours via `var(--color-*)`, so dark theme = redefining the
  **neutral ramp (slate + white)** under `.dark` in `index.css` (done). Don't do a `dark:` sweep. Accents
  (brand/mint/sun) are intentionally left intact. `@custom-variant dark` is enabled for targeted `dark:` fixes.
  **Charts**: neutral chrome (grid / axes / tooltip / reference lines / dot halos) is tokenised in
  `src/lib/chartTheme.ts` via CSS vars that flip under `.dark`. Reuse those (`chartGrid`, `axisTick`, `tooltipProps`…)
  in any new chart; keep data-series colours as hard-coded brand/mint/sun accents.
- **Verify every change with `pnpm build`** (tsc + vite). `pnpm dev` for local (was on :5175 — 5173/4 were taken).

## Verified statutory facts (re-verify if rules change; sources Jun 2026 — ClearTax/TDSMAN/CBIC)
- **TDS** FY 2025-26 (`src/lib/tds.ts`): Finance Act 2025 changes baked in — 194A ₹50k/₹1L (senior), 194 dividend ₹10k,
  194H/194D(non-co) 2% @ ₹20k, 194J ₹50k, 194-I ₹50k/month, 194-IB 2%, §206AA no-PAN = max(rate,20%) (194Q = 5%).
- **GST ITC** (`src/lib/gstItc.ts`): s.49A + Rule 88A — IGST credit exhausted first (IGST→then CGST/SGST any order),
  CGST↔SGST never cross-utilise; engine picks the cash-minimising split (verified vs ClearTax worked example).
- **Capital Gains** (`src/lib/capitalGains.ts`): CII to FY2025-26=376; §112A 12.5%/₹1.25L, §111A 20%, §112 12.5%/20%-indexed option.

## Non-negotiables
- **Correctness is critical** — everything ships under Dr. Desai's name. Verify formulas/rates; honest working;
  disclaimers on anything statutory.
- **Git identity is per-repo personal**: `Jeet Desai <113788815+Jeet-Desai@users.noreply.github.com>` (verified).
  **Commit only when the user asks; confirm before pushing.**
- Do not add a `Co-Authored-By` trailer — commits are authored by the repo owner only.
- Legacy v1 untouched at `Jeet-Desai/Mehul-Portfolio` / local `../Mehul-Portfolio/`. Use **pnpm**.

## Run / build
```bash
pnpm install   # if needed
pnpm dev       # local
pnpm build     # tsc + vite — run to verify every change
```
