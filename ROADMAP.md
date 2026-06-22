# CommerceLab — Roadmap

> **CommerceLab** — *by Dr. Mehulkumar Desai*
> A free learning hub for every commerce student in India (B.Com, M.Com, BBA, BCA, and CA/CS/CMA aspirants), anchored by Dr. Desai's 22 years of teaching authority.

This is the **2.0 redesign** of the portfolio. The original v1 lives untouched at
`github.com/Jeet-Desai/Mehul-Portfolio` (built solely by the owner). This repo is the
collaborative successor.

---

## Positioning

The v1 site was a digital business card — viewed once, then forgotten. CommerceLab flips
it into **a tool students open every week**, especially before exams. The portfolio
(credentials, research) is the *trust layer*; the interactive tools are the *reason to
return*. Tagline: *"Built by a professor of 22 years — for every commerce student."*

## Audience

All commerce students, not just Dr. Desai's current Cost Accounting classes:
B.Com / M.Com / BBA / BCA, plus CA Foundation, CS, CMA, and UGC-NET Commerce aspirants.

## Site map

```
Home          → who he is + value prop + jump into the tools
Profile       → credentials, timeline, stats
Research      → publications, books, PhD scholars (v1 left this EMPTY)
Learn Hub  ◀ the core
   ├─ Calculators & Solvers   (show the working, like a teacher)
   ├─ Practice & Quizzes
   ├─ Formula / Cheat Sheets
   └─ Resource Library         (subject- & semester-wise)
Ask CommerceLab → AI tutor + anonymous Doubt Box
Career Guide   → after B.Com? CA / CS / CMA / MBA / ACCA / govt roadmaps
Notice Board   → announcements, exam dates
Contact
```

## The four pillars

### 1. Calculators & Solvers — *they show the step-by-step working, not just the answer*
- **Finance/personal:** Income Tax (old vs new regime), GST, EMI/loan, SIP & lumpsum,
  compound/simple interest, TDS
- **Accounting & costing:** Break-even/CVP (+ live chart), marginal costing, cash budget,
  cash flow (AS-3), funds flow, flexible budget, depreciation (SLM vs WDV w/ schedule),
  inventory (FIFO/LIFO/EOQ), standard-costing variances
- **Financial management:** ratio analysis, NPV/IRR/payback, WACC, leverage, working capital
- **Stats/Eco:** mean/SD/correlation/regression, index numbers, elasticity
- Extras: export formatted statement/PDF (for assignments); share result card to WhatsApp

### 2. Practice & Quizzes
- Topic-wise bank, **solution hidden until clicked**, difficulty tags, past papers
  (VNSGU/Surat + CA Foundation/NET Commerce)
- **Exam "beat-the-clock" mode**, scoring, **streaks & badges**, leaderboard

### 3. AI Doubt-Tutor — "Ask CommerceLab"
- 24/7 chatbot in Dr. Desai's teaching persona, scoped to commerce, gives worked solutions,
  bilingual (English + हिंदी/ગુજરાતી)
- Anonymous **Doubt Box** → he answers → answers become a public FAQ

### 4. Showcase + Polish
- Fill **Research** (36 papers, 3 books, scholars guided, Scholar link)
- **Mobile-first**, dark/light mode, smooth motion
- Tri-lingual UI (EN/HI/GU), **installable PWA** (offline formula sheets/calculators),
  real visitor counter, fixed dead links + the "Porfolio" typo

## Tech stack

- **Vite + React + TypeScript + Tailwind CSS** (design system: Modern EdTech — vibrant,
  rounded, card-based)
- **Recharts** (charts), **Framer Motion** (animation)
- **Firebase Firestore** — reuse existing project for doubts/scores/announcements/contact
- **AI:** serverless function (Vercel) proxying the **Claude API** (key server-side, rate-limited)
- **Hosting: Vercel** (free tier; runs the serverless function)
- Content in **structured data files** → easy to extend without touching components

**Costs:** Vercel + Firebase free tiers suffice. Only recurring cost = AI tokens
(capped via rate limits). Everything except the AI tutor ships free.

---

## Phased roadmap (each phase is independently shippable)

- [x] **Phase 0 — Foundation:** scaffold Vite/React/TS/Tailwind, design system, routing,
      deploy skeleton to Vercel ✅
- [x] **Phase 1 — Redesign + first solvers:** new visual identity, all existing sections
      rebuilt, 5 hero calculators (break-even +chart, income tax old-vs-new, GST, EMI, depreciation),
      each with step-by-step working. Research page structured (lazy-loaded calculators). ✅
      *Pending real data:* publication list + Google Scholar link, book titles (see `src/data/research.ts`).
- [ ] **Phase 2 — Learn Hub:** full calculator set, formula sheets, resource library
      *(scoped — see "Phase 2 — detailed plan" below)*
- [ ] **Phase 3 — Practice & Quizzes:** question bank, exam mode, streaks/leaderboard
- [ ] **Phase 4 — AI tutor + Doubt Box + Career Guide**
- [ ] **Phase 5 — Polish:** PWA, i18n (EN/HI/GU), dark mode, notice board, WhatsApp sharing

## Brand notes

- Name: **CommerceLab**; byline **"by Dr. Mehulkumar Desai"** (Ph.D. → "Dr.")
- Voice: encouraging, practical, exam-aware, India-first

---

## Phase 2 — detailed plan (next session)

Approved: all four tool bundles below + Learn Hub infra. Web research informed the picks
(Groww/ClearTax calculator indexes, Zerodha Varsity, Investopedia, EconGraphs, ReadyRatios,
ActiveLearningLabs). Build order below = quick wins first → flagship simulators last.

**Reuse the existing framework — do NOT reinvent:**
- UI primitives: `src/components/calc/` — `CalcField`, `CalcSteps`, `CalcResult`
  (`HeroResult` / `ResultRow` / `ResultPanel`), `CalcCard`.
- Formatting: `src/lib/format.ts` — `formatINR`, `formatNum`, `formatPct`, `toNum`, `round`.
- Pure calc logic → `src/lib/*.ts` (see `incomeTax.ts` as the pattern) so it's testable.
- Each calculator = `src/calculators/<Name>.tsx`, registered in
  `src/calculators/registry.ts` with a **lazy** `load: () => import('./<Name>')`.
- Charts: recharts (already code-split). Tooltip formatter pattern: `(v) => formatINR(Number(v))`.
- Add categories to `src/calculators/types.ts` as needed: `Investing`, `Statistics`, `Economics`.
- Verify each step with `pnpm build` (tsc + vite). House style: every tool shows step-by-step working.

### Bundle A — Investing & TVM  (Finance / Investing)
- [x] SIP / Lumpsum / **Step-up SIP** (growth chart) — *easy, highest demand* ✅ `Sip.tsx` (`simulateSip` in `lib/finance.ts`)
- [x] Compound vs Simple interest **visualizer** (widening-gap chart) — *easy* ✅ `CompoundInterest.tsx`
- [x] **TVM playground** — solve for any of PV/FV/PMT/rate/n — *easy* ✅ `Tvm.tsx` (solvers in `lib/finance.ts`)
- [ ] CAGR / **XIRR** (Newton-Raphson in `lib/`) — *medium*
- [ ] PPF / EPF / NPS / FD-RD maturity suite (rates as editable constants) — *easy*

### Bundle B — Tax pack  (Taxation)
- [ ] **Capital Gains** LTCG/STCG (FY25-26 rules; bundle CII table in `lib/`) — *medium*
- [x] **HRA exemption** (min of 3 rule, step-by-step) — *easy* ✅ `Hra.tsx`
- [ ] TDS section-wise (194C/194J/194I/192 … rate+threshold table in `lib/`) — *medium*
- [ ] GST **ITC set-off simulator** (IGST→CGST→SGST utilization order) — *medium*

### Bundle C — FM & Ratios  (Financial Management)
- [ ] **Capital Budgeting** suite: NPV / IRR (iterative) / Payback / PI + **NPV-profile chart** — *medium*
- [x] WACC — *easy* ✅ `Wacc.tsx`
- [ ] **Ratio Analysis** — enter P&L + Balance Sheet → liquidity/solvency/profitability/turnover
      ratios **with interpretation text** — *medium*
- [ ] Bond pricing & **YTM** (+ price-yield curve) — *medium*

### Bundle D — Accounting simulators  (Accounting / Costing)
- [ ] 🏆 **Journal → Ledger → Trial Balance** simulator — post entries, auto-build T-ledgers +
      trial balance, flag if it doesn't tally — *hard, flagship, fully client-side*
- [ ] Financial-statement builder (Schedule-III P&L + Balance Sheet from trial balance) — *hard*
- [ ] Inventory valuation FIFO / LIFO / Weighted-avg (store ledger card) — *medium*
- [ ] Marginal vs Absorption costing comparator (reconcile the profit difference) — *medium*

### Learn Hub infra
- [ ] Add **category filter chips** to `/learn` (currently search-only)
- [ ] **Formula / cheat sheets** — searchable, per subject, data-driven (`src/data/`), PDF export
- [ ] **Resource library** — notes/past papers organised by subject & semester (`src/data/`)

*Deferred to a later flagship phase:* virtual NSE stock-trading simulator (needs a market-data
API + accounts — the only researched idea that isn't client-side).

*Quiz engine + spaced-repetition flashcards live in **Phase 3** (Practice & Quizzes).*
