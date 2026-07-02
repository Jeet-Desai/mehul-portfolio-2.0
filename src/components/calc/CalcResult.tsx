import type { ReactNode } from 'react'

/* Ledger hero results — the primary result is an INK card (near-black in light,
   inverts to a light card in dark: intended), the secondary is a solid accent
   card. `sun` keeps a warm solid for warning-ish heroes. */
const tones = {
  brand: 'ink-card ink-lines',
  mint: 'rounded-xl bg-brand-600 text-white',
  sun: 'rounded-xl bg-sun-500 text-white',
} as const

/** A highlighted "hero" result. */
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
    <div className={`${tones[tone]} p-5 sm:p-6`}>
      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.1em] opacity-60">{label}</p>
      <p className="mt-2 font-display text-4xl font-semibold leading-none">{value}</p>
      {sub && <p className="mt-2 text-[13px] opacity-70">{sub}</p>}
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
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm ${strong ? 'font-display text-[15px] font-semibold text-brand-600' : 'font-semibold text-slate-800'}`}>
        {value}
      </span>
    </div>
  )
}

export function ResultPanel({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="cl-card p-5 sm:p-6">
      {title && (
        <h3 className="mb-3 font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}
