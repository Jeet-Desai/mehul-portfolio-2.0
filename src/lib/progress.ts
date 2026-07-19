/* ----------------------------------------------------------------------------
   Learning progress — 100% client-side, stored in localStorage (no backend).

   What it tracks (aggregates, not raw logs — tiny and privacy-friendly):
   - streak        : consecutive days with any learning activity
   - activity      : per-day activity counts (drives the progress heat strip)
   - quiz stats    : per-topic attempted/correct (drives weakest-topic advice)
   - recent quizzes: last N finished quizzes (for the progress page)
   - calc usage    : per-calculator open counts
   - topics read   : resource topics opened

   Every write also "touches" the streak. All reads/writes are guarded — if
   localStorage is unavailable (private mode), everything degrades to no-ops.
---------------------------------------------------------------------------- */

const KEYS = {
  streak: 'as:streak',
  activity: 'as:activity',
  quizStats: 'as:quiz-stats',
  recent: 'as:recent-quizzes',
  calcs: 'as:calc-usage',
  recentCalcs: 'as:recent-calcs',
  reads: 'as:topics-read',
} as const

export type Streak = { current: number; best: number; lastDay: string }
export type TopicStat = { attempted: number; correct: number }
export type QuizRecord = {
  date: string // YYYY-MM-DD (local)
  topicId: string
  score: number
  total: number
  mode?: 'topic' | 'mixed' | 'mock'
}

/* ------------------------------------------------------------------ storage */

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}
function readArr<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    const v = raw ? JSON.parse(raw) : []
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode / quota — degrade silently */
  }
}

/** Local calendar date as YYYY-MM-DD (NOT UTC — matches how students think). */
export function todayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function daysBetween(a: string, b: string): number {
  // date-only strings parsed as LOCAL midnight to avoid UTC drift
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  const da = new Date(ay, am - 1, ad).getTime()
  const db = new Date(by, bm - 1, bd).getTime()
  return Math.round((db - da) / 86_400_000)
}

/* ------------------------------------------------------------------- streak */

export function getStreak(): Streak {
  const s = read<Streak>(KEYS.streak, { current: 0, best: 0, lastDay: '' })
  // a streak that wasn't extended yesterday or today has lapsed
  if (s.lastDay && daysBetween(s.lastDay, todayKey()) > 1) {
    return { ...s, current: 0 }
  }
  return s
}

/** Mark today as active — extends (or restarts) the streak, bumps activity. */
export function touchStreak(): Streak {
  const today = todayKey()
  const s = read<Streak>(KEYS.streak, { current: 0, best: 0, lastDay: '' })
  let current = s.current
  if (!s.lastDay) current = 1
  else {
    const gap = daysBetween(s.lastDay, today)
    if (gap === 0) current = Math.max(1, current)
    else if (gap === 1) current = current + 1
    else current = 1
  }
  const next: Streak = { current, best: Math.max(current, s.best), lastDay: today }
  write(KEYS.streak, next)

  // per-day activity (kept ~26 weeks for the heat strip)
  const act = read<Record<string, number>>(KEYS.activity, {})
  act[today] = (act[today] ?? 0) + 1
  const cutoff = todayKey(new Date(Date.now() - 182 * 86_400_000))
  for (const k of Object.keys(act)) if (k < cutoff) delete act[k]
  write(KEYS.activity, act)
  return next
}

export function getActivity(): Record<string, number> {
  return read<Record<string, number>>(KEYS.activity, {})
}

/* --------------------------------------------------------------- quiz stats */

export function recordAnswer(topicId: string, correct: boolean) {
  const stats = read<Record<string, TopicStat>>(KEYS.quizStats, {})
  const t = stats[topicId] ?? { attempted: 0, correct: 0 }
  t.attempted += 1
  if (correct) t.correct += 1
  stats[topicId] = t
  write(KEYS.quizStats, stats)
  touchStreak()
}

export function recordQuizFinish(rec: Omit<QuizRecord, 'date'>) {
  const list = readArr<QuizRecord>(KEYS.recent)
  list.unshift({ ...rec, date: todayKey() })
  write(KEYS.recent, list.slice(0, 30))
  touchStreak()
}

export function getQuizStats(): Record<string, TopicStat> {
  return read<Record<string, TopicStat>>(KEYS.quizStats, {})
}
export function getRecentQuizzes(): QuizRecord[] {
  return readArr<QuizRecord>(KEYS.recent)
}

/** Weakest topic with a meaningful sample (≥ 5 answers), lowest accuracy first. */
export function weakestTopic(): { topicId: string; accuracy: number } | null {
  const stats = getQuizStats()
  let worst: { topicId: string; accuracy: number } | null = null
  for (const [topicId, s] of Object.entries(stats)) {
    if (s.attempted < 5) continue
    const accuracy = s.correct / s.attempted
    if (!worst || accuracy < worst.accuracy) worst = { topicId, accuracy }
  }
  return worst
}

/* ------------------------------------------------------- calcs & topic reads */

export function recordCalcUse(slug: string) {
  const c = read<Record<string, number>>(KEYS.calcs, {})
  c[slug] = (c[slug] ?? 0) + 1
  write(KEYS.calcs, c)
  // most-recent-first, deduped — drives the "pick up where you left off" strip
  const recent = readArr<string>(KEYS.recentCalcs).filter((s) => s !== slug)
  recent.unshift(slug)
  write(KEYS.recentCalcs, recent.slice(0, 8))
  touchStreak()
}
export function getCalcUsage(): Record<string, number> {
  return read<Record<string, number>>(KEYS.calcs, {})
}
/** Slugs of recently opened calculators, most recent first. */
export function getRecentCalcs(): string[] {
  return readArr<string>(KEYS.recentCalcs)
}

export function recordTopicRead(id: string) {
  const r = read<Record<string, string>>(KEYS.reads, {})
  r[id] = todayKey()
  write(KEYS.reads, r)
  touchStreak()
}
export function getTopicsRead(): Record<string, string> {
  return read<Record<string, string>>(KEYS.reads, {})
}
