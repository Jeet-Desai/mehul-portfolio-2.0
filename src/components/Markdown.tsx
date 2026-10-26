/* ----------------------------------------------------------------------------
   Tiny, dependency-free Markdown renderer for the AI tutor's replies.

   LLM output is a predictable subset of Markdown, so this covers exactly that —
   headings, bold/italic, inline code, fenced code, ordered/unordered lists,
   GFM pipe tables (for ledgers / cost sheets / working), blockquotes, rules and
   links — and renders it to REACT NODES (never raw HTML), so it's XSS-safe by
   construction. Links are restricted to http(s)/mailto and open in a new tab.

   It is intentionally small, not a spec-complete parser. If we ever need full
   CommonMark, swap this for react-markdown + remark-gfm.
---------------------------------------------------------------------------- */

import { type ReactNode } from 'react'
import { delatex } from '../lib/delatex'

/* ---------- inline: bold / italic / code / links ------------------------- */

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*|__[^_]+__)|(\*[^*\n]+\*|_[^_\n]+_)|(\[[^\]]+\]\([^)\s]+\))/

function safeHref(url: string): string | null {
  const u = url.trim()
  if (/^(https?:\/\/|mailto:)/i.test(u)) return u
  return null
}

function renderInline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = []
  let rest = text
  let k = 0
  while (rest) {
    const m = INLINE.exec(rest)
    if (!m) {
      out.push(rest)
      break
    }
    if (m.index > 0) out.push(rest.slice(0, m.index))
    const token = m[0]
    const key = `${keyBase}-${k++}`

    if (m[1]) {
      out.push(
        <code key={key} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800">
          {token.slice(1, -1)}
        </code>,
      )
    } else if (m[2]) {
      out.push(<strong key={key} className="font-semibold text-slate-900">{renderInline(token.slice(2, -2), key)}</strong>)
    } else if (m[3]) {
      out.push(<em key={key}>{renderInline(token.slice(1, -1), key)}</em>)
    } else if (m[4]) {
      const split = token.indexOf('](')
      const label = token.slice(1, split)
      const href = safeHref(token.slice(split + 2, -1))
      out.push(
        href ? (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700">
            {label}
          </a>
        ) : (
          <span key={key}>{label}</span>
        ),
      )
    }
    rest = rest.slice(m.index + token.length)
  }
  return out
}

/* ---------- block-level parsing ------------------------------------------ */

const HR = /^\s*([-*_])(\s*\1){2,}\s*$/
const HEADING = /^(#{1,6})\s+(.*)$/
const ULI = /^\s*[-*+]\s+(.*)$/
const OLI = /^\s*(\d+)[.)]\s+(.*)$/
const TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())
}

export default function Markdown({ text }: { text: string }) {
  // The model sometimes emits LaTeX maths despite the prompt; convert it to plain text first.
  const lines = delatex(text).replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // blank line → block separator
    if (!line.trim()) {
      i++
      continue
    }

    // fenced code block
    const fence = line.trim().match(/^```(.*)$/)
    if (fence) {
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        body.push(lines[i])
        i++
      }
      i++ // skip closing fence
      blocks.push(
        <pre
          key={key++}
          className={
            fence[1].trim() === 'formula'
              ? 'overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[13.5px] leading-relaxed text-slate-800'
              : 'overflow-x-auto rounded-lg bg-slate-900 px-3.5 py-3 text-[13px] leading-relaxed text-slate-100'
          }
        >
          <code className="font-mono">{body.join('\n')}</code>
        </pre>,
      )
      continue
    }

    // GFM pipe table: a header row followed by a separator row
    if (line.includes('|') && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1])) {
      const header = splitRow(line)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(splitRow(lines[i]))
        i++
      }
      blocks.push(
        <div key={key++} className="overflow-x-auto">
          <table className="my-1 w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {header.map((h, c) => (
                  <th key={c} className="border border-slate-200 bg-slate-50 px-3 py-1.5 text-left font-semibold text-slate-900">
                    {renderInline(h, `th-${key}-${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {header.map((_, c) => (
                    <td key={c} className="border border-slate-200 px-3 py-1.5 align-top text-slate-700">
                      {renderInline(r[c] ?? '', `td-${key}-${ri}-${c}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    // horizontal rule
    if (HR.test(line)) {
      blocks.push(<hr key={key++} className="my-3 border-slate-200" />)
      i++
      continue
    }

    // heading
    const h = line.match(HEADING)
    if (h) {
      const level = h[1].length
      const cls =
        level <= 2
          ? 'mt-2 mb-1 text-[15px] font-bold text-slate-900'
          : 'mt-2 mb-1 text-[14px] font-semibold text-slate-900'
      blocks.push(
        <p key={key++} className={cls}>
          {renderInline(h[2], `h-${key}`)}
        </p>,
      )
      i++
      continue
    }

    // blockquote
    if (/^\s*>\s?/.test(line)) {
      const body: string[] = []
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        body.push(lines[i].replace(/^\s*>\s?/, ''))
        i++
      }
      blocks.push(
        <blockquote key={key++} className="border-l-2 border-brand-600 pl-3 text-slate-600 italic">
          {renderInline(body.join(' '), `bq-${key}`)}
        </blockquote>,
      )
      continue
    }

    // ordered list
    if (OLI.test(line)) {
      const items: ReactNode[] = []
      while (i < lines.length && OLI.test(lines[i])) {
        const mm = lines[i].match(OLI)!
        items.push(
          <li key={items.length} className="pl-1">
            {renderInline(mm[2], `oli-${key}-${items.length}`)}
          </li>,
        )
        i++
      }
      blocks.push(
        <ol key={key++} className="ml-5 list-decimal space-y-1 marker:text-slate-400">
          {items}
        </ol>,
      )
      continue
    }

    // unordered list
    if (ULI.test(line)) {
      const items: ReactNode[] = []
      while (i < lines.length && ULI.test(lines[i])) {
        const mm = lines[i].match(ULI)!
        items.push(
          <li key={items.length} className="pl-1">
            {renderInline(mm[1], `uli-${key}-${items.length}`)}
          </li>,
        )
        i++
      }
      blocks.push(
        <ul key={key++} className="ml-5 list-disc space-y-1 marker:text-slate-400">
          {items}
        </ul>,
      )
      continue
    }

    // paragraph: gather consecutive plain lines
    const para: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !HEADING.test(lines[i]) &&
      !HR.test(lines[i]) &&
      !ULI.test(lines[i]) &&
      !OLI.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !lines[i].trim().startsWith('```')
    ) {
      para.push(lines[i])
      i++
    }
    blocks.push(
      <p key={key++} className="leading-relaxed">
        {renderInline(para.join(' '), `p-${key}`)}
      </p>,
    )
  }

  return <div className="space-y-2.5">{blocks}</div>
}
