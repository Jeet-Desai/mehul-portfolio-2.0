import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  X,
  Clock,
  RotateCcw,
  ArrowRight,
  Trophy,
  Shuffle,
  ChevronLeft,
  Timer,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { topics, questions, questionsForTopic, type Question, type Difficulty } from '../data/quizzes'

const SECONDS_PER_Q = 30

const diffTone: Record<Difficulty, string> = {
  Easy: 'bg-mint-100 text-mint-600',
  Medium: 'bg-sun-100 text-sun-600',
  Hard: 'bg-rose-100 text-rose-600',
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type View = 'home' | 'quiz' | 'result'

export default function Practice() {
  const [view, setView] = useState<View>('home')
  const [timed, setTimed] = useState(false)
  const [topicTitle, setTopicTitle] = useState('')
  const [deck, setDeck] = useState<Question[]>([])
  const [idx, setIdx] = useState(0)
  const [picks, setPicks] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [difficulty, setDifficulty] = useState<Difficulty | 'All'>('All')
  const [count, setCount] = useState<number>(10) // 0 = All

  const start = (deckIn: Question[], title: string) => {
    const d = shuffle(deckIn)
    setDeck(d)
    setTopicTitle(title)
    setIdx(0)
    setPicks(Array(d.length).fill(null))
    setTimeLeft(d.length * SECONDS_PER_Q)
    setView('quiz')
  }

  // Filter by the chosen difficulty, shuffle, then take the chosen count.
  // Re-run on every start, so each attempt is a fresh random draw.
  const buildPool = (base: Question[]) => {
    const filtered = difficulty === 'All' ? base : base.filter((qq) => qq.difficulty === difficulty)
    const sh = shuffle(filtered)
    return count === 0 ? sh : sh.slice(0, count)
  }
  const startTopic = (topicId: string, title: string) => start(buildPool(questionsForTopic(topicId)), title)
  const startMixed = () => start(buildPool(questions), 'Mixed quiz')

  // countdown for timed mode
  useEffect(() => {
    if (view !== 'quiz' || !timed) return
    if (timeLeft <= 0) {
      setView('result')
      return
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [view, timed, timeLeft])

  const q = deck[idx]
  const picked = picks[idx]
  const answered = picked != null
  const score = useMemo(
    () => picks.reduce<number>((n, p, i) => n + (p === deck[i]?.correct ? 1 : 0), 0),
    [picks, deck],
  )

  const choose = (option: number) => {
    if (answered) return
    setPicks((ps) => ps.map((p, i) => (i === idx ? option : p)))
  }

  const next = () => {
    if (idx + 1 < deck.length) setIdx((i) => i + 1)
    else setView('result')
  }

  const reset = () => {
    setView('home')
    setDeck([])
    setIdx(0)
    setPicks([])
  }

  /* ----------------------------- HOME ----------------------------- */
  if (view === 'home') {
    return (
      <>
        <PageHeader
          eyebrow="Practice & Quizzes"
          title="Test yourself, topic by topic"
          subtitle="Multiple-choice questions with the worked reasoning revealed after each answer. Pick a topic, or take a quick mixed quiz."
        />
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Choose a topic</h2>
            <label className="flex cursor-pointer items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400" />
              <Timer className="h-4 w-4" /> Beat-the-clock mode
            </label>
          </div>

          {/* difficulty + count config — applied to whichever quiz you start */}
          <div className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Difficulty</p>
              <div className="flex flex-wrap gap-2">
                {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                      difficulty === d ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Number of questions</p>
              <div className="flex flex-wrap gap-2">
                {([5, 10, 15, 20, 0] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                      count === n ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {n === 0 ? 'All' : n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((t) => {
              const avail = (difficulty === 'All'
                ? questionsForTopic(t.id)
                : questionsForTopic(t.id).filter((qq) => qq.difficulty === difficulty)
              ).length
              return (
                <button
                  key={t.id}
                  onClick={() => startTopic(t.id, t.title)}
                  disabled={avail === 0}
                  className="cl-card flex h-full flex-col p-6 text-left disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                      <t.icon className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">{avail} Qs</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{t.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-slate-600">{t.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                    Start quiz <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              )
            })}

            <button
              onClick={startMixed}
              className="flex h-full flex-col justify-between rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-left text-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20">
                  <Shuffle className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold">Mixed quick quiz</h3>
                <p className="mt-1.5 text-sm text-white/80">
                  {count === 0 ? 'All' : count} random {difficulty === 'All' ? '' : `${difficulty.toLowerCase()} `}questions across every topic — a fast warm-up before exams.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                Start now <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            Questions are randomised on every attempt — set your difficulty and length above. Solutions appear after you answer, so try first, then check.
          </p>
        </div>
      </>
    )
  }

  /* ----------------------------- RESULT ----------------------------- */
  if (view === 'result') {
    const total = deck.length
    const pct = total ? Math.round((score / total) * 100) : 0
    const msg = pct >= 80 ? 'Excellent — exam ready!' : pct >= 50 ? 'Good effort — review the misses below.' : 'Keep practising — revisit the explanations.'
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="cl-card p-8 text-center hover:translate-y-0">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            <Trophy className="h-8 w-8" />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold">{score} / {total} correct</h2>
          <p className="mt-1 font-display text-4xl font-extrabold text-brand-600">{pct}%</p>
          <p className="mt-2 text-slate-600">{msg}</p>
          <p className="mt-1 text-sm text-slate-400">{topicTitle}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => start(deck, topicTitle)} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700">
              <RotateCcw className="h-4 w-4" /> Retry
            </button>
            <button onClick={reset} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
              <ChevronLeft className="h-4 w-4" /> All topics
            </button>
          </div>
        </div>

        <h3 className="mt-8 mb-3 text-lg font-bold">Review</h3>
        <div className="space-y-3">
          {deck.map((dq, i) => {
            const p = picks[i]
            const right = p === dq.correct
            return (
              <div key={dq.id} className="cl-card p-5 hover:translate-y-0">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${right ? 'bg-mint-100 text-mint-600' : 'bg-rose-100 text-rose-600'}`}>
                    {right ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{dq.question}</p>
                    <p className="mt-1 text-sm text-mint-600">Correct: {dq.options[dq.correct]}</p>
                    {p != null && !right && <p className="text-sm text-rose-500">You chose: {dq.options[p]}</p>}
                    {p == null && <p className="text-sm text-slate-400">Not answered</p>}
                    <p className="mt-1 text-xs text-slate-500">{dq.explanation}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  /* ----------------------------- QUIZ ----------------------------- */
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* progress bar */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <button onClick={reset} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700">
          <ChevronLeft className="h-4 w-4" /> Quit
        </button>
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
          <span>Q {idx + 1} / {deck.length}</span>
          <span className="text-mint-600">Score {score}</span>
          {timed && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${timeLeft <= 15 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
              <Clock className="h-3.5 w-3.5" /> {mm}:{ss}
            </span>
          )}
        </div>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${((idx + (answered ? 1 : 0)) / deck.length) * 100}%` }} />
      </div>

      <div className="cl-card p-6 hover:translate-y-0 sm:p-8">
        <span className={`cl-pill ${diffTone[q.difficulty]}`}>{q.difficulty}</span>
        <h2 className="mt-3 text-lg font-bold sm:text-xl">{q.question}</h2>

        <div className="mt-5 space-y-2.5">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correct
            const isPicked = i === picked
            let cls = 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10'
            if (answered) {
              if (isCorrect) cls = 'border-mint-300 bg-mint-50 dark:border-mint-500/40 dark:bg-mint-500/15'
              else if (isPicked) cls = 'border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/15'
              else cls = 'border-slate-200 bg-white opacity-60'
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={answered}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium text-slate-700 transition ${cls}`}
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </span>
                {answered && isCorrect && <Check className="h-5 w-5 shrink-0 text-mint-600" />}
                {answered && isPicked && !isCorrect && <X className="h-5 w-5 shrink-0 text-rose-500" />}
              </button>
            )
          })}
        </div>

        {answered && (
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className={`text-sm font-bold ${picked === q.correct ? 'text-mint-600' : 'text-rose-500'}`}>
              {picked === q.correct ? 'Correct!' : 'Not quite.'}
            </p>
            <p className="mt-1 text-sm text-slate-600">{q.explanation}</p>
            <button
              onClick={next}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              {idx + 1 < deck.length ? 'Next question' : 'See results'} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
