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
- ✅ **16 calculators** (`/learn`): break-even · income-tax · GST · EMI · depreciation · SIP · compound-interest ·
  TVM · HRA · WACC · CAGR/XIRR · Capital Budgeting · **Capital Gains** · Ratio Analysis · **TDS section-wise** ·
  **GST ITC set-off**. (TDS & GST ITC are statutory — rates web-verified Jun 2026; see notes below.)
- ✅ **Dark mode** — class-based toggle in `Navbar`, no-flash script in `index.html`, persisted to localStorage.
- ✅ **Practice & Quizzes** (`/practice`) — quiz player, 5 topics + mixed, 30 seeded MCQs (`src/data/quizzes.ts`),
  reveal-reasoning, difficulty tags, beat-the-clock timer, score + review.
- ✅ **Career Guide** (`/career`) — 7 paths (`src/data/careers.ts`), filter chips, expandable roadmaps + official links.
- ✅ **Ask CommerceLab** (`/ask`) — searchable FAQ accordion (`src/data/faq.ts`) + anonymous Doubt Box
  (localStorage + mailto) + "AI tutor coming" banner. **No backend.**
- ✅ Real already: Home, About, Contact (mailto), Research (stats only).

## Built but NOT wired in
- **Bond pricing & YTM** (`src/calculators/Bond.tsx`, `bondPrice`/`bondYTM` in `lib/finance.ts`) and
  **Inventory FIFO/LIFO/WAvg** (`src/calculators/Inventory.tsx`, `lib/inventory.ts`) are complete & build-green
  but **not registered** in `registry.ts`. Flip each on with a one-line entry (slug + lazy `load`) when wanted.

## Open / deferred (pick from here)
- **Live AI tutor** — the only backend piece: Vercel serverless proxy to the Claude API (key server-side,
  rate-limited) + chat UI on `/ask`. Deferred by the user (cost/deploy friction).
- **Notice Board** (`/notices`) — still a `ComingSoon` stub; make it data-driven like Career/FAQ.
- **Dark-mode polish** — recharts use hard-coded hex (light gridlines `#eef2f7`, etc.), so charts don't fully
  re-theme; the accent `*-50` chips stay light on dark cards (acceptable, but a polish pass could add `dark:` fixes).
- **More calculators** (deferred per pivot): register Bond/Inventory; then Marginal-vs-Absorption & PPF/EPF/NPS/FD-RD;
  🏆 flagship **Journal→Ledger→Trial Balance** simulator (own focused session).
- **Learn Hub infra** — category-filter chips, formula/cheat sheets, resource library (all data-driven in `src/data/`).
- **Research data** — `src/data/research.ts` `books`/`publications` are intentionally `[]`. Fill ONLY when the
  user provides a real list / Scholar link. **Do NOT invent citations.**
- **Deploy** — Vercel-ready (`vercel.json` SPA rewrites); user connects it for a live URL.

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
