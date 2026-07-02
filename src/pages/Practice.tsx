import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  X,
  Clock,
  RotateCcw,
  ArrowRight,
  Trophy,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Timer,
  FileText,
  Printer,
} from 'lucide-react'
import { Eye, Layers, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { topics, questions, questionsForTopic, type Question, type Difficulty } from '../data/quizzes'
import {
  practiceSets,
  questionsForSet,
  PRACTICE_SOURCE,
  type PracticeQuestion as LongQuestion,
  type QTable,
} from '../data/practiceQuestions'
import { getCalculator } from '../calculators/registry'
import { recordAnswer, recordQuizFinish } from '../lib/progress'
import { usePageTitle } from '../lib/usePageTitle'

const longDiffTone: Record<'Easy' | 'Medium' | 'Hard', string> = {
  Easy: 'bg-mint-50 text-mint-600',
  Medium: 'bg-sun-50 text-sun-600',
  Hard: 'bg-rose-50 text-rose-600',
}

/** Renders a worked-solution / given-data table. Scrolls horizontally on small screens. */
function WorkTable({ t }: { t: QTable }) {
  return (
    <div className="mt-3">
      {t.caption && <p className="mb-1.5 text-[13px] font-semibold text-slate-800">{t.caption}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-[13px]">
          {t.head && (
            <thead>
              <tr className="border-b border-slate-200">
                {t.head.map((h, i) => (
                  <th
                    key={i}
                    className={`py-1.5 pr-3 font-sans text-[11px] font-bold uppercase tracking-[0.04em] text-slate-400 ${
                      i === 0 ? 'text-left' : 'text-right'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {t.rows.map((r, ri) => {
              const isTotal = r[0] === '' || /total|balance c\/d|^\(|funds from operations/i.test(r[0])
              return (
                <tr key={ri} className="border-b border-slate-100 last:border-0">
                  {r.map((c, ci) => (
                    <td
                      key={ci}
                      className={`py-1.5 pr-3 align-top ${ci === 0 ? 'text-left text-slate-700' : 'text-right tabular-nums text-slate-800'} ${
                        isTotal ? 'font-semibold text-slate-900' : ''
                      }`}
                    >
                      {c}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** A long-form practice question with given data + reveal-on-click worked solution. */
function LongFormQuestion({ item, index }: { item: LongQuestion; index: number }) {
  const [show, setShow] = useState(false)
  return (
    <div className="cl-card p-5 sm:p-6">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-display text-[15px] text-brand-600">Q{index + 1}.</span>
        {item.exam && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
            {item.exam}
          </span>
        )}
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${longDiffTone[item.difficulty]}`}>
          {item.difficulty}
        </span>
      </div>
      <p className="text-sm font-semibold leading-relaxed text-slate-900">{item.prompt}</p>

      {item.given?.map((t, i) => (
        <WorkTable key={i} t={t} />
      ))}

      {item.info && item.info.length > 0 && (
        <div className="mt-3">
          <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-slate-400">Additional information</p>
          <ol className="mt-1 list-decimal space-y-1 pl-5 text-[13px] leading-relaxed text-slate-600">
            {item.info.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ol>
        </div>
      )}
      {item.requirement && <p className="mt-3 text-[13px] font-semibold text-slate-700">{item.requirement}</p>}

      <button
        onClick={() => setShow((s) => !s)}
        className="btn-outline mt-4 px-3.5 py-1.5 text-[13px]"
      >
        <Eye className="h-3.5 w-3.5" /> {show ? 'Hide worked solution' : 'Show worked solution'}
      </button>
      {!show && <p className="mt-2 text-xs text-slate-400">Try it yourself first, then check the professor's working.</p>}

      {show && (
        <div className="mt-4 rounded-[10px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
          {item.solution.map((t, i) => (
            <WorkTable key={i} t={t} />
          ))}
          {item.notes && item.notes.length > 0 && (
            <div className="mt-4">
              <p className="text-[12px] font-bold uppercase tracking-[0.06em] text-slate-400">Working notes</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-slate-600">
                {item.notes.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-4 rounded-[8px] bg-brand-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-700">
            <span className="font-bold text-brand-700">Answer: </span>
            {item.answer}
          </div>
        </div>
      )}
    </div>
  )
}

const SECONDS_PER_Q = 30
const MOCK_QUESTIONS = 20
const MOCK_SECONDS = 25 * 60

const diffTone: Record<Difficulty, string> = {
  Easy: 'bg-mint-50 text-mint-600',
  Medium: 'bg-sun-50 text-sun-600',
  Hard: 'bg-rose-50 text-rose-600',
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const fmtTime = (s: number) => {
  const clamped = Math.max(0, s)
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`
}

/** Mock deck: 20 questions (or every question, if fewer exist) drawn evenly
    across topics — shuffle each topic's pool, then round-robin until full. */
function buildMockDeck(): Question[] {
  const pools = shuffle(topics.map((t) => shuffle(questionsForTopic(t.id))))
  const target = Math.min(MOCK_QUESTIONS, questions.length)
  const out: Question[] = []
  while (out.length < target && pools.some((p) => p.length > 0)) {
    for (const pool of pools) {
      if (out.length >= target) break
      const q = pool.shift()
      if (q) out.push(q)
    }
  }
  return shuffle(out)
}

type View = 'home' | 'quiz' | 'result' | 'exam' | 'exam-result' | 'longform'

export default function Practice() {
  usePageTitle(
    'Practice Quizzes & Mock Exams',
    'Topic-wise MCQ practice with worked explanations, plus a 25-minute exam-conditions mock — free for every commerce student.',
  )

  const [view, setView] = useState<View>('home')
  const [timed, setTimed] = useState(false)
  const [topicTitle, setTopicTitle] = useState('')
  const [topicId, setTopicId] = useState('')
  const [deck, setDeck] = useState<Question[]>([])
  const [idx, setIdx] = useState(0)
  const [picks, setPicks] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [difficulty, setDifficulty] = useState<Difficulty | 'All'>('All')
  const [count, setCount] = useState<number>(10) // 0 = All
  // mock-exam extras
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [examTimeUsed, setExamTimeUsed] = useState(0)
  // long-form practice-question set currently open
  const [longSetId, setLongSetId] = useState('')

  const start = (deckIn: Question[], title: string, id: string) => {
    const d = shuffle(deckIn)
    setDeck(d)
    setTopicTitle(title)
    setTopicId(id)
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
  const startTopic = (topicId: string, title: string) => start(buildPool(questionsForTopic(topicId)), title, topicId)
  const startMixed = () => start(buildPool(questions), 'Mixed quiz', 'mixed')

  // Exam conditions: fixed paper, fixed clock — ignores the difficulty/count chips.
  const startMock = () => {
    const d = buildMockDeck()
    setDeck(d)
    setTopicTitle('Mock exam')
    setTopicId('mixed')
    setIdx(0)
    setPicks(Array(d.length).fill(null))
    setTimeLeft(MOCK_SECONDS)
    setConfirmSubmit(false)
    setView('exam')
  }

  const finish = () => {
    recordQuizFinish({
      topicId,
      score: picks.reduce<number>((n, p, i) => n + (p === deck[i]?.correct ? 1 : 0), 0),
      total: deck.length,
      mode: topicId === 'mixed' ? 'mixed' : 'topic',
    })
    setView('result')
  }

  // Mock submit — no per-answer recording during the exam; one record at the end.
  const submitExam = () => {
    setExamTimeUsed(MOCK_SECONDS - Math.max(0, timeLeft))
    recordQuizFinish({
      topicId: 'mixed',
      score: picks.reduce<number>((n, p, i) => n + (p === deck[i]?.correct ? 1 : 0), 0),
      total: deck.length,
      mode: 'mock',
    })
    setView('exam-result')
  }

  // countdown for timed mode
  useEffect(() => {
    if (view !== 'quiz' || !timed) return
    if (timeLeft <= 0) {
      finish()
      return
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [view, timed, timeLeft])

  // countdown for the mock exam — auto-submits at zero
  useEffect(() => {
    if (view !== 'exam') return
    if (timeLeft <= 0) {
      submitExam()
      return
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [view, timeLeft])

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
    recordAnswer(topicId, option === q.correct)
  }

  // exam picks are changeable and never touch recordAnswer
  const examPick = (option: number) => {
    setPicks((ps) => ps.map((p, i) => (i === idx ? option : p)))
    setConfirmSubmit(false)
  }

  const next = () => {
    if (idx + 1 < deck.length) setIdx((i) => i + 1)
    else finish()
  }

  const reset = () => {
    setView('home')
    setDeck([])
    setIdx(0)
    setPicks([])
    setConfirmSubmit(false)
  }

  /* ----------------------------- HOME ----------------------------- */
  if (view === 'home') {
    return (
      <>
        <PageHeader
          eyebrow="Practice & Quizzes"
          title="Test yourself,"
          titleAccent="topic by topic."
          subtitle="Multiple-choice questions with the worked reasoning revealed after each answer. Pick a topic, or take a quick mixed quiz."
        />
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Reveal className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl">Choose a topic</h2>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={timed}
                onChange={(e) => setTimed(e.target.checked)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={`relative inline-block h-[18px] w-[34px] rounded-full transition ${
                  timed ? 'bg-brand-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all ${
                    timed ? 'left-[18px]' : 'left-0.5'
                  }`}
                />
              </span>
              <Timer className="h-4 w-4" /> Beat-the-clock mode
            </label>
          </Reveal>

          {/* difficulty + count config — applied to whichever quiz you start */}
          <div className="cl-card mb-4 grid gap-5 p-5 sm:grid-cols-2">
            <div>
              <p className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">Difficulty</p>
              <div className="flex flex-wrap gap-2">
                {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`rounded-full px-[15px] py-[7px] text-[12.5px] transition ${
                      difficulty === d
                        ? 'bg-brand-600 font-bold text-white'
                        : 'bg-slate-100 font-semibold text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">Number of questions</p>
              <div className="flex flex-wrap gap-2">
                {([5, 10, 15, 20, 0] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`rounded-full px-[15px] py-[7px] text-[12.5px] transition ${
                      count === n
                        ? 'bg-brand-600 font-bold text-white'
                        : 'bg-slate-100 font-semibold text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {n === 0 ? 'All' : n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((t, i) => {
              const avail = (difficulty === 'All'
                ? questionsForTopic(t.id)
                : questionsForTopic(t.id).filter((qq) => qq.difficulty === difficulty)
              ).length
              return (
                <button
                  key={t.id}
                  onClick={() => startTopic(t.id, t.title)}
                  disabled={avail === 0}
                  className="cl-card cl-card-lift flex h-full flex-col rounded-[10px] p-[22px] text-left disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-[26px] leading-none text-line">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="rounded-full bg-slate-100 px-[9px] py-[3px] text-[11px] font-bold text-slate-400">
                      {avail} Qs
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-[19px] font-semibold leading-snug">{t.title}</h3>
                  <p className="mt-1.5 flex-1 text-[12.5px] leading-normal text-slate-600">{t.blurb}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-brand-600">
                    Start quiz <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              )
            })}

            <button
              onClick={startMixed}
              className="ink-card cl-card-lift flex h-full flex-col justify-between rounded-[10px] p-[22px] text-left"
            >
              <div>
                <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-white/15">
                  <Shuffle className="h-5 w-5" />
                </span>
                <h3 className="mt-3.5 font-display text-[19px] font-semibold leading-snug text-slate-50">
                  Mixed quick quiz
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-normal opacity-70">
                  {count === 0 ? 'All' : count} random {difficulty === 'All' ? '' : `${difficulty.toLowerCase()} `}questions across every topic — a fast warm-up before exams.
                </p>
              </div>
              <span className="mt-3.5 inline-flex items-center gap-1 text-[13px] font-bold">
                Start now <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>

          {/* exam-conditions mock — fixed paper, fixed clock, no feedback until submit */}
          <Reveal className="mt-4">
            <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-brand-50 p-6 sm:flex-row sm:items-center sm:p-7">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px] border border-slate-200 bg-white text-brand-600">
                <FileText className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-brand-600">
                  Exam conditions
                </p>
                <h3 className="mt-1 font-display text-[22px] font-semibold leading-snug">Mock exam</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                  20 questions across every topic · 25 minutes · no answers until you submit. The
                  difficulty and length settings above don't apply here.
                </p>
              </div>
              <button onClick={startMock} className="btn-accent shrink-0 self-start px-5 py-2.5 sm:self-center">
                Start mock exam <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </Reveal>

          {/* Long-form practice questions — real past-exam numericals with worked solutions */}
          <Reveal className="mb-4 mt-12 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl">Practice questions</h2>
            <p className="text-[12.5px] text-slate-500">Full past-exam numericals with step-by-step worked solutions</p>
          </Reveal>
          <div className="grid gap-3.5 sm:grid-cols-2">
            {practiceSets.map((s) => {
              const n = questionsForSet(s.id).length
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setLongSetId(s.id)
                    setView('longform')
                  }}
                  className="cl-card cl-card-lift flex h-full flex-col rounded-[10px] p-[22px] text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-brand-50 text-brand-600">
                      <Layers className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-slate-100 px-[9px] py-[3px] text-[11px] font-bold text-slate-400">
                      {n} {n === 1 ? 'question' : 'questions'}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-[19px] font-semibold leading-snug">{s.title}</h3>
                  <p className="mt-1.5 flex-1 text-[12.5px] leading-normal text-slate-600">{s.blurb}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-brand-600">
                    Open questions <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">{PRACTICE_SOURCE}</p>

          <p className="mt-8 text-center text-xs text-slate-400">
            Questions are randomised on every attempt — set your difficulty and length above. Solutions appear after you answer, so try first, then check.
          </p>
        </div>
      </>
    )
  }

  /* ----------------------------- LONG-FORM PRACTICE QUESTIONS ----------------------------- */
  if (view === 'longform') {
    const set = practiceSets.find((s) => s.id === longSetId)
    const list = questionsForSet(longSetId)
    const calc = set?.calculatorSlug ? getCalculator(set.calculatorSlug) : undefined
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <button
          onClick={reset}
          className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-slate-400 transition hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" /> All practice
        </button>
        <p className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-brand-600">Practice questions</p>
        <h1 className="mt-1 font-display text-[30px] font-semibold leading-tight">{set?.title}</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{set?.blurb}</p>

        {calc && (
          <Link
            to={`/learn/c/${calc.slug}`}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-[13px] font-bold text-brand-700 transition hover:bg-brand-100"
          >
            <BookOpen className="h-4 w-4" /> Try the {calc.title} calculator <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}

        <div className="mt-6 space-y-4">
          {list.map((item, i) => (
            <LongFormQuestion key={item.id} item={item} index={i} />
          ))}
        </div>

        <div className="mt-6 rounded-[10px] border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500">
          <p>{PRACTICE_SOURCE}.</p>
          <p className="mt-1">
            These are study aids — always cross-check against your current syllabus and examiner's format. Rupee
            figures follow the original question papers.
          </p>
        </div>
      </div>
    )
  }

  /* ----------------------------- RESULT (quick quiz + mock) ----------------------------- */
  if (view === 'result' || view === 'exam-result') {
    const isMock = view === 'exam-result'
    const total = deck.length
    const pct = total ? Math.round((score / total) * 100) : 0
    const msg = pct >= 80 ? 'Excellent — exam ready!' : pct >= 50 ? 'Good effort — review the misses below.' : 'Keep practising — revisit the explanations.'
    const byTopic = isMock
      ? topics
          .map((t) => {
            const rows = deck.map((dq, i) => ({ dq, p: picks[i] })).filter((r) => r.dq.topic === t.id)
            return {
              id: t.id,
              title: t.title,
              total: rows.length,
              correct: rows.filter((r) => r.p === r.dq.correct).length,
            }
          })
          .filter((r) => r.total > 0)
      : []
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="cl-card p-8 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-600">
            <Trophy className="h-8 w-8" />
          </span>
          <h2 className="mt-4 text-2xl">{score} / {total} correct</h2>
          <p className="mt-1 font-display text-5xl font-semibold text-brand-600">{pct}%</p>
          <p className="mt-3 text-slate-600">{msg}</p>
          <p className="mt-1 text-sm text-slate-400">{topicTitle}</p>
          {isMock && (
            <p className="mt-1 text-sm text-slate-400">
              Time used {fmtTime(examTimeUsed)} of {fmtTime(MOCK_SECONDS)}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
            {isMock ? (
              <button onClick={startMock} className="btn-accent px-5 py-2.5">
                <RotateCcw className="h-4 w-4" /> New mock exam
              </button>
            ) : (
              <button onClick={() => start(deck, topicTitle, topicId)} className="btn-accent px-5 py-2.5">
                <RotateCcw className="h-4 w-4" /> Retry
              </button>
            )}
            <button onClick={reset} className="btn-outline px-5 py-2.5">
              <ChevronLeft className="h-4 w-4" /> All topics
            </button>
            {isMock && (
              <button onClick={() => window.print()} className="btn-outline px-5 py-2.5">
                <Printer className="h-4 w-4" /> Print result card
              </button>
            )}
          </div>
        </div>

        {isMock && byTopic.length > 0 && (
          <div className="cl-card mt-4 px-5 pb-1 sm:px-6">
            <p className="border-b border-slate-100 py-3.5 font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Topic breakdown
            </p>
            {byTopic.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
                <p className="text-sm font-semibold text-slate-800">{r.title}</p>
                <p className="font-display text-[15px] font-semibold text-brand-600">
                  {r.correct}<span className="text-slate-400">/{r.total}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        <h3 className="mt-9 mb-3 font-display text-[22px] font-semibold">Review</h3>
        <div className="space-y-3">
          {deck.map((dq, i) => {
            const p = picks[i]
            const right = p === dq.correct
            return (
              <div key={dq.id} className="cl-card p-5">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${right ? 'bg-mint-50 text-mint-600' : 'bg-rose-50 text-rose-600'}`}>
                    {right ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{dq.question}</p>
                    <p className="mt-1 text-sm text-mint-600">Correct: {dq.options[dq.correct]}</p>
                    {p != null && !right && <p className="text-sm text-rose-500">You chose: {dq.options[p]}</p>}
                    {p == null && <p className="text-sm text-slate-400">Not answered</p>}
                    <p className="mt-1 text-[13px] text-slate-600">{dq.explanation}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  /* ----------------------------- MOCK EXAM PLAYER ----------------------------- */
  if (view === 'exam') {
    const answeredCount = picks.filter((p) => p != null).length
    const unanswered = deck.length - answeredCount
    const lowTime = timeLeft < 120
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* subtle sticky bar — quit + countdown stay in view while scrolling */}
        <div className="sticky top-[68px] z-10 -mx-4 mb-4 flex items-center justify-between gap-4 bg-slate-50/85 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6">
          <button onClick={reset} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-400 transition hover:text-slate-900">
            <ChevronLeft className="h-4 w-4" /> Quit
          </button>
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
            <span>Q {idx + 1} / {deck.length}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px] font-bold ${lowTime ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
              <Clock className="h-3.5 w-3.5" /> {fmtTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* question palette — jump anywhere */}
        <div className="mb-5 flex flex-wrap gap-1.5">
          {deck.map((_, i) => {
            const isAnswered = picks[i] != null
            const isCurrent = i === idx
            return (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Go to question ${i + 1}${isAnswered ? ' (answered)' : ''}`}
                aria-current={isCurrent || undefined}
                className={`grid h-8 w-8 place-items-center rounded-[8px] border text-[12px] font-bold transition ${
                  isCurrent ? 'border-brand-600 ring-2 ring-brand-100' : 'border-transparent'
                } ${
                  isAnswered ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        {/* question card — selectable, changeable, no feedback until submit */}
        <div className="cl-card p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${diffTone[q.difficulty]}`}>
              {q.difficulty}
            </span>
            <span className="text-[12.5px] font-semibold text-slate-400">
              {answeredCount} of {deck.length} answered
            </span>
          </div>
          <h2 className="mt-3.5 text-xl sm:text-[22px]">{q.question}</h2>

          <div className="mt-5 space-y-2.5">
            {q.options.map((opt, i) => {
              const isPicked = i === picked
              return (
                <button
                  key={i}
                  onClick={() => examPick(i)}
                  className={`flex w-full items-center gap-3 rounded-[10px] border px-4 py-3 text-left text-sm font-medium text-slate-700 transition ${
                    isPicked ? 'border-brand-600 bg-brand-50' : 'border-slate-200 bg-white hover:border-brand-600'
                  }`}
                >
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${isPicked ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        {/* prev / next + submit */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2.5">
            <button
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="btn-outline px-4 py-2 text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              onClick={() => setIdx((i) => Math.min(deck.length - 1, i + 1))}
              disabled={idx === deck.length - 1}
              className="btn-outline px-4 py-2 text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {confirmSubmit && unanswered > 0 && (
              <p className="text-[12.5px] font-semibold text-rose-600">
                {unanswered} unanswered — submit anyway?
              </p>
            )}
            <button
              onClick={() => (unanswered > 0 && !confirmSubmit ? setConfirmSubmit(true) : submitExam())}
              className="btn-accent px-5 py-2.5"
            >
              {confirmSubmit && unanswered > 0 ? 'Yes, submit' : 'Submit exam'}
            </button>
          </div>
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
        <button onClick={reset} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-400 transition hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Quit
        </button>
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <span>Q {idx + 1} / {deck.length}</span>
          <span className="text-brand-600">Score {score}</span>
          {timed && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px] font-bold ${timeLeft <= 15 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
              <Clock className="h-3.5 w-3.5" /> {mm}:{ss}
            </span>
          )}
        </div>
      </div>
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${((idx + (answered ? 1 : 0)) / deck.length) * 100}%` }} />
      </div>

      <div className="cl-card p-6 sm:p-8">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${diffTone[q.difficulty]}`}>
          {q.difficulty}
        </span>
        <h2 className="mt-3.5 text-xl sm:text-[22px]">{q.question}</h2>

        <div className="mt-5 space-y-2.5">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correct
            const isPicked = i === picked
            let cls = 'border-slate-200 bg-white hover:border-brand-600'
            if (answered) {
              if (isCorrect) cls = 'border-brand-600 bg-brand-50'
              else if (isPicked) cls = 'border-rose-300 bg-rose-50'
              else cls = 'border-slate-200 bg-white opacity-60'
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={answered}
                className={`flex w-full items-center justify-between gap-3 rounded-[10px] border px-4 py-3 text-left text-sm font-medium text-slate-700 transition ${cls}`}
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </span>
                {answered && isCorrect && <Check className="h-5 w-5 shrink-0 text-brand-600" />}
                {answered && isPicked && !isCorrect && <X className="h-5 w-5 shrink-0 text-rose-500" />}
              </button>
            )
          })}
        </div>

        {answered && (
          <div className="mt-5 rounded-[10px] bg-slate-100 p-4">
            <p className={`text-sm font-bold ${picked === q.correct ? 'text-mint-600' : 'text-rose-500'}`}>
              {picked === q.correct ? 'Correct!' : 'Not quite.'}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{q.explanation}</p>
            <button onClick={next} className="btn-accent mt-4 px-5 py-2.5">
              {idx + 1 < deck.length ? 'Next question' : 'See results'} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
