import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, Compass, CornerDownLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { calculators } from '../calculators/registry'
import { formulas } from '../data/formulas'
import { resourceTopics } from '../data/resources'
import { navLinks } from '../data/site'

/* ----------------------------------------------------------------------------
   CommandPalette — the ⌘K site-wide search modal. The parent owns the keyboard
   shortcut and open state; this component only renders the modal and handles
   search, keyboard selection and navigation across pages, calculators,
   study notes (Resource Library topics) and formula-sheet entries.
---------------------------------------------------------------------------- */

type PaletteItem = {
  key: string
  title: string
  /** second line (formulas only) — the expression, truncated to one line */
  sub?: string
  /** right-aligned small label — category / subject / "Page" */
  meta: string
  icon: LucideIcon
  to: string
  /** lower-cased title, for ranked matching */
  titleLc: string
  /** lower-cased joined tags/blurb/etc., for weaker matches */
  restLc: string
}

type PaletteGroup = { label: string; items: PaletteItem[] }

/* The searchable indexes — built once from the static data files. */

const pageItems: PaletteItem[] = navLinks.map((l) => ({
  key: `page:${l.to}`,
  title: l.label,
  meta: 'Page',
  icon: Compass,
  to: l.to,
  titleLc: l.label.toLowerCase(),
  restLc: l.to.toLowerCase(),
}))

const calcItems: PaletteItem[] = calculators.map((c) => ({
  key: `calc:${c.slug}`,
  title: c.title,
  meta: c.category,
  icon: c.icon,
  to: `/learn/c/${c.slug}`,
  titleLc: c.title.toLowerCase(),
  restLc: [c.category, c.blurb, ...(c.tags ?? [])].join(' ').toLowerCase(),
}))

const topicItems: PaletteItem[] = resourceTopics.map((t) => ({
  key: `topic:${t.id}`,
  title: t.title,
  meta: t.subject,
  icon: t.icon,
  to: `/resources/${t.id}`,
  titleLc: t.title.toLowerCase(),
  restLc: [t.subject, t.blurb, ...(t.tags ?? [])].join(' ').toLowerCase(),
}))

const formulaItems: PaletteItem[] = formulas.map((f) => ({
  key: `formula:${f.id}`,
  title: f.name,
  sub: f.expr,
  meta: f.subject,
  icon: FileText,
  to: `/formulas?q=${encodeURIComponent(f.name)}`,
  titleLc: f.name.toLowerCase(),
  restLc: [f.subject, f.expr, f.note ?? '', ...(f.tags ?? [])].join(' ').toLowerCase(),
}))

/** Rank: title prefix (3) > title substring (2) > tag/blurb/expr substring (1). */
function scoreOf(item: PaletteItem, q: string): number {
  if (item.titleLc.startsWith(q)) return 3
  if (item.titleLc.includes(q)) return 2
  if (item.restLc.includes(q)) return 1
  return 0
}

/** Filter + rank a source list against the query, capped per group. */
function pick(items: PaletteItem[], q: string, cap: number): PaletteItem[] {
  return items
    .map((it, i) => ({ it, s: scoreOf(it, q), i }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, cap)
    .map((x) => x.it)
}

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const groups = useMemo<PaletteGroup[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return [
        { label: 'Pages', items: pageItems },
        { label: 'Popular tools', items: calcItems.slice(0, 5) },
      ]
    }
    return [
      { label: 'Pages', items: pick(pageItems, q, 3) },
      { label: 'Calculators', items: pick(calcItems, q, 6) },
      { label: 'Study notes', items: pick(topicItems, q, 4) },
      { label: 'Formulas', items: pick(formulaItems, q, 4) },
    ].filter((g) => g.items.length > 0)
  }, [query])

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups])
  // Keep the selection valid even when the result list shrinks between renders.
  const selected = flat.length === 0 ? -1 : Math.min(sel, flat.length - 1)

  // Fresh state + focus on every open.
  useEffect(() => {
    if (!open) return
    setQuery('')
    setSel(0)
    inputRef.current?.focus()
  }, [open])

  // Reset the selection whenever the query (and hence the result list) changes.
  useEffect(() => {
    setSel(0)
  }, [query])

  // Lock background page scroll while the palette is open. The scroll container
  // is the <html> element, so lock both it and <body> (same pattern as Navbar).
  useEffect(() => {
    if (!open) return
    const docEl = document.documentElement
    const prevHtml = docEl.style.overflow
    const prevBody = document.body.style.overflow
    docEl.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      docEl.style.overflow = prevHtml
      document.body.style.overflow = prevBody
    }
  }, [open])

  const go = (item: PaletteItem) => {
    navigate(item.to)
    onClose()
  }

  // Keyboard: ↑/↓ move one flat selection across all groups (wrapping),
  // Enter opens the selected item, Escape closes.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSel((s) => (flat.length === 0 ? 0 : (Math.min(s, flat.length - 1) + 1) % flat.length))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSel((s) => (flat.length === 0 ? 0 : (Math.min(s, flat.length - 1) - 1 + flat.length) % flat.length))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (selected >= 0) go(flat[selected])
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, flat, selected, onClose])

  // Keep the keyboard-selected row in view as it moves.
  useEffect(() => {
    listRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Site search">
      {/* backdrop — click to close */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* panel */}
      <div className="cl-card relative mx-auto mt-[10vh] w-[min(640px,calc(100vw-2rem))] overflow-hidden rounded-xl shadow-2xl">
        {/* search input */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, notes, formulas, pages…"
            aria-label="Search the site"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        {/* results */}
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto pb-2">
          {flat.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No results for “{query.trim()}” — try another term.
            </p>
          ) : (
            groups.map((g, gi) => {
              const offset = groups.slice(0, gi).reduce((n, x) => n + x.items.length, 0)
              return (
                <div key={g.label}>
                  <p className="px-4 pt-3 pb-1 font-sans text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {g.label}
                  </p>
                  {g.items.map((item, i) => {
                    const idx = offset + i
                    const isSel = idx === selected
                    const Icon = item.icon
                    return (
                      <button
                        key={item.key}
                        type="button"
                        data-selected={isSel || undefined}
                        onMouseEnter={() => setSel(idx)}
                        onClick={() => go(item)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isSel ? 'bg-brand-50 text-brand-700' : 'text-slate-700'
                        }`}
                      >
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-[8px] border bg-white ${
                            isSel ? 'border-brand-200 text-brand-600' : 'border-slate-200 text-slate-500'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{item.title}</span>
                          {item.sub && (
                            <span className="block truncate text-[12px] leading-snug text-slate-500">
                              {item.sub}
                            </span>
                          )}
                        </span>
                        <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                          {item.meta}
                          {isSel && <CornerDownLeft className="h-3.5 w-3.5 text-brand-600" />}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        {/* footer hint */}
        <p className="border-t border-slate-200 px-4 py-2 text-[11px] text-slate-400">
          ↑↓ navigate · ↵ open · esc close
        </p>
      </div>
    </div>
  )
}
