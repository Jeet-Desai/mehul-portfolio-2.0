import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calculator, PencilLine, Bot, Compass, ArrowRight } from 'lucide-react'
import { site, professor, stats } from '../data/site'

const features = [
  {
    icon: Calculator,
    title: 'Calculators & Solvers',
    desc: 'Break-even, GST, income tax, EMI, depreciation and more — and they show the full working, like a teacher.',
    to: '/learn',
    tone: 'from-brand-500 to-brand-700',
  },
  {
    icon: PencilLine,
    title: 'Practice & Quizzes',
    desc: 'Topic-wise quizzes with the reasoning revealed after each answer, difficulty tags and a beat-the-clock mode.',
    to: '/practice',
    tone: 'from-mint-500 to-mint-600',
  },
  {
    icon: Bot,
    title: 'Ask AccrualSense',
    desc: 'Worked answers to common doubts plus a Doubt Box — and a 24/7 AI tutor in Dr. Desai’s style, on the way.',
    to: '/ask',
    tone: 'from-sun-500 to-sun-600',
  },
  {
    icon: Compass,
    title: 'Career Guide',
    desc: 'CA, CS, CMA, MBA, ACCA and government tracks — eligibility, structure and prospects at a glance.',
    to: '/career',
    tone: 'from-brand-400 to-brand-600',
  },
]

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
}

export default function Home() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        {/* a single warm decorative blob behind the photo (the top-left one was a
            distracting white glow in dark mode, so it was removed) */}
        <div className="pointer-events-none absolute -right-16 top-32 h-72 w-72 rounded-full bg-sun-200/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.h1
              initial="hidden"
              animate="show"
              custom={0}
              variants={fade}
              className="text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl"
            >
              Master Commerce.
              <span className="block bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                For free.
              </span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="show"
              custom={2}
              variants={fade}
              className="mt-5 max-w-lg text-lg text-slate-600"
            >
              {site.description}
            </motion.p>

            <motion.div
              initial="hidden"
              animate="show"
              custom={3}
              variants={fade}
              className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start"
            >
              <Link
                to="/learn"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-700"
              >
                Start Learning <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/ask"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                <Bot className="h-5 w-5 text-brand-600" /> Ask a Doubt
              </Link>
            </motion.div>
          </div>

          {/* professor card — smaller, badges removed (stats live on /about) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mx-auto w-full max-w-[280px]"
          >
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.25em] text-brand-600 dark:text-brand-300">
              An initiative by
            </p>
            <div className="cl-card overflow-hidden p-0 hover:translate-y-0">
              <img
                src={professor.photo}
                alt={professor.name}
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="p-4 text-center">
                <p className="font-display text-base font-bold text-slate-900">{professor.name}</p>
                <p className="text-sm text-slate-500">{professor.role}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- Feature cards ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              custom={i}
              variants={fade}
            >
              <Link to={f.to} className="cl-card flex h-full flex-col p-6">
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${f.tone} text-white shadow-md`}
                >
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">{f.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                  Open <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Stats band ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-4 rounded-3xl bg-brand-600 p-8 text-white sm:grid-cols-4 sm:p-10">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-extrabold sm:text-4xl">
                {s.value}
                {s.suffix ?? ''}
              </p>
              <p className="mt-1 text-sm text-brand-100">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="cl-card flex flex-col items-center gap-5 p-10 text-center hover:translate-y-0">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            Stuck on a sum the night before an exam?
          </h2>
          <p className="max-w-xl text-slate-600">
            Plug your numbers into a solver, or ask the AI tutor for a step-by-step solution. No
            sign-up, no cost — just help when you need it.
          </p>
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-700"
          >
            Explore the Learn Hub <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
