# CLAUDE.md — CommerceLab

Guidance for Claude Code (and any AI agent) working in this repo. Read this first, then
**`HANDOFF.md`** for the live status and **`ROADMAP.md`** for the full vision and phase plan.
When they disagree, **`HANDOFF.md` is the accurate current state**; `ROADMAP.md`'s checkboxes lag reality.

---

## What this is

**CommerceLab — *by Dr. Mehulkumar Desai*** — a free, 100% client-side learning hub for **every Indian
commerce student** (B.Com / M.Com / BBA / BCA + CA / CS / CMA / UGC-NET aspirants). It is the **2.0 redesign**
of the professor's portfolio: the credentials are the *trust layer*; the interactive tools are the *reason to
return weekly, especially before exams*.

- **Tagline:** *"Built by a professor of 22 years — for every commerce student."*
- **Repo:** `Jeet-Desai/mehul-portfolio-2.0` (private), branch `main`. Legacy v1 is untouched at
  `Jeet-Desai/Mehul-Portfolio` (local `../Mehul-Portfolio/`) — do not modify it.
- **No backend, no database, no Firebase.** Content lives in `src/data/*.ts`. The only server-side piece is
  one optional Vercel Edge Function for the AI tutor (dormant until keyed).

## Guiding direction (set by the user)

**Breadth over depth.** Every pillar should be a real, thin, shippable slice before any one is deepened.
We deliberately stopped adding calculators (had 16, now 18) to build a full vertical slice across the site map.
Keep new features **client-side + data-driven** — that's what keeps the product free, public-shippable, and
low-friction. Favour making a missing pillar real over polishing an existing one.

## Tech stack

- **Vite 8 + React 19 + TypeScript 6** — all client-side.
- **Tailwind CSS v4** (CSS-first config in `src/index.css`; **no `tailwind.config`**). Dark mode via
  **neutral-ramp inversion**, not a `dark:` sweep (see below).
- **React Router 7** · **Recharts 3** (lazy-loaded with each calculator) · **Framer Motion 12** · **lucide-react**.
- **pnpm** is the package manager.

---

## Status — what's shipped (as of the "full vertical slice" session)

- ✅ **18 calculators** (`/learn`), each showing step-by-step working: break-even · income-tax (old vs new) ·
  GST · EMI · depreciation (SLM/WDV) · SIP · compound-vs-simple interest · TVM · HRA · WACC · CAGR/XIRR ·
  Capital Budgeting (NPV/IRR) · Capital Gains · Ratio Analysis · TDS (section-wise) · GST ITC set-off ·
  Bond pricing & YTM · Inventory (FIFO/LIFO/WAvg).
- ✅ **Formula Sheets** (`/formulas`) — searchable quick-reference sheets, ~48 formulas across 6 subjects (`src/data/formulas.ts`).
- ✅ **Notice Board** (`/notices`) — data-driven (`src/data/notices.ts`), filter chips, pinned-first.
- ✅ **Practice & Quizzes** (`/practice`) — quiz player, 30 seeded MCQs (`src/data/quizzes.ts`), timer, review.
- ✅ **Career Guide** (`/career`) — 7 paths (`src/data/careers.ts`), expandable roadmaps + official links.
- ✅ **AI doubt-tutor** (`/ask`) — full chat UI, but the backend is **DORMANT until a key is set** (see below).
- ✅ **Dark mode** throughout (charts re-theme too); Home, About, Contact (mailto), Research (stats only) are real.

## Next phases / where to pick up

`ROADMAP.md` defines 5 phases (0–1 done; 2–5 partially built as thin slices due to the breadth pivot).
The curated next-step backlog lives in **`HANDOFF.md` → "Open / deferred"**. Highlights:

- **More calculators:** PPF/EPF/NPS/FD-RD maturity suite; Marginal vs Absorption costing; and the
  🏆 **flagship Journal → Ledger → Trial Balance simulator** (deserves its own focused session).
- **Learn Hub infra:** category-filter chips on `/learn`; a data-driven resource library (notes/past papers); PDF export.
- **Research data:** `src/data/research.ts` `books`/`publications` are intentionally `[]`. Fill **only** with real
  data the user provides (Scholar link / real titles). **Never invent citations.**
- **AI tutor next (optional):** streaming replies; durable rate-limit via Vercel KV / Upstash.
- **Deploy:** Vercel-ready (`vercel.json` SPA rewrite). The user connects/deploys it.

---

## Architecture & layout

```
api/tutor.ts          Vercel Edge Function — AI-tutor proxy. OUTSIDE src/ so tsc/vite ignore it.
index.html            Pre-paint theme script (no flash of wrong mode) + OG/Twitter meta.
src/
  App.tsx             Routes. Pages are EAGER-imported; only calculators are lazy.
  components/
    Layout, Navbar (holds the dark-mode toggle), Footer, PageHeader, ScrollToTop, TutorChat, ...
    calc/             Shared calculator UI primitives — REUSE THESE:
                        CalcField, CalcSteps, CalcCard,
                        CalcResult → { HeroResult, ResultRow, ResultPanel }
  calculators/
    <Name>.tsx        One component per tool.
    registry.ts       The calculator list (slug, title, category, blurb, icon, lazy `load`, tags).
    types.ts          Calculator, CalcCategory, Step types.
  lib/                Pure math + helpers (testable, no React):
                        finance.ts (reuse first!), incomeTax, capitalGains, tds, gstItc, ratios,
                        inventory, format.ts, chartTheme.ts, tutor.ts
  data/               Single source of truth for content: formulas, notices, quizzes, careers, faq, research, site
  pages/              Home, About, Research, LearnHub, Formulas, CalculatorPage, Practice, Ask, CareerGuide,
                      NoticeBoard, Contact, NotFound
```

Routes: `/`, `/about`, `/research`, `/learn`, `/formulas`, `/learn/c/:slug` (calculator), `/practice`,
`/ask`, `/career`, `/notices`, `/contact`.

---

## Conventions — follow exactly

### Adding a calculator
1. Pure math goes in `src/lib/<name>.ts` (reuse `finance.ts` — it already has SIP, TVM solvers, NPV/IRR,
   CAGR/XNPV/XIRR, payback, etc.). Keep it React-free and testable.
2. Component at `src/calculators/<Name>.tsx`. Reuse `src/components/calc/*` and `src/lib/format.ts`
   (`formatINR`, `formatNum`, `formatPct`, `toNum`, `round` — all India-first ₹/lakh-crore).
3. Register in `src/calculators/registry.ts` with a **lazy** `load: () => import('./<Name>')` and good `tags`
   (search keywords). Add new categories to `types.ts` `CalcCategory` if needed.
4. **Every tool shows step-by-step working** via `CalcSteps` (`Step[]` = label/formula/result/note).
5. Standard layout: `grid gap-6 lg:grid-cols-5` → inputs `lg:col-span-2`, results `lg:col-span-3`.
6. Parse date-only inputs as **LOCAL** dates (see `parseLocalDate` in `CapitalGains.tsx`) to avoid UTC/DST drift.
7. Statutory tools (tax/TDS/GST): **web-verify the rates first**, bake them into `lib/`, and show a visible
   in-tool disclaimer.

### Pages & content
- Pages are eager-imported in `App.tsx`; use `PageHeader`; pull all content from `src/data/*.ts` (never hard-code
  content in components). `site.ts` is the source of truth for brand, professor bio, stats, nav links, contact.

### Dark mode (Tailwind v4) — important
- Dark theme works by **redefining the neutral ramp (slate + white) under `.dark` in `index.css`** — utilities
  resolve via `var(--color-*)`, so the whole UI flips coherently. **Do NOT do a `dark:` sweep.** Accents
  (brand/mint/sun) are intentionally left intact. `@custom-variant dark` is enabled for targeted `dark:` fixes only.
- `white` is redefined as the dark *card surface*, so `text-white` on coloured/gradient surfaces is force-kept
  white via unlayered rules in `index.css` — keep that pattern for new banners/buttons/bubbles.
- **Charts:** neutral chrome (grid/axes/tooltip/reference lines/dot halos) is tokenised in `src/lib/chartTheme.ts`
  via CSS vars that flip under `.dark`. Reuse `chartGrid`, `axisTick`, `tooltipProps`, etc. Keep **data-series**
  colours as hard-coded brand/mint/sun accents (they read well on both themes).
- Toggle lives in `Navbar.tsx` (persists to `localStorage['theme']`); `index.html` applies it before paint.

### AI tutor (built, DORMANT)
- **Not Anthropic.** Provider-agnostic OpenAI-compatible proxy; default = **Groq free tier** (no card).
  `api/tutor.ts` (Edge fn), `src/lib/tutor.ts` (client — **mocks in `vite dev`, zero network egress**),
  `src/components/TutorChat.tsx`. Env: `LLM_API_KEY` / `LLM_BASE_URL` / `LLM_MODEL`. Returns 503 until keyed.
- To go live: add a Groq key in Vercel env + redeploy (full steps in `docs/AI_TUTOR.md`). **Key lives only in Vercel.**
- The system prompt forbids asserting live tax rates as fact — keep that honesty guard if you edit it.

---

## Verified statutory facts (re-verify if rules change; sources Jun 2026 — ClearTax / TDSMAN / CBIC)

- **TDS** FY 2025-26 (`src/lib/tds.ts`): Finance Act 2025 — 194A ₹50k/₹1L (senior), 194 dividend ₹10k,
  194H/194D(non-co) 2% @ ₹20k, 194J ₹50k, 194-I ₹50k/mo, 194-IB 2%, §206AA no-PAN = max(rate, 20%) (194Q = 5%).
- **GST ITC** (`src/lib/gstItc.ts`): s.49A + Rule 88A — IGST credit exhausted first (then CGST/SGST any order),
  CGST↔SGST never cross-utilise; engine picks the cash-minimising split.
- **Capital Gains** (`src/lib/capitalGains.ts`): CII to FY2025-26 = 376; §112A 12.5%/₹1.25L, §111A 20%,
  §112 12.5% / 20%-indexed option.
- **Income tax** is FY 2025-26 in `src/lib/incomeTax.ts`. Formula sheets keep tax **structural** (no slab numbers — they change).

---

## Non-negotiables

- **Correctness is critical.** Everything ships under Dr. Desai's name. Verify formulas/rates, show honest
  working, and put a visible disclaimer on anything statutory. **Never invent research citations or data.**
- **Verify every change with `pnpm build`** (`tsc && vite build`). `pnpm dev` for local.
- **Git identity is per-repo personal:** `Jeet Desai <113788815+Jeet-Desai@users.noreply.github.com>`.
- **Commit only when the user asks; confirm before pushing.** Do not add a `Co-Authored-By` trailer — commits are authored by the repo owner only.

## Run / build

```bash
pnpm install   # if needed
pnpm dev       # local dev server (was on :5175 — 5173/4 were taken)
pnpm build     # tsc + vite — run to verify EVERY change
pnpm preview   # preview the production build
```
