/* ----------------------------------------------------------------------------
   Spaced repetition (Leitner boxes) for flashcards — client-side only.

   Box model (standard Leitner):
     box 1 → review after 1 day (new / lapsed)
     box 2 → after 2 days
     box 3 → after 5 days
     box 4 → after 10 days
     box 5 → after 21 days ("mastered" tier)
   Correct ⇒ move up a box; wrong ⇒ back to box 1 (returns tomorrow). A card
   is DUE when its next-review date is today or earlier; unseen cards are
   always due and enter at box 1 on their first correct answer.

   Card CONTENT is derived fresh from the data files (formulas.ts + resource
   key terms) so it never goes stale; only the schedule lives in localStorage.
---------------------------------------------------------------------------- */
import { formulas } from '../data/formulas'
import { resourceTopics } from '../data/resources'
import { todayKey, touchStreak } from './progress'

const KEY = 'as:srs'

export type CardKind = 'formula' | 'term' | 'term-gu'
export type Card = {
  id: string
  kind: CardKind
  deck: string // deck label shown as the card's category
  front: string
  back: string
  note?: string
}
export type CardSchedule = { box: number; due: string; seen: number; lapses: number }
export type SrsState = Record<string, CardSchedule>

export const BOX_INTERVALS_DAYS = [0, 1, 2, 5, 10, 21] // index by box (1-5)

/* ------------------------------------------------------------------- decks */

/** All available cards, derived from data files (never stored). */
export function buildCards(): Card[] {
  const cards: Card[] = []

  for (const f of formulas) {
    cards.push({
      id: `f:${f.id}`,
      kind: 'formula',
      deck: f.subject,
      front: f.name,
      back: f.expr,
      note: f.note,
    })
  }

  for (const t of resourceTopics) {
    for (let i = 0; i < t.keyTerms.length; i++) {
      const kt = t.keyTerms[i]
      cards.push({
        id: `t:${t.id}:${i}`,
        kind: 'term',
        deck: t.title,
        front: kt.term,
        back: kt.def,
      })
    }
    // EN ↔ ગુજરાતી term drill — only when a Gujarati translation exists
    const gu = t.gu?.keyTerms
    if (gu && gu.length === t.keyTerms.length) {
      for (let i = 0; i < t.keyTerms.length; i++) {
        cards.push({
          id: `g:${t.id}:${i}`,
          kind: 'term-gu',
          deck: `${t.title} · ગુજરાતી`,
          front: t.keyTerms[i].term,
          back: gu[i].term,
          note: gu[i].def,
        })
      }
    }
  }
  return cards
}

export function deckNames(cards: Card[]): { deck: string; kind: CardKind; count: number }[] {
  const m = new Map<string, { deck: string; kind: CardKind; count: number }>()
  for (const c of cards) {
    const e = m.get(c.deck)
    if (e) e.count += 1
    else m.set(c.deck, { deck: c.deck, kind: c.kind, count: 1 })
  }
  return [...m.values()]
}

/* ---------------------------------------------------------------- schedule */

export function getSrsState(): SrsState {
  try {
    const raw = localStorage.getItem(KEY)
    const v = raw ? JSON.parse(raw) : {}
    return typeof v === 'object' && v ? v : {}
  } catch {
    return {}
  }
}

function writeState(s: SrsState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* private mode */
  }
}

function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return todayKey(new Date(y, m - 1, d + days))
}

/** Cards due for review today (unseen cards count as due). */
export function dueCards(cards: Card[], state = getSrsState(), today = todayKey()): Card[] {
  return cards.filter((c) => {
    const s = state[c.id]
    return !s || s.due <= today
  })
}

/** Apply a review result; returns the updated schedule for that card. */
export function review(cardId: string, correct: boolean): CardSchedule {
  const state = getSrsState()
  const prev = state[cardId] ?? { box: 0, due: todayKey(), seen: 0, lapses: 0 }
  const box = correct ? Math.min(5, prev.box + 1) : 1
  const next: CardSchedule = {
    box,
    due: addDays(todayKey(), BOX_INTERVALS_DAYS[box]),
    seen: prev.seen + 1,
    lapses: prev.lapses + (correct ? 0 : 1),
  }
  state[cardId] = next
  writeState(state)
  touchStreak()
  return next
}

/** Summary counts for the revise page header. */
export function srsSummary(cards: Card[], state = getSrsState()) {
  const today = todayKey()
  let due = 0
  let mastered = 0
  let seen = 0
  for (const c of cards) {
    const s = state[c.id]
    if (!s || s.due <= today) due += 1
    if (s) {
      seen += 1
      if (s.box >= 5) mastered += 1
    }
  }
  return { total: cards.length, due, mastered, seen }
}
