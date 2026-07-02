import type { Step } from '../../calculators/types'

/** Ledger step-by-step working — serif ∑ header, hairline-separated rows:
    serif index · label + formula · result right-aligned in accent serif. */
export default function CalcSteps({ steps }: { steps: Step[] }) {
  if (!steps.length) return null
  return (
    <div className="cl-card p-5 sm:p-6">
      <h3 className="flex items-center gap-2.5 font-display text-[22px] font-semibold">
        <span aria-hidden className="font-display text-[22px] leading-none text-brand-600">∑</span>
        Step-by-step working
      </h3>
      <ol className="mt-2">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4 border-b border-slate-100 py-3.5 last:border-0 last:pb-0">
            <span className="w-6 shrink-0 pt-0.5 font-display text-base text-slate-400">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{s.label}</p>
              {s.formula && (
                <p className="mt-0.5 break-words text-[13px] text-slate-600">{s.formula}</p>
              )}
              {s.note && <p className="mt-0.5 text-xs text-slate-400">{s.note}</p>}
            </div>
            {s.result && (
              <span className="shrink-0 pt-0.5 text-right font-display text-base font-semibold text-brand-600">
                {s.result}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
