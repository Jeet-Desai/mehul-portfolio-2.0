/* ----------------------------------------------------------------------------
   Safety net for the AI tutor: turn LaTeX the model slips into a reply into
   plain, readable text.

   The tutor's Markdown renderer has no maths engine, so a reply containing
   `\[ \text{Cost} = \frac{A}{B} \]` would show raw backslash code. The system
   prompt asks the model not to emit LaTeX, but models do it anyway, so we convert:

     • display maths  \[ … \]  /  $$ … $$   → a ```formula block (own line)
     • inline maths   \( … \)  /  $…\…$    → `inline code`
     • inside either: \text{} \frac{}{} \times \boxed{} ^2 … → plain symbols

   Fenced code the model wrote on purpose is left untouched. Pure and React-free.
---------------------------------------------------------------------------- */

const BS = '\\'

const SYMBOLS: [string, string][] = [
  ['times', '×'], ['div', '÷'], ['cdot', '·'], ['pm', '±'], ['approx', '≈'],
  ['leq', '≤'], ['le', '≤'], ['geq', '≥'], ['ge', '≥'], ['neq', '≠'], ['ne', '≠'],
  ['rightarrow', '→'], ['to', '→'], ['Rightarrow', '⇒'], ['implies', '⇒'],
  ['Delta', 'Δ'], ['sum', 'Σ'], ['infty', '∞'], ['ldots', '…'], ['dots', '…'],
  ['alpha', 'α'], ['beta', 'β'], ['sigma', 'σ'], ['mu', 'μ'], ['pi', 'π'],
]

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', n: 'ⁿ' }

/** Replace one innermost `\cmd{…}` at a time until none remain (handles nesting). */
function unwrap(s: string, cmds: string[], wrap: (inner: string) => string): string {
  const rx = new RegExp(`\\\\(?:${cmds.join('|')})\\s*\\{([^{}]*)\\}`, 'g')
  let prev = ''
  while (prev !== s) {
    prev = s
    s = s.replace(rx, (_m, inner: string) => wrap(inner))
  }
  return s
}

function simple(x: string): boolean {
  return /^[\w.,₹%]+$/.test(x.trim())
}

/** LaTeX maths body → plain text. `multiline` keeps `\\` line breaks (display maths). */
export function cleanMath(src: string, multiline: boolean): string {
  // LaTeX writes thousands separators as 60{,}000 — flatten before any brace matching
  let s = src.replace(/\{,\}/g, ',')

  // alignment environments
  s = s.replace(/\\(?:begin|end)\s*\{[^}]*\}/g, '')
  s = s.replace(/\\\\/g, multiline ? '\n' : ' ')
  s = s.replace(/&/g, ' ')

  // wrappers that just hold text
  s = unwrap(s, ['text', 'textbf', 'textit', 'mathrm', 'mathbf', 'mathit', 'operatorname', 'boxed', 'underline', 'overline', 'mbox'], (i) => i)

  // fractions and roots — alternate until stable so they can nest in either order
  let prev = ''
  while (prev !== s) {
    prev = s
    s = unwrap(s, ['sqrt'], (i) => `√(${i})`)
    s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (_m, a: string, b: string) =>
      `${simple(a) ? a.trim() : `(${a.trim()})`} ÷ ${simple(b) ? b.trim() : `(${b.trim()})`}`,
    )
  }

  // simple sub/superscripts
  s = s.replace(/\^\{([^{}]*)\}/g, (_m, i: string) => (i.length === 1 && SUP[i] ? SUP[i] : `^(${i})`))
  s = s.replace(/\^([0-9n])/g, (_m, i: string) => SUP[i])
  s = s.replace(/_\{([^{}]*)\}/g, (_m, i: string) => `_${i}`)

  // spacing, sizing and escaped characters
  s = s.replace(/\\(?:left|right|big|Big|bigg|Bigg)\b\s*/g, '')
  s = s.replace(/\\[,;:! ]|\\q?quad\b/g, ' ')
  s = s.replace(/\\([%$_&#{}])/g, '$1')

  // named symbols
  for (const [name, sym] of SYMBOLS) s = s.replace(new RegExp(`\\\\${name}(?![A-Za-z])`, 'g'), sym)

  // anything left: drop the backslash (e.g. \alpha unknown → alpha) and stray grouping braces
  s = s.replace(/\\([A-Za-z]+)/g, '$1')
  s = s.replace(/[{}]/g, '')
  s = s.split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim()).filter((l, idx, a) => l || (idx > 0 && idx < a.length - 1)).join('\n')
  return multiline ? s.trim() : s.replace(/\s+/g, ' ').trim()
}

function fenceFormula(body: string): string {
  return `\n\n${'`'.repeat(3)}formula\n${cleanMath(body, true)}\n${'`'.repeat(3)}\n\n`
}

function inlineCode(body: string): string {
  return '`' + cleanMath(body, false).replace(/`/g, "'") + '`'
}

/** Convert LaTeX in `text` (outside fenced code) to plain text / ```formula blocks. */
export function delatex(text: string): string {
  if (!text.includes(BS) && !text.includes('$$') && !text.includes('$')) return text

  return text
    .split(/(```[\s\S]*?```)/g)
    .map((seg) => {
      if (seg.startsWith('```')) return seg
      return (
        seg
          // display maths that starts its own line → standalone formula block
          .replace(/^[ \t]*\\\[([\s\S]*?)\\\][ \t]*$/gm, (_m, b: string) => fenceFormula(b))
          .replace(/^[ \t]*\$\$([\s\S]*?)\$\$[ \t]*$/gm, (_m, b: string) => fenceFormula(b))
          // display maths mid-sentence / inside a table cell → inline
          .replace(/\\\[([\s\S]*?)\\\]/g, (_m, b: string) => inlineCode(b))
          .replace(/\$\$([\s\S]*?)\$\$/g, (_m, b: string) => inlineCode(b))
          // inline maths
          .replace(/\\\(([\s\S]*?)\\\)/g, (_m, b: string) => inlineCode(b))
          .replace(/\$([^$\n]*\\[^$\n]*)\$/g, (_m, b: string) => inlineCode(b))
          // environment markers left outside any delimiter
          .replace(/^[ \t]*\\(?:begin|end)\s*\{[^}]*\}[ \t]*\n?/gm, '')
          // bare commands outside any delimiter (e.g. a stray \times or \text{…})
          .replace(/\\(?:text|textbf|mathrm|mathbf|boxed|frac|dfrac|times|div|cdot|rightarrow|Rightarrow|sqrt)\b[^\n`|]*/g, (m) => cleanMath(m, false))
      )
    })
    .join('')
}
