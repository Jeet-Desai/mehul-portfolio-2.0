# Handoff — AccrualSense (next session)

The product now spans **every pillar as a real, thin slice** (not just calculators). Read `ROADMAP.md`
for the full vision. Current as of the "Ledger redesign + student features" session (2 Jul 2026).

## 🎨 LATEST SESSION (2 Jul 2026) — Ledger redesign + Tier 1/2 student features (UNCOMMITTED)
Everything below is in the working tree, `pnpm build` green, browser-verified light/dark/mobile. **Not yet committed.**

**Full "Ledger" visual redesign** from `D:\commercelab\clcode\design\design_handoff_accrualsense_ledger`
(warm paper · Newsreader serif + Manrope · deep-teal accent). Implementation rides the existing token
mechanism: in `src/index.css` the **slate ramp + white ARE the Ledger neutrals** and **brand-\* IS the teal
accent** (`#0f766e` light → `#2dd4bf` dark; solid accent fills use ink text in dark for contrast — see
`.btn-accent`). New component classes: `.cl-card`/`.cl-card-lift` (opt-in hover), `.ink-card`+`.ink-lines`
(inverts to a light card in dark — intended), `.btn-accent`, `.btn-outline`, `.eyebrow`, `.h2-marker`,
`.ledger-lines` (page background, mounted in `Layout`), `.margin-rule`, `text-line`. Shared pieces:
`Reveal.tsx` (translate-only house rise), `CountUp.tsx`, `PageHeader` (`titleAccent` italic teal phrase),
fonts loaded in `index.html`. Every page + all calc primitives restyled. **Never `dark:`-sweep; extend tokens.**

**New student features (all client-side, localStorage `as:*` keys, pure libs in `src/lib/`):**
- **Progress layer** `progress.ts` — streak/activity/quiz-stats/calc-usage/topic-reads; recording hooks live
  in Practice, CalculatorPage, ResourceTopic; dashboard at **`/progress`** (heat strip, weakest topic, exam card).
- **Question of the Day** `qotd.ts` + `components/QuestionOfTheDay.tsx` on Home (deterministic by local date; public habit hook).
- **Flashcards + spaced repetition** `srs.ts` + **`/revise`** — Leitner boxes 1–5 → 1/2/5/10/21 days; ~207 cards
  auto-derived from `formulas.ts` + resource `keyTerms` (incl. EN→ગુજરાતી drill decks). Content never stored, only schedule.
- **Exam countdown** `exam.ts` + navbar `ExamChip` (presets are NAMES ONLY — never assert exam dates).
- **Mock exam mode** in Practice — 20 Qs round-robin across topics, 25-min clock, no feedback until submit,
  palette navigation, per-topic breakdown, printable result card; records `mode:'mock'`.
- **Journal → Ledger → Trial Balance simulator** (🏆 flagship) — `lib/journal.ts` + `calculators/JournalLedger.tsx`
  (slug `journal-ledger-trial-balance`, first in registry). Golden-rule reasoning per entry, textbook
  T-accounts, balances-method TB; seed scenario hand-verified (tallies ₹1,48,000). Persists to `as:journal`.
- **Shareable calculator links** — `lib/urlState.ts` `useCalcState` (drop-in URL-synced useState) wired into
  all scalar-input calculators + `ShareButton` on every calc page. Complex row-array calculators skipped (listed in agent report).
- **Per-page titles/meta** — `lib/usePageTitle.ts`, called on every page (was: one global title).
- Routes added: `/progress`, `/revise` (both behind `RequireAuth`, consistent with the tools gate).
  NavLinks + footer updated. **"No sign-up, no cost" copy removed from Home** (login IS required for tools).

**Next up (user-approved backlog):** digitize Dr. Desai's question banks from `D:\commercelab\material`
into practice sets (own focused session — correctness-critical); then PPF/EPF/NPS/FD-RD suite, PWA/offline,
Gujarati beyond the Library. Consider updating `stats`/marquee if calculator count changes (now 32).

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
- ✅ **Formula Sheets** (`/formulas`) — searchable quick-reference sheets, ~48 formulas grouped by 6 subjects
  (`src/data/formulas.ts`), each linked to its calculator. Tax kept *structural* (no slab numbers — they change).
  Entry points: LearnHub CTA + footer.
- ✅ **Resource Library** (`/resources`, `/resources/:id`) — data-driven study notes (`src/data/resources.ts`),
  `ResourceLibrary.tsx` (index: search + subject chips) + `ResourceTopic.tsx` (detail). **5 topics live & enriched**:
  ratio-analysis, fund-flow, cash-flow (AS 3), cash-budget, flexible-budget. Each = overview / key terms / formulas /
  step-by-step method / **worked example** / exam tips + pitfalls / **practice (reveal-answer + warning)** / references.
  **Download-PDF** per topic (`window.print()` → light-forced; print CSS in `index.css`). Detail page shows the
  "Try the calculator" CTA only if that calc exists in the registry (auto-lights-up as calculators are built).
  Entry points: "Library" nav link + LearnHub. Sourced from the user's material + M.N. Arora; web-checked (ACCA/ICAI/etc).
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

## 🔨 ACTIVE BUILD — Cost & Management Accounting expansion (in progress)
Big multi-session build started Jun 2026. Source material: **`D:\commercelab\material`** (user's own college
question banks + theory/solutions; read via stdlib Python — Office files aren't directly readable; see below) and
**M.N. Arora, *Cost Accounting*** (`cost_accounting_textbook.pdf`, maps unit-for-unit onto the costing calculators).
**Correctness is the #1 rule — everything ships under Dr. Desai's name; never invent.**

**Rebrand (done):** product is now **"AccrualSense — by Mehul Desai"** (logo `public/images/accrualsense-mark.png`
+ `public/favicon.png`; brand in `src/data/site.ts`). Dark-mode `brand-50` white-tint fixed (page-header gradients +
icon tiles → `dark:from-brand-500/10` / `dark:bg-brand-500/10`). Docs (this file / CLAUDE.md / ROADMAP.md) still say
"CommerceLab" in prose — cosmetic, update when convenient.

Done so far on the build:
- ✅ **Batch 0 infra** — `Management Accounting` category added to `types.ts`; `registry.ts` reordered (Ratio Analysis
  first → cost/management block → break-even → existing finance/tax). New cost calcs slot into the block as built.
- ✅ **Cash Flow Statement (AS 3)** calc — `lib/cashFlow.ts` + `CashFlow.tsx` (indirect method, full statement +
  reconciliation). Verified vs the topic worked example (operating ₹95,000 / closing ₹1,55,000).
- ✅ **Fund Flow Statement** calc — `lib/fundFlow.ts` + `FundFlow.tsx` (schedule of WC changes, FFO, fund flow
  statement, sources-vs-applications cross-check). Verified (+₹10,000 ties).
- ✅ **Ledger T-account utility** — `src/components/calc/LedgerWorkings.tsx` (reusable; Dr/Cr entries → auto balancing
  figure + presets). Embedded full-width under BOTH Cash Flow and Fund Flow for deriving adjustment figures
  (tax paid, assets bought/sold). Verified (derives tax paid ₹15,000).
- Resource topics for fund-flow & cash-flow already existed and now auto-light their "Try the calculator" CTA.
- ✅ **Cost & Management Accounting build COMPLETE** — Batches 3–6, all 11 calculators shipped & browser-verified
  (light/dark), every seeded figure tied to M.N. Arora. Commits `33fada2` (B3), `fcffb27` (B4), `7fbef87` (B5),
  `c625e53` (B6). Calculators: cost-sheet · eoq-stock-levels · wage-systems · overhead-absorption · job-batch-costing ·
  contract-costing · process-costing · operating-costing · standard-costing-variances · cash-budget · flexible-budget.
  9 new resource topics + cash/flexible budget topics now light their "Try the calculator" CTA. Reusable **tabbed
  segmented-control** pattern (EOQ, wages, job/batch, variances) and **T-account / two-column table** patterns
  (contract, process) established.
- ✅ **Login / Auth (Supabase) — built, DORMANT until keyed** (commit `0bfc9e5`). Mirrors the AI-tutor pattern:
  enabled only when `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are set; until then the whole site is open and
  `/login` says "not switched on". When enabled, **only the interactive tools** require login — calculators
  (`/learn/c/:slug`), `/practice`, `/ask`; everything else (Home, About, Contact, Resources, Formulas, Notices,
  Career, Research, `/learn` index) stays public for SEO. Google OAuth + passwordless email magic link.
  Files: `lib/supabaseClient.ts`, `lib/auth.tsx` (AuthProvider/useAuth), `components/RequireAuth.tsx`,
  `pages/Login.tsx`; wired in `App.tsx`/`main.tsx`; Navbar shows Log in/Sign out only when enabled.
  **To switch on:** `docs/AUTH.md` (create Supabase project → add 2 keys in Vercel → enable Google+email → redeploy).
  Dep added: `@supabase/supabase-js`.

- ✅ **Batch 3 (unit · material · labour)** — DONE & browser-verified (light/dark), all figures tie to Arora:
  - **Cost Sheet** — `lib/costSheet.ts` + `CostSheet.tsx` (slug `cost-sheet`). Full ladder: RM consumed → prime →
    works (±WIP) → cost of production (±FG) → cost of sales → profit, with optional per-unit column. Seeded with
    Arora Ill 2.2 → profit ₹14,800 on sales ₹1,16,000. Topic `unit-costing`.
  - **EOQ & Stock Levels** — `lib/materialControl.ts` + `MaterialControl.tsx` (slug `eoq-stock-levels`; **tabbed**:
    EOQ + ordering/carrying cost · ROL/min/max/avg/danger). Seeded Arora Ill 3.1/3.2 → EOQ 60; A: ROL 900, min 400,
    max 1,300, avg 850. Topic `material-control`.
  - **Wage Systems & Labour Turnover** — `lib/wages.ts` + `Wages.tsx` (slug `wage-systems`; **tabbed**: incentive
    earnings table [time/piece/Halsey/Halsey-Weir/Rowan] · labour turnover sep/repl/flux). Seeded → Halsey ₹138,
    Rowan ₹146.16; turnover sep 5% / repl 2.5% / flux 7.5%. Topic `labour-costing`.
  - All three slot into the cost block at the TOP (cost-sheet → eoq → wage-systems → fund-flow → cash-flow → break-even).
  - **Tab pattern** for multi-tool calcs: inline segmented control (`inline-flex rounded-xl … p-1`, active = `bg-brand-600
    text-white`, container `dark:bg-white`). Reuse for future multi-mode calcs.

Remaining, in order (paired topic+calc batches, full exam-grade — user-confirmed):
1. **6 Cost Accounting resource topics** left from Arora (same format; 3 of 9 done — unit/material/labour): overhead ·
   job&batch · contract · process · operating · standard costing. Worked examples + a few practice Qs.
2. **~8 calculators** left + **cash-budget** & **flexible-budget** (topics already exist): overhead absorption ·
   job/batch (EBQ) · contract a/c · process costing (normal/abnormal loss, equivalent units) · operating/service costing ·
   standard costing variances · cash budget · flexible budget. Same pattern (lib + `calc/*` primitives + step-by-step
   working + light/dark verify). Next batches: (4) overhead·job-batch·contract → (5) process·operating·standard →
   (6) cash-budget·flexible-budget.
3. Update `ROADMAP.md` checkboxes + this file when done.

**Dev-server note:** Tailwind v4 + Vite dev does NOT pick up newly-added utility classes after the server started —
they render as missing in the browser though `pnpm build`'s `dist` CSS has them. **Restart `pnpm dev` after adding
classes** (or verify via `pnpm preview`), and beware zombie vite processes holding the port (kill via PowerShell
`Get-NetTCPConnection -LocalPort 5173`). Calculator row layouts use **flexbox, not arbitrary `grid-cols-[…]`** (v4
collapsed multi-track arbitrary grids to one column).

**Reading the material (Office files):** the Read tool can't open `.docx`/`.pptx`/`.doc`. Use stdlib Python — a
`zipfile`+`xml.etree` extractor for docx/pptx (render tables pipe-delimited), printable-`strings` for old binary `.doc`,
and `pdftotext` for PDFs. (An extractor lived in the session scratchpad; re-create if cleared.)
**Build env:** Vite 8 needs Node ≥20.19 — user is on Node 24. Run `pnpm install` once under it (fetches rolldown's
native binding) then `pnpm build`/`pnpm dev` work.

## Open / deferred (pick from here)
- **More calculators**: Marginal-vs-Absorption costing & PPF/EPF/NPS/FD-RD suite;
  🏆 flagship **Journal→Ledger→Trial Balance** simulator (own focused session).
- **Learn Hub infra** — category-filter chips on `/learn`; resource library ✅ done (extend with the 9 cost topics);
  per-topic PDF ✅ done (could add formula-sheet / result-card PDF export too).
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
