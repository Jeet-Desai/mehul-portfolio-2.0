/* ----------------------------------------------------------------------------
   Question of the Day — deterministic daily pick from the quiz bank.

   The pick is a pure function of the LOCAL calendar date, so every visitor
   sees the same question on the same day (shareable: "did you get today's?")
   and it needs no backend. Answer state is kept per-day in localStorage.
---------------------------------------------------------------------------- */
import { questions, type Question } from '../data/quizzes'
import { todayKey, touchStreak } from './progress'

const KEY = 'as:qotd'

export type QotdState = {
  date: string
  qid: string
  picked: number | null // option index the student chose (null = unanswered)
}

/** Small deterministic string hash (FNV-1a). */
function hash(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Today's question — same for everyone, changes at local midnight. */
export function questionOfTheDay(date = todayKey()): Question {
  return questions[hash(`qotd:${date}`) % questions.length]
}

export function getQotdState(): QotdState {
  const today = todayKey()
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as QotdState
      if (s.date === today) return s
    }
  } catch {
    /* fall through */
  }
  return { date: today, qid: questionOfTheDay().id, picked: null }
}

/** Record the student's answer; returns whether it was correct. */
export function answerQotd(picked: number): boolean {
  const q = questionOfTheDay()
  const state: QotdState = { date: todayKey(), qid: q.id, picked }
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* private mode — still return correctness */
  }
  touchStreak()
  return picked === q.correct
}
