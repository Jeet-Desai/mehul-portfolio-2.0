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
  labStats: 'as:lab-stats',
} as const

/* Change notification — the cloud-sync layer (progressSync.ts) registers one
   listener and debounces a push whenever any aggregate changes. Kept as a
   single callback (not an event bus) because there is exactly one consumer. */
let changeListener: (() => void) | null = null
export function setProgressListener(fn: (() => void) | null) {
  changeListener = fn
}
function notifyChange() {
  try {
    changeListener?.()
  } catch {
    /* a broken listener must never break a local write */
  }
}

export type Streak = { current: number; best: number; lastDay: string }
export type TopicStat = { attempted: number; correct: number }
export type LabStat = { attempted: number; solved: number }
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
  notifyChange()
  return next
}

export function getActivity(): Record<string, number> {
  return read<Record<string, number>>(KEYS.activity, {})
}

/** Activity summary for the current Mon–Sun week: active days + total actions. */
export function weekSummary(now = new Date()): { activeDays: number; total: number } {
  const act = getActivity()
  // Monday as day 0
  const dow = (now.getDay() + 6) % 7
  let activeDays = 0
  let total = 0
  for (let i = 0; i <= dow; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const n = act[todayKey(d)] ?? 0
    if (n > 0) activeDays++
    total += n
  }
  return { activeDays, total }
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
  return extremeTopic('weakest')
}

/** Strongest topic with a meaningful sample (≥ 5 answers), highest accuracy. */
export function strongestTopic(): { topicId: string; accuracy: number } | null {
  return extremeTopic('strongest')
}

function extremeTopic(which: 'weakest' | 'strongest'): { topicId: string; accuracy: number } | null {
  const stats = getQuizStats()
  let pick: { topicId: string; accuracy: number } | null = null
  for (const [topicId, s] of Object.entries(stats)) {
    if (s.attempted < 5) continue
    const accuracy = s.correct / s.attempted
    if (!pick || (which === 'weakest' ? accuracy < pick.accuracy : accuracy > pick.accuracy)) {
      pick = { topicId, accuracy }
    }
  }
  return pick
}

/** Accuracy % of the last N finished quizzes, oldest→newest (drives the trend). */
export function accuracyTrend(n = 8): number[] {
  return getRecentQuizzes()
    .slice(0, n)
    .filter((r) => r.total > 0)
    .map((r) => Math.round((r.score / r.total) * 100))
    .reverse()
}

/* -------------------------------------------------------------- lab attempts */

export function recordLabAttempt(templateId: string, allCorrect: boolean) {
  const stats = read<Record<string, LabStat>>(KEYS.labStats, {})
  const t = stats[templateId] ?? { attempted: 0, solved: 0 }
  t.attempted += 1
  if (allCorrect) t.solved += 1
  stats[templateId] = t
  write(KEYS.labStats, stats)
  touchStreak()
}
export function getLabStats(): Record<string, LabStat> {
  return read<Record<string, LabStat>>(KEYS.labStats, {})
}
/** Totals across all lab templates — for the Progress Lab card. */
export function labTotals(): { attempted: number; solved: number } {
  let attempted = 0
  let solved = 0
  for (const s of Object.values(getLabStats())) {
    attempted += s.attempted
    solved += s.solved
  }
  return { attempted, solved }
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

/* -------------------------------------------------------- cloud-sync support

   The sync layer (progressSync.ts) mirrors this whole snapshot to Supabase so a
   student's progress survives a cache clear and follows them across devices.
   The MERGE is field-wise max / latest-wins, which is important: it is
   idempotent and monotonic, so re-merging the same cloud data (every login)
   never double-counts. The trade-off is that true cross-device totals are
   under-counted rather than inflated — the right call for durability. */

export type ProgressSnapshot = {
  streak?: Streak
  activity?: Record<string, number>
  quizStats?: Record<string, TopicStat>
  recent?: QuizRecord[]
  calcs?: Record<string, number>
  recentCalcs?: string[]
  reads?: Record<string, string>
  labStats?: Record<string, LabStat>
}

export function exportProgress(): ProgressSnapshot {
  return {
    streak: read<Streak>(KEYS.streak, { current: 0, best: 0, lastDay: '' }),
    activity: getActivity(),
    quizStats: getQuizStats(),
    recent: getRecentQuizzes(),
    calcs: getCalcUsage(),
    recentCalcs: getRecentCalcs(),
    reads: getTopicsRead(),
    labStats: getLabStats(),
  }
}

const maxByKey = <T extends Record<string, number>>(a: T = {} as T, b: T = {} as T): T => {
  const out: Record<string, number> = { ...a }
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v)
  return out as T
}

/** Per-key pick of the sub-record with the larger `attempted` (monotone). */
function mergeAttempted<T extends { attempted: number }>(
  a: Record<string, T> = {},
  b: Record<string, T> = {},
): Record<string, T> {
  const out: Record<string, T> = { ...a }
  for (const [k, v] of Object.entries(b)) {
    const cur = out[k]
    if (!cur || v.attempted > cur.attempted) out[k] = v
  }
  return out
}

/** Pure merge of two snapshots — commutative-ish, idempotent, never inflates. */
export function mergeSnapshots(a: ProgressSnapshot, b: ProgressSnapshot): ProgressSnapshot {
  const sa = a.streak ?? { current: 0, best: 0, lastDay: '' }
  const sb = b.streak ?? { current: 0, best: 0, lastDay: '' }
  // the streak with the more recent lastDay is authoritative for current/lastDay
  const newer = sb.lastDay > sa.lastDay ? sb : sa
  const streak: Streak = {
    lastDay: newer.lastDay,
    current: sa.lastDay === sb.lastDay ? Math.max(sa.current, sb.current) : newer.current,
    best: Math.max(sa.best, sb.best),
  }

  // recent quizzes: union, dedupe by day+topic+score, newest first, cap 30
  const seen = new Set<string>()
  const recent = [...(a.recent ?? []), ...(b.recent ?? [])]
    .sort((x, y) => (x.date < y.date ? 1 : -1))
    .filter((r) => {
      const k = `${r.date}|${r.topicId}|${r.score}|${r.total}|${r.mode ?? ''}`
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .slice(0, 30)

  // recent calcs: local order first, then cloud, deduped, cap 8
  const recentCalcs = [...(a.recentCalcs ?? []), ...(b.recentCalcs ?? [])]
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, 8)

  // topics read: latest date per topic
  const reads: Record<string, string> = { ...(a.reads ?? {}) }
  for (const [k, v] of Object.entries(b.reads ?? {})) if (!reads[k] || v > reads[k]) reads[k] = v

  return {
    streak,
    activity: maxByKey(a.activity, b.activity),
    quizStats: mergeAttempted(a.quizStats, b.quizStats),
    recent,
    calcs: maxByKey(a.calcs, b.calcs),
    recentCalcs,
    reads,
    labStats: mergeAttempted(a.labStats, b.labStats),
  }
}

/** Write a snapshot back into localStorage (used after a cloud pull-merge). */
export function applySnapshot(s: ProgressSnapshot) {
  if (s.streak) write(KEYS.streak, s.streak)
  if (s.activity) write(KEYS.activity, s.activity)
  if (s.quizStats) write(KEYS.quizStats, s.quizStats)
  if (s.recent) write(KEYS.recent, s.recent)
  if (s.calcs) write(KEYS.calcs, s.calcs)
  if (s.recentCalcs) write(KEYS.recentCalcs, s.recentCalcs)
  if (s.reads) write(KEYS.reads, s.reads)
  if (s.labStats) write(KEYS.labStats, s.labStats)
}
