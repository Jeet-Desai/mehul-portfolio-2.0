import type { ReactNode } from 'react'

/**
 * Ledger page header — eyebrow (accent bar + uppercase label), a Newsreader
 * headline with an optional italic teal accent phrase, and muted subcopy.
 * Pass `title="Tools that teach," titleAccent="not just compute."` for the
 * house headline pattern.
 */
export default function PageHeader({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  children,
}: {
  eyebrow?: string
  title: string
  titleAccent?: string
  subtitle?: string
  children?: ReactNode
}) {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-4 sm:px-6 sm:pt-14">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="mt-4 text-4xl leading-[1.05] sm:text-5xl">
          {title}
          {titleAccent && <span className="italic text-brand-600"> {titleAccent}</span>}
        </h1>
        {subtitle && <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-slate-600">{subtitle}</p>}
        {children}
      </div>
    </section>
  )
}
