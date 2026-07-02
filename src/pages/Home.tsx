import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { site, professor } from '../data/site'
import { calculators } from '../calculators/registry'
import Reveal from '../components/Reveal'
import CountUp from '../components/CountUp'
import QuestionOfTheDay from '../components/QuestionOfTheDay'
import { usePageTitle } from '../lib/usePageTitle'

/* Ledger home (design 1b) — numbered feature cards, serif titles, "Open →". */
const features = [
  {
    n: '01',
    title: 'Calculators & Solvers',
    desc: `${calculators.length} tools that reveal the full working, step by step — so you learn the method, not just the answer.`,
    to: '/learn',
  },
  {
    n: '02',
    title: 'Practice & Quizzes',
    desc: 'Topic-wise quizzes with reasoning after each answer, difficulty tags and a beat-the-clock mode.',
    to: '/practice',
  },
  {
    n: '03',
    title: 'Ask AccrualSense',
    desc: 'A 24/7 AI doubt-tutor in Dr. Desai’s style, plus worked answers to the most common doubts.',
    to: '/ask',
  },
  {
    n: '04',
    title: 'Career Guide',
    desc: 'CA, CS, CMA, MBA, ACCA & government tracks — eligibility, structure and prospects at a glance.',
    to: '/career',
  },
]

/* marquee — calculator names scroll by; track duplicated for a seamless loop */
const marqueeNames = calculators.map((c) => c.title)

function MarqueeTrack() {
  return (
    <>
      {marqueeNames.map((name, i) => (
        <span key={i} className="whitespace-nowrap px-6 font-display text-[19px] text-slate-600">
          <span className="text-brand-600">·</span> {name}
        </span>
      ))}
    </>
  )
}

const heroRise = (delay: number, reduce: boolean) =>
  reduce
    ? {}
    : ({
        initial: { y: 22 },
        animate: { y: 0 },
        transition: { duration: 0.8, ease: [0.2, 0.7, 0.2, 1] as const, delay },
      } as const)

export default function Home() {
  usePageTitle() // default brand title
  const reduce = useReducedMotion() ?? false
  return (
    <>
      {/* ---------- Hero — 2-col, offset-frame photo ---------- */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-14 pt-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:pt-16">
        <div>
          <motion.div {...heroRise(0, reduce)}>
            <span className="eyebrow">A free learning hub · est. by a professor</span>
          </motion.div>
          <motion.h1
            {...heroRise(0.09, reduce)}
            className="mt-5 text-5xl leading-[1.0] sm:text-6xl lg:text-7xl"
          >
            Master commerce, <span className="italic text-brand-600">for free.</span>
          </motion.h1>
          <motion.p {...heroRise(0.17, reduce)} className="mt-6 max-w-md text-lg leading-relaxed text-slate-600">
            Calculators that show their working, practice quizzes, formula sheets and a 24/7 AI
            doubt-tutor — everything one professor of 22 years wishes every commerce student had.
          </motion.p>
          <motion.div {...heroRise(0.25, reduce)} className="mt-8 flex flex-wrap gap-3.5">
            <Link to="/learn" className="btn-accent px-6 py-3.5 text-[15px]">
              Start Learning <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/ask" className="btn-outline px-6 py-3.5 text-[15px]">
              Ask a Doubt
            </Link>
          </motion.div>
          {/* stat strip — serif numbers over a teal left rule */}
          <motion.div {...heroRise(0.33, reduce)} className="mt-10 flex gap-8 sm:gap-9">
            <div className="border-l-2 border-line pl-3.5">
              <p className="font-display text-3xl font-semibold text-slate-900">
                <CountUp to={22} />
                <span className="text-brand-600">+</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-400">Years teaching</p>
            </div>
            <div className="border-l-2 border-line pl-3.5">
              <p className="font-display text-3xl font-semibold text-slate-900">
                <CountUp to={calculators.length} />
              </p>
              <p className="mt-0.5 text-xs text-slate-400">Calculators</p>
            </div>
            <div className="border-l-2 border-line pl-3.5">
              <p className="font-display text-3xl font-semibold text-slate-900">
                <CountUp to={3} />
              </p>
              <p className="mt-0.5 text-xs text-slate-400">Languages</p>
            </div>
          </motion.div>
        </div>

        {/* professor photo in the offset accent frame */}
        <motion.div
          {...heroRise(0.2, reduce)}
          className="relative mx-auto w-full max-w-sm lg:max-w-none"
        >
          <div aria-hidden className="absolute -bottom-3.5 -right-3.5 left-[18px] top-[18px] rounded-md border-[1.5px] border-brand-600 opacity-50" />
          <div className="relative overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_24px_50px_-24px_rgb(30_26_18/0.35)]">
            <img
              src={professor.photo}
              alt={professor.name}
              className="aspect-[4/4.2] w-full object-cover"
            />
            <div className="border-t border-slate-200 px-5 py-4">
              <p className="font-display text-[19px] font-semibold text-slate-900">{professor.name}</p>
              <p className="mt-1 text-[13px] text-slate-600">{professor.role} · Surat</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ---------- Marquee — every calculator, drifting by ---------- */}
      <section className="relative overflow-hidden border-y border-slate-200 bg-white py-5" aria-label="All calculators">
        <div className="animate-marquee flex w-max">
          <MarqueeTrack />
          <MarqueeTrack />
        </div>
      </section>

      {/* ---------- Question of the day — the daily habit hook ---------- */}
      <section className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
        <Reveal>
          <QuestionOfTheDay />
        </Reveal>
      </section>

      {/* ---------- Features — numbered 2×2 ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-5 pt-16 sm:px-6">
        <Reveal className="mb-9">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
            The syllabus, made simple
          </p>
          <h2 className="mt-2.5 text-4xl sm:text-[42px] sm:leading-tight">Four tools, one free hub.</h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f, i) => (
            <Reveal key={f.n} delay={i * 0.09}>
              <Link to={f.to} className="cl-card cl-card-lift flex h-full gap-5 rounded-lg p-6 sm:p-7">
                <span className="shrink-0 font-display text-4xl leading-none text-line">{f.n}</span>
                <span className="block">
                  <h3 className="font-display text-[23px] font-semibold leading-snug">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
                  <span className="mt-3.5 inline-flex items-center gap-1 text-[13px] font-bold text-brand-600">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- CTA — ink band with faint internal rules ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-11 sm:px-6">
        <Reveal>
          <div className="ink-card ink-lines rounded-[10px] px-8 py-12 text-center sm:px-11 sm:py-14">
            <h2 className="font-display text-3xl font-medium text-slate-50 sm:text-[40px] sm:leading-tight">
              Stuck the night before an exam?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed opacity-70">
              Plug your numbers into a solver, or ask the AI tutor for a step-by-step solution —
              free for every student, whenever you need it.
            </p>
            <Link to="/learn" className="btn-accent mt-7 px-7 py-3.5 text-[15px]">
              Explore the Learn Hub <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* honest trust line — replaces the old "no sign-up" claim (tools ask for a free login) */}
      <p className="sr-only">{site.tagline}</p>
    </>
  )
}
