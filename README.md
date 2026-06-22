# CommerceLab — *by Dr. Mehulkumar Desai*

A free learning hub for every commerce student in India (B.Com, M.Com, BBA, BCA, and
CA/CS/CMA aspirants). The **2.0 redesign** of the original portfolio.

> The original v1 (built solely by the owner) lives untouched at
> [Jeet-Desai/Mehul-Portfolio](https://github.com/Jeet-Desai/Mehul-Portfolio) —
> live at https://jeet-desai.github.io/Mehul-Portfolio/

## What it is

Not just a portfolio — a tool students open every week, especially before exams:
step-by-step calculators, practice quizzes, formula sheets, a resource library, and an
AI doubt-tutor. See [`ROADMAP.md`](./ROADMAP.md) for the full plan and phases.

## Tech stack

- **Vite + React + TypeScript**
- **Tailwind CSS v4** (CSS-first config in `src/index.css`)
- **React Router** · **Framer Motion** · **lucide-react**
- Planned: Firebase (data), Vercel serverless function → Claude API (AI tutor)

## Develop

```bash
pnpm install      # install dependencies
pnpm dev          # start the dev server (http://localhost:5173)
pnpm build        # type-check + production build
pnpm preview      # preview the production build
```

## Project structure

```
src/
  components/   # Navbar, Footer, Layout, shared UI
  pages/        # Home, About, Research, LearnHub, Ask, Contact, ...
  data/         # site content (single source of truth)
public/         # images, resume, favicon
```
