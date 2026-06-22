import type { ReactNode } from 'react'

const tones = {
  brand: 'from-brand-500 to-brand-700',
  mint: 'from-mint-500 to-mint-600',
  sun: 'from-sun-500 to-sun-600',
} as const

/** A highlighted "hero" result (gradient). */
export function HeroResult({
  label,
  value,
  sub,
  tone = 'brand',
}: {
  label: string
  value: string
  sub?: string
  tone?: keyof typeof tones
}) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${tones[tone]} p-5 text-white shadow-md`}>
      <p className="text-sm font-medium text-white/80">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>
      {sub && <p className="mt-1 text-sm text-white/80">{sub}</p>}
    </div>
  )
}

/** A plain result row inside a results card. */
export function ResultRow({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm ${strong ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
        {value}
      </span>
    </div>
  )
}

export function ResultPanel({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="cl-card p-6 hover:translate-y-0">
      {title && <h3 className="mb-3 text-base font-bold">{title}</h3>}
      {children}
    </div>
  )
}
