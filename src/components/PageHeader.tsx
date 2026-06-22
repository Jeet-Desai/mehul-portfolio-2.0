import type { ReactNode } from 'react'

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  children?: ReactNode
}) {
  return (
    <section className="border-b border-slate-100 bg-gradient-to-b from-brand-50/60 to-transparent">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        {eyebrow && (
          <span className="cl-pill bg-brand-100 text-brand-700">{eyebrow}</span>
        )}
        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-lg text-slate-600">{subtitle}</p>}
        {children}
      </div>
    </section>
  )
}
