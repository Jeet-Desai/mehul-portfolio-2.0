import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, CalendarClock, ArrowRight, Layers, Trash2, Target, FlaskConical, TrendingUp, BookOpen, Cloud, HardDrive } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import {
  getStreak, getActivity, getQuizStats, getRecentQuizzes, getCalcUsage,
  weakestTopic, strongestTopic, todayKey, weekSummary, accuracyTrend,
  labTotals, getTopicsRead,
} from '../lib/progress'
import { getExam, setExam, clearExam, daysLeft, examPresets, type ExamTarget } from '../lib/exam'
import { buildCards, srsSummary } from '../lib/srs'
import { topics } from '../data/quizzes'
import { calculators } from '../calculators/registry'
import { useAuth } from '../lib/auth'
import { usePageTitle } from '../lib/usePageTitle'

const topicTitle = (id: string) => topics.find((t) => t.id === id)?.title ?? (id === 'mixed' ? 'Mixed quiz' : id)

const WEEKLY_GOAL = 5 // active study days per week

/* ------------------------------------------------------ small SVG figures -- */

/** Weekly-goal ring — active days this week out of WEEKLY_GOAL. */
function GoalRing({ value, goal }: { value: number; goal: number }) {
  const r = 34
  const c = 2 * Math.PI * r
  const pct = Math.min(1, value / goal)
  return (
    <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
      <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" className="stroke-slate-100" />
      <circle
        cx="40" cy="40" r={r} fill="none" strokeWidth="8" strokeLinecap="round"
        className="stroke-brand-600 transition-all"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
      />
    </svg>
  )
}

/** Tiny accuracy sparkline from the last N quizzes (0–100%). */
function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null
  const w = 220
  const h = 44
  const step = w / (points.length - 1)
  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i * step).toFixed(1)} ${(h - (p / 100) * h).toFixed(1)}`)
    .join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-11 w-full" preserveAspectRatio="none">
      <path d={path} fill="none" className="stroke-brand-600" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={i * step} cy={h - (p / 100) * h} r="2.5" className="fill-brand-600" />
      ))}
    </svg>
  )
}

/* ------------------------------------------------------ activity heat strip */

function HeatStrip() {
  const activity = getActivity()
  // last 16 weeks, aligned to weeks (Mon-first), oldest → newest
  const days = useMemo(() => {
    const out: { key: string; n: number }[] = []
    const today = new Date()
    for (let i = 16 * 7 - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
      const key = todayKey(d)
      out.push({ key, n: activity[key] ?? 0 })
    }
    return out
  }, [activity])

  const tone = (n: number) =>
    n === 0 ? 'bg-slate-100' : n < 3 ? 'bg-brand-200' : n < 8 ? 'bg-brand-400' : 'bg-brand-600'

  return (
    <div className="grid grid-flow-col grid-rows-7 gap-[3px]" aria-label="Activity, last 16 weeks">
      {days.map((d) => (
        <span key={d.key} title={`${d.key}: ${d.n} ${d.n === 1 ? 'activity' : 'activities'}`} className={`h-[9px] w-[9px] rounded-[2px] ${tone(d.n)}`} />
      ))}
    </div>
  )
}

/* ---------------------------------------------------------- exam countdown */

function ExamCard() {
  const [exam, setExamState] = useState<ExamTarget | null>(() => getExam())
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(exam?.name ?? examPresets[0])
  const [date, setDate] = useState(exam?.date ?? '')

  const save = () => {
    if (!date) return
    const e = { name: name.trim() || examPresets[0], date }
    setExam(e)
    setExamState(e)
    setEditing(false)
  }
  const remove = () => {
    clearExam()
    setExamState(null)
    setEditing(false)
  }

  if (!exam || editing) {
    return (
      <div className="cl-card p-5 sm:p-6">
        <h3 className="flex items-center gap-2.5 font-display text-lg font-semibold">
          <CalendarClock className="h-5 w-5 text-brand-600" /> Exam countdown
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
          Pick your exam and its date from the official timetable — a countdown appears in the top bar
          until the day arrives.
        </p>
        <div className="mt-4 grid gap-3">
          <label className="block">
            <span className="text-[12.5px] font-semibold text-slate-600">Exam</span>
            <input
              list="exam-presets"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. B.Com Sem 4"
              className="mt-1.5 w-full rounded-[9px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
            <datalist id="exam-presets">
              {examPresets.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="text-[12.5px] font-semibold text-slate-600">Exam date</span>
            <input
              type="date"
              value={date}
              min={todayKey()}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full rounded-[9px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <div className="flex gap-2.5">
            <button onClick={save} disabled={!date} className="btn-accent px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-50">
              Save countdown
            </button>
            {exam && (
              <button onClick={() => setEditing(false)} className="btn-outline px-5 py-2.5">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const left = daysLeft(exam)
  return (
    <div className="ink-card ink-lines p-5 sm:p-6">
      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] opacity-60">Exam countdown</p>
      <p className="mt-2 font-display text-4xl font-semibold leading-none">
        {left > 0 ? `${left} day${left === 1 ? '' : 's'}` : left === 0 ? 'Today!' : 'Done ✓'}
      </p>
      <p className="mt-2 text-[13px] opacity-70">
        {exam.name} · {exam.date}
      </p>
      <div className="mt-4 flex gap-2">
        <button onClick={() => setEditing(true)} className="rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold">
          Change
        </button>
        <button onClick={remove} aria-label="Remove countdown" className="grid h-7 w-7 place-items-center rounded-full bg-white/15">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- page */

export default function Progress() {
  usePageTitle('My Progress', 'Study streaks, quiz accuracy and revision stats.')
  const { enabled, user } = useAuth()
  const streak = getStreak()
  const stats = getQuizStats()
  const recent = getRecentQuizzes()
  const calcUsage = getCalcUsage()
  const weakest = weakestTopic()
  const strongest = strongestTopic()
  const week = weekSummary()
  const trend = accuracyTrend()
  const lab = labTotals()
  const readCount = Object.keys(getTopicsRead()).length
  const srs = useMemo(() => srsSummary(buildCards()), [])
  const synced = enabled && !!user

  const topCalcs = Object.entries(calcUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, n]) => ({ calc: calculators.find((c) => c.slug === slug), n }))
    .filter((x) => x.calc)

  const hasAny =
    streak.lastDay || recent.length > 0 || Object.keys(stats).length > 0 || lab.attempted > 0 || readCount > 0

  return (
    <>
      <PageHeader
        eyebrow="My Progress"
        title="Your ledger,"
        titleAccent="balanced daily."
        subtitle="Streaks, quiz accuracy, Problem Lab and revision — saved to your account so they follow you across devices."
      />

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6">
        {/* sync status — durable cloud backup when signed in, else device-local */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-slate-600">
          {synced ? (
            <>
              <Cloud className="h-3.5 w-3.5 text-brand-600" /> Synced to your account — your progress follows you across devices
            </>
          ) : (
            <>
              <HardDrive className="h-3.5 w-3.5 text-slate-400" /> Saved on this device
            </>
          )}
        </div>

        {/* top row — streak + exam + flashcards */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Reveal>
            <div className="cl-card h-full p-5 sm:p-6">
              <h3 className="flex items-center gap-2.5 font-display text-lg font-semibold">
                <Flame className={`h-5 w-5 ${streak.current > 0 ? 'text-brand-600' : 'text-slate-400'}`} />
                Study streak
              </h3>
              <div className="mt-3 flex items-baseline gap-4">
                <p className="font-display text-4xl font-semibold text-slate-900">
                  {streak.current}
                  <span className="ml-1 text-base text-slate-400">day{streak.current === 1 ? '' : 's'}</span>
                </p>
                <p className="text-[13px] text-slate-400">best {streak.best}</p>
              </div>
              <div className="mt-4 overflow-x-auto pb-1">
                <HeatStrip />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Any quiz, flashcard or calculator keeps it alive.</span>
                <span className="flex items-center gap-1">
                  Less
                  <span className="h-[9px] w-[9px] rounded-[2px] bg-slate-100" />
                  <span className="h-[9px] w-[9px] rounded-[2px] bg-brand-200" />
                  <span className="h-[9px] w-[9px] rounded-[2px] bg-brand-400" />
                  <span className="h-[9px] w-[9px] rounded-[2px] bg-brand-600" />
                  More
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <ExamCard />
          </Reveal>

          <Reveal delay={0.16}>
            <div className="cl-card flex h-full flex-col p-5 sm:p-6">
              <h3 className="flex items-center gap-2.5 font-display text-lg font-semibold">
                <Layers className="h-5 w-5 text-brand-600" /> Flashcards
              </h3>
              <div className="mt-3 flex items-baseline gap-4">
                <p className="font-display text-4xl font-semibold text-slate-900">
                  {srs.due}
                  <span className="ml-1 text-base text-slate-400">due today</span>
                </p>
              </div>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-600">
                {srs.mastered} of {srs.total} cards mastered — formulas and key terms, spaced so you
                revise them right before you'd forget.
              </p>
              <Link to="/revise" className="btn-accent mt-4 self-start px-5 py-2.5 text-[13px]">
                Revise now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* second row — weekly goal · problem lab · reading */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Reveal>
            <div className="cl-card flex h-full items-center gap-4 p-5">
              <div className="relative shrink-0">
                <GoalRing value={week.activeDays} goal={WEEKLY_GOAL} />
                <span className="absolute inset-0 grid place-items-center font-display text-lg font-semibold text-slate-900">
                  {week.activeDays}/{WEEKLY_GOAL}
                </span>
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                  <Target className="h-4 w-4 text-brand-600" /> Weekly goal
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                  {week.activeDays >= WEEKLY_GOAL
                    ? 'Goal hit — brilliant week. 🎯'
                    : `${WEEKLY_GOAL - week.activeDays} more active day${WEEKLY_GOAL - week.activeDays === 1 ? '' : 's'} to hit your target.`}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">{week.total} actions this week</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="cl-card flex h-full flex-col p-5">
              <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                <FlaskConical className="h-4 w-4 text-brand-600" /> Problem Lab
              </h3>
              {lab.attempted === 0 ? (
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-600">
                  Exam-style sums, graded figure by figure. Try your first one.
                </p>
              ) : (
                <>
                  <div className="mt-2 flex items-baseline gap-3">
                    <p className="font-display text-3xl font-semibold text-slate-900">{lab.solved}</p>
                    <p className="text-[13px] text-slate-400">of {lab.attempted} solved fully</p>
                  </div>
                  <p className="mt-1 flex-1 text-[11px] text-slate-400">
                    {Math.round((lab.solved / lab.attempted) * 100)}% first-try accuracy
                  </p>
                </>
              )}
              <Link to="/lab" className="btn-outline mt-3 self-start px-4 py-2 text-[13px]">
                {lab.attempted === 0 ? 'Open Problem Lab' : 'Practise more'} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="cl-card flex h-full flex-col p-5">
              <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                <BookOpen className="h-4 w-4 text-brand-600" /> Topics studied
              </h3>
              <div className="mt-2 flex items-baseline gap-3">
                <p className="font-display text-3xl font-semibold text-slate-900">{readCount}</p>
                <p className="text-[13px] text-slate-400">library topic{readCount === 1 ? '' : 's'} opened</p>
              </div>
              <p className="mt-1 flex-1 text-[11px] text-slate-400">Notes, worked examples and exam tips.</p>
              <Link to="/resources" className="btn-outline mt-3 self-start px-4 py-2 text-[13px]">
                Open the Library <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* weakest topic callout */}
        {weakest && (
          <Reveal className="mt-4">
            <div className="rounded-xl border border-slate-200 bg-brand-50 p-5 sm:p-6">
              <p className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-brand-600">
                Revise this next
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-slate-900">
                {topicTitle(weakest.topicId)} — {Math.round(weakest.accuracy * 100)}% accuracy
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Your weakest topic so far. Read the notes, then retry a short quiz to lock it in.
              </p>
              <div className="mt-3.5 flex flex-wrap gap-2.5">
                <Link to="/practice" className="btn-accent px-4 py-2 text-[13px]">
                  Retry a 5-question quiz
                </Link>
                <Link to="/resources" className="btn-outline px-4 py-2 text-[13px]">
                  Open the Library
                </Link>
              </div>
              {strongest && strongest.topicId !== weakest.topicId && (
                <p className="mt-3 border-t border-brand-200/60 pt-3 text-[13px] text-slate-600">
                  💪 Strongest so far: <span className="font-semibold text-slate-800">{topicTitle(strongest.topicId)}</span> at{' '}
                  {Math.round(strongest.accuracy * 100)}%.
                </p>
              )}
            </div>
          </Reveal>
        )}

        {/* accuracy by topic + recent quizzes */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <div className="cl-card h-full p-5 sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Accuracy by topic
                </h3>
                {trend.length >= 2 && (
                  <div className="w-40 shrink-0">
                    <p className="mb-1 flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      <TrendingUp className="h-3 w-3" /> Last {trend.length}
                    </p>
                    <Sparkline points={trend} />
                  </div>
                )}
              </div>
              {Object.keys(stats).length === 0 ? (
                <p className="text-sm text-slate-400">Answer some quiz questions and your per-topic accuracy shows up here.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(stats).map(([id, s]) => {
                    const pct = s.attempted ? Math.round((s.correct / s.attempted) * 100) : 0
                    return (
                      <div key={id}>
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-800">{topicTitle(id)}</p>
                          <p className="font-display text-sm font-semibold text-brand-600">
                            {pct}% <span className="font-sans text-xs text-slate-400">({s.correct}/{s.attempted})</span>
                          </p>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="cl-card h-full p-5 sm:p-6">
              <h3 className="mb-4 font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Recent quizzes
              </h3>
              {recent.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No quizzes yet —{' '}
                  <Link to="/practice" className="font-bold text-brand-600">
                    take your first one
                  </Link>
                  .
                </p>
              ) : (
                <ul>
                  {recent.slice(0, 8).map((r, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{topicTitle(r.topicId)}</p>
                        <p className="text-xs text-slate-400">{r.date}{r.mode === 'mock' ? ' · mock exam' : ''}</p>
                      </div>
                      <p className="shrink-0 font-display text-base font-semibold text-brand-600">
                        {r.score}<span className="text-slate-400">/{r.total}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        </div>

        {/* most-used calculators */}
        {topCalcs.length > 0 && (
          <Reveal className="mt-4">
            <div className="cl-card p-5 sm:p-6">
              <h3 className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Your most-used calculators
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {topCalcs.map(({ calc, n }) => (
                  <Link
                    key={calc!.slug}
                    to={`/learn/c/${calc!.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-800 transition hover:border-brand-600 hover:text-brand-600"
                  >
                    {calc!.title}
                    <span className="text-xs text-slate-400">×{n}</span>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {!hasAny && (
          <Reveal className="mt-4">
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <p className="font-display text-lg font-semibold text-slate-600">A fresh ledger.</p>
              <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-400">
                Take a quiz, run a calculator or review a few flashcards — your streak and stats
                start recording from the first one.
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </>
  )
}
