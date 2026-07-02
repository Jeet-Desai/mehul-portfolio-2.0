import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, Layers, RotateCcw, Undo2, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { buildCards, deckNames, dueCards, review, srsSummary, getSrsState, type Card } from '../lib/srs'
import { usePageTitle } from '../lib/usePageTitle'

/* Fisher-Yates on a copy — session order is shuffled, schedule is not. */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const kindLabel = { formula: 'Formula', term: 'Key term', 'term-gu': 'EN → ગુજરાતી' } as const

export default function Revise() {
  usePageTitle('Flashcards & Spaced Revision', 'Formulas and key terms as flashcards, spaced so you revise them right before you would forget.')
  const allCards = useMemo(() => buildCards(), [])
  const [deck, setDeck] = useState<string | null>(null)
  const [queue, setQueue] = useState<Card[]>([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [session, setSession] = useState({ right: 0, wrong: 0 })

  const decks = useMemo(() => {
    const state = getSrsState()
    return deckNames(allCards).map((d) => ({
      ...d,
      due: dueCards(allCards.filter((c) => c.deck === d.deck), state).length,
    }))
  }, [allCards, deck]) // re-derive due counts when a session ends

  const summary = useMemo(() => srsSummary(allCards), [allCards, deck, idx])

  const start = (deckName: string | 'all') => {
    const pool = deckName === 'all' ? allCards : allCards.filter((c) => c.deck === deckName)
    const due = shuffle(dueCards(pool)).slice(0, 20) // one session ≤ 20 cards
    if (!due.length) return
    setDeck(deckName)
    setQueue(due)
    setIdx(0)
    setFlipped(false)
    setSession({ right: 0, wrong: 0 })
  }

  const grade = (correct: boolean) => {
    review(queue[idx].id, correct)
    setSession((s) => ({ right: s.right + (correct ? 1 : 0), wrong: s.wrong + (correct ? 0 : 1) }))
    setFlipped(false)
    setIdx((i) => i + 1)
  }

  const reduce = useReducedMotion() ?? false
  const card = queue[idx]
  const inSession = deck !== null && idx < queue.length
  const finished = deck !== null && queue.length > 0 && idx >= queue.length

  return (
    <>
      <PageHeader
        eyebrow="Revise"
        title="Flashcards that come back"
        titleAccent="right before you forget."
        subtitle="Every formula and key term from the Library, spaced with the Leitner method — get a card right and it waits longer; slip, and it returns tomorrow."
      />

      <div className="mx-auto max-w-4xl px-4 pb-12 pt-6 sm:px-6">
        {/* ---------------- deck picker ---------------- */}
        {!deck && (
          <>
            <Reveal>
              <div className="cl-card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
                <div>
                  <p className="font-display text-2xl font-semibold text-slate-900">
                    {summary.due} card{summary.due === 1 ? '' : 's'} due today
                  </p>
                  <p className="mt-1 text-[13px] text-slate-600">
                    {summary.mastered} of {summary.total} mastered · sessions are 20 cards max
                  </p>
                </div>
                <button
                  onClick={() => start('all')}
                  disabled={summary.due === 0}
                  className="btn-accent px-6 py-3 text-[14px] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {summary.due === 0 ? 'All done for today' : 'Revise everything due'}
                  {summary.due > 0 && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </Reveal>

            <Reveal className="mt-8" delay={0.08}>
              <h2 className="h2-marker font-display text-[26px] font-semibold">Decks</h2>
            </Reveal>
            <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
              {decks.map((d, i) => (
                <Reveal key={d.deck} delay={Math.min(i * 0.05, 0.3)}>
                  <button
                    onClick={() => start(d.deck)}
                    disabled={d.due === 0}
                    className="cl-card cl-card-lift flex w-full items-center gap-4 p-5 text-left disabled:cursor-default"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] border border-slate-200 bg-slate-50 text-brand-600">
                      <Layers className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[17px] font-semibold text-slate-900">{d.deck}</span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {kindLabel[d.kind]} · {d.count} cards
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                        d.due > 0 ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {d.due > 0 ? `${d.due} due` : 'done'}
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>
          </>
        )}

        {/* ---------------- review session ---------------- */}
        {inSession && card && (
          <div>
            <div className="flex items-center justify-between gap-4">
              <button onClick={() => setDeck(null)} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600">
                <Undo2 className="h-4 w-4" /> Decks
              </button>
              <p className="text-[13px] font-semibold text-slate-400">
                {idx + 1} / {queue.length}
              </p>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-600 transition-all duration-300" style={{ width: `${(idx / queue.length) * 100}%` }} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={card.id}
                initial={reduce ? false : { y: 22, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduce ? undefined : { y: -14, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                className="cl-card mt-5 overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 sm:px-7">
                  <span className="font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-brand-600">{card.deck}</span>
                  <span className="text-xs text-slate-400">{kindLabel[card.kind]}</span>
                </div>
                <div className="px-5 py-10 text-center sm:px-10">
                  <p className="font-display text-2xl font-semibold leading-snug text-slate-900 sm:text-[28px]">{card.front}</p>
                  {flipped && (
                    <motion.div
                      initial={reduce ? false : { y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
                      className="mx-auto mt-6 max-w-xl"
                    >
                      <div className="rounded-[10px] bg-slate-100 px-6 py-5">
                        <p className="font-display text-lg italic leading-relaxed text-slate-900 sm:text-xl">{card.back}</p>
                      </div>
                      {card.note && <p className="mt-3 text-[13px] leading-relaxed text-slate-600">{card.note}</p>}
                    </motion.div>
                  )}
                </div>
                <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-7">
                  {!flipped ? (
                    <button onClick={() => setFlipped(true)} className="btn-accent w-full py-3 text-[14px]">
                      Show answer
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => grade(false)}
                        className="inline-flex items-center justify-center gap-2 rounded-[11px] border-[1.5px] border-rose-400 py-3 text-[14px] font-bold text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <X className="h-4 w-4" /> Again tomorrow
                      </button>
                      <button onClick={() => grade(true)} className="btn-accent py-3 text-[14px]">
                        <Check className="h-4 w-4" /> Knew it
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* ---------------- session summary ---------------- */}
        {finished && (
          <Reveal>
            <div className="ink-card ink-lines px-8 py-12 text-center">
              <p className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] opacity-60">Session complete</p>
              <p className="mt-3 font-display text-5xl font-semibold leading-none">
                {session.right}
                <span className="text-2xl opacity-60"> / {session.right + session.wrong}</span>
              </p>
              <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed opacity-70">
                {session.wrong === 0
                  ? 'Perfect — every card moves up a box and waits longer before returning.'
                  : `${session.wrong} card${session.wrong === 1 ? '' : 's'} dropped back to box 1 — they'll return tomorrow.`}
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <button onClick={() => setDeck(null)} className="btn-accent px-6 py-3 text-[14px]">
                  <RotateCcw className="h-4 w-4" /> Back to decks
                </button>
                <Link to="/progress" className="rounded-[11px] bg-white/15 px-6 py-3 text-[14px] font-bold">
                  See my progress
                </Link>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </>
  )
}
