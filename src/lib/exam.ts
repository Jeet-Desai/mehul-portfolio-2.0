/* ----------------------------------------------------------------------------
   Exam countdown — the student picks their exam (or names their own) and a
   date; the navbar shows days-left until it passes. localStorage only.

   Presets are NAMES ONLY (no dates) — exam dates change every year and must
   never be asserted; the student enters their own date from the official
   timetable. (Correctness rule: never invent statutory/exam facts.)
---------------------------------------------------------------------------- */
import { todayKey } from './progress'

const KEY = 'as:exam'

export type ExamTarget = { name: string; date: string } // date = YYYY-MM-DD (local)

export const examPresets = [
  'University Semester Exam',
  'CA Foundation',
  'CA Intermediate',
  'CS Executive',
  'CMA Foundation',
  'CMA Intermediate',
  'UGC-NET (Commerce)',
  'Bank / Govt. Exam',
] as const

export function getExam(): ExamTarget | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const e = JSON.parse(raw) as ExamTarget
    if (!e?.name || !e?.date) return null
    return e
  } catch {
    return null
  }
}

/** Same-tab subscribers (the navbar chip) hear changes via this event. */
export const EXAM_EVENT = 'as:exam-changed'

export function setExam(e: ExamTarget) {
  try {
    localStorage.setItem(KEY, JSON.stringify(e))
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new Event(EXAM_EVENT))
}

export function clearExam() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new Event(EXAM_EVENT))
}

/** Whole days from today until the exam (0 = today, negative = past). */
export function daysLeft(e: ExamTarget, today = todayKey()): number {
  const [ay, am, ad] = today.split('-').map(Number)
  const [by, bm, bd] = e.date.split('-').map(Number)
  return Math.round((new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime()) / 86_400_000)
}
