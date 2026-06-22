# Handoff — CommerceLab (next session)

Pick up the **Phase 2** build. Everything below is current as of the Phase 1 push.

## What this is
**CommerceLab — *by Dr. Mehulkumar Desai*** — the 2.0 redesign of a commerce professor's
portfolio into a free learning hub for all Indian commerce students (B.Com/M.Com/BBA/BCA +
CA/CS/CMA). Full vision + the detailed Phase 2 task list are in **`ROADMAP.md`** (read it first).

## Status
- ✅ **Phase 0** (scaffold) and ✅ **Phase 1** (5 hero calculators + Learn Hub + Research page) — done & pushed.
- Build is green. Repo: `Jeet-Desai/mehul-portfolio-2.0` (private). Branch `main`.
- Live calculators: break-even/CVP, income-tax (old vs new), GST, EMI, depreciation.

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

## Immediate task
Build **Phase 2** — all four bundles (Investing & TVM, Tax pack, FM & Ratios, Accounting
simulators) + Learn Hub infra (category filter, formula sheets, resource library). Exact
checklist + build order + difficulty/notes are in `ROADMAP.md` → "Phase 2 — detailed plan".
Suggested first step: knock out the easy wins (HRA, SIP, compound-interest, WACC, TVM) to build
momentum, then the medium calculators, then the flagship Journal→Ledger→Trial Balance simulator.

## Open / pending (non-blocking)
- **Research data**: `src/data/research.ts` has empty `books`/`publications` on purpose — fill once
  the user provides a Google Scholar/ResearchGate link or the list. Do NOT invent citations.
- **Deploy**: repo is Vercel-ready (`vercel.json` SPA rewrites). User connects it on Vercel for a live URL.
- Task tracker (this session) had phase-level tasks #1–#6; #1 & #2 completed.
