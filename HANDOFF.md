# Handoff — CommerceLab (next session)

Pick up the **Phase 2** build. Everything below is current as of the Phase 1 push.

## What this is
**CommerceLab — *by Dr. Mehulkumar Desai*** — the 2.0 redesign of a commerce professor's
portfolio into a free learning hub for all Indian commerce students (B.Com/M.Com/BBA/BCA +
CA/CS/CMA). Full vision + the detailed Phase 2 task list are in **`ROADMAP.md`** (read it first).

## Status
- ✅ **Phase 0** (scaffold) and ✅ **Phase 1** (5 hero calculators + Learn Hub + Research page) — done & pushed.
- 🟡 **Phase 2 in progress** — the **5 easy-win calculators are done** (see below). Medium calculators,
  the flagship Journal→Ledger→Trial Balance simulator, and Learn Hub infra remain.
- Build is green. Repo: `Jeet-Desai/mehul-portfolio-2.0` (private). Branch `main`.
- Live calculators (10): break-even/CVP, income-tax (old vs new), GST, EMI, depreciation,
  **SIP & Lumpsum (`sip`), Compound vs Simple interest (`compound-interest`), TVM playground (`tvm`),
  HRA exemption (`hra`), WACC (`wacc`)**.

### Phase 2 progress (this session)
- Added the **`'Investing'`** category to `src/calculators/types.ts`.
- New shared lib **`src/lib/finance.ts`** — TVM core (`futureValue`/`presentValue`/`payment`/
  `solveRate`/`solveN` via bisection) + `simulateSip` (monthly annuity-due with annual step-up).
- New calculators: `Sip.tsx`, `CompoundInterest.tsx`, `Tvm.tsx`, `Hra.tsx`, `Wacc.tsx` (all registered, lazy-loaded).
- **Correctness pass over all 10 calculators** (these carry Dr. Desai's name — treat correctness as critical):
  - Fixed **Depreciation** WDV-with-zero-salvage (was silently showing 0% forever; now explains WDV needs positive salvage).
  - Fixed **TVM** defaults to be mutually consistent (PV 10k + PMT 5k @ 8% × 10 → FV 94,022) so "Solve for" never shows a confusing negative.
  - Income-tax simplification (no surcharge >₹50L / marginal relief) is covered by a visible in-tool disclaimer — keep that pattern for any new tax tool.
- UI fixes: removed the "For: B.Com/M.Com…" audience chips from the Home hero (data + import cleaned up); centered the About-page timeline icons on the line.

## Critical constraints (don't trip on these)
- **Git identity is set per-repo to personal**: `Jeet Desai <113788815+Jeet-Desai@users.noreply.github.com>`.
  Verify with `git config user.email` before committing.
- **Legacy v1 is untouched** at `Jeet-Desai/Mehul-Portfolio` and local `../Mehul-Portfolio/` — do not modify it.
- Use **pnpm**. Node 26. GitHub CLI is authed as `Jeet-Desai` (active).
- Do not add a `Co-Authored-By` trailer — commits are authored by the repo owner only.

## Run / build
```bash
pnpm install        # if needed
pnpm dev            # http://localhost:5173
pnpm build          # tsc + vite — run this to verify every change
```

## Conventions to follow (Phase 1 established these)
- New calculator = `src/calculators/<Name>.tsx`; register in `src/calculators/registry.ts`
  with a **lazy** `load: () => import('./<Name>')` (keeps recharts out of the main bundle).
- Reuse UI primitives in `src/components/calc/` (`CalcField`, `CalcSteps`, `CalcResult`) and
  `src/lib/format.ts` (`formatINR`, `formatNum`, `formatPct`, `toNum`, `round`).
- Put pure calculation logic in `src/lib/*.ts` (pattern: `src/lib/incomeTax.ts`) — easier to verify.
- **Every tool shows step-by-step working** (the house style). Charts via recharts; Tooltip
  formatter pattern is `(v) => formatINR(Number(v))`.
- Design system = "Modern EdTech" (tokens in `src/index.css`: `brand`/`mint`/`sun`, `font-display`).

## Immediate task (continue Phase 2)
The 5 easy wins are done. Next, in this order (see `ROADMAP.md` → "Phase 2 — detailed plan" for the full checklist):
1. **Medium calculators** — CAGR/XIRR (Newton-Raphson in `lib/`), Capital Gains LTCG/STCG (CII table in `lib/`),
   TDS section-wise, GST ITC set-off, Capital Budgeting NPV/IRR/Payback/PI (+NPV-profile chart), Ratio Analysis
   (with interpretation text), Bond pricing/YTM, Inventory FIFO/LIFO/Weighted-avg, Marginal vs Absorption,
   PPF/EPF/NPS/FD-RD suite. Reuse `lib/finance.ts` where the math overlaps (NPV/IRR are TVM cousins).
2. 🏆 **Flagship (hard, do in a fresh session with clean context):** Journal → Ledger → Trial Balance
   simulator — stateful, post entries, auto-build T-ledgers + trial balance, flag if it doesn't tally.
   Then the Schedule-III financial-statement builder.
3. **Learn Hub infra** — category-filter chips on `/learn` (the `'Investing'` category now exists too),
   formula/cheat sheets (data-driven in `src/data/`), resource library.

**Keep correctness paramount** — every tool ships under Dr. Desai's name. Verify formulas against an
authoritative source, add a visible in-tool disclaimer for anything statutory (tax/CII rates), and keep
the step-by-step working honest.

## Open / pending (non-blocking)
- **Research data**: `src/data/research.ts` has empty `books`/`publications` on purpose — fill once
  the user provides a Google Scholar/ResearchGate link or the list. Do NOT invent citations.
- **Deploy**: repo is Vercel-ready (`vercel.json` SPA rewrites). User connects it on Vercel for a live URL.
- Task tracker (this session) had phase-level tasks #1–#6; #1 & #2 completed.
