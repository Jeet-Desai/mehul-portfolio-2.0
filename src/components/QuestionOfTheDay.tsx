import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, ArrowRight, Check, X } from 'lucide-react'
import { questionOfTheDay, getQotdState, answerQotd } from '../lib/qotd'
import { getStreak } from '../lib/progress'
import { topics } from '../data/quizzes'

/**
 * Question of the Day — same question for everyone, changes at local midnight
 * (deterministic pick, no backend). Answering marks the day active and feeds
 * the streak. Public on the home page as the daily habit hook.
 */
export default function QuestionOfTheDay() {
  const [q] = useState(() => questionOfTheDay())
  const [picked, setPicked] = useState<number | null>(() => getQotdState().picked)
  const [streak, setStreak] = useState(() => getStreak())

  const answered = picked !== null
  const topicTitle = topics.find((t) => t.id === q.topic)?.title ?? q.topic

  const choose = (i: number) => {
    if (answered) return
    answerQotd(i)
    setPicked(i)
    setStreak(getStreak())
  }

  return (
    <div className="cl-card overflow-hidden rounded-[10px]">
      {/* header row — label + streak flame */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-7">
        <div className="flex items-center gap-3">
          <span className="eyebrow">Question of the day</span>
          <span className="hidden text-xs text-slate-400 sm:inline">{topicTitle}</span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            streak.current > 0 ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-400'
          }`}
          title={`Best streak: ${streak.best} day${streak.best === 1 ? '' : 's'}`}
        >
          <Flame className="h-3.5 w-3.5" />
          {streak.current > 0 ? `${streak.current}-day streak` : 'Start a streak'}
        </span>
      </div>

      <div className="px-5 py-6 sm:px-7">
        <p className="font-display text-xl font-semibold leading-snug text-slate-900 sm:text-[22px]">
          {q.question}
        </p>

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correct
            const isPicked = i === picked
            const state = !answered
              ? 'border-slate-200 bg-white hover:border-brand-600 cursor-pointer'
              : isCorrect
                ? 'border-brand-600 bg-brand-50'
                : isPicked
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/30'
                  : 'border-slate-200 bg-white opacity-60'
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={answered}
                className={`flex items-center gap-3 rounded-[10px] border px-4 py-3 text-left text-sm font-semibold text-slate-800 transition ${state}`}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                  {answered && isCorrect ? (
                    <Check className="h-3.5 w-3.5 text-brand-600" />
                  ) : answered && isPicked && !isCorrect ? (
                    <X className="h-3.5 w-3.5 text-rose-500" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                {opt}
              </button>
            )
          })}
        </div>

        {answered && (
          <div className="mt-5 rounded-[10px] bg-slate-100 px-5 py-4">
            <p className={`text-sm font-bold ${picked === q.correct ? 'text-brand-600' : 'text-rose-500'}`}>
              {picked === q.correct ? 'Correct — see you tomorrow!' : 'Not quite — here’s the method:'}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{q.explanation}</p>
            <Link to="/practice" className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-brand-600">
              Practice more like this <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
