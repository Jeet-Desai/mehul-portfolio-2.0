import { ListChecks } from 'lucide-react'
import type { Step } from '../../calculators/types'

export default function CalcSteps({ steps }: { steps: Step[] }) {
  if (!steps.length) return null
  return (
    <div className="cl-card p-6 hover:translate-y-0">
      <h3 className="flex items-center gap-2 text-base font-bold">
        <ListChecks className="h-5 w-5 text-brand-600" />
        Step-by-step working
      </h3>
      <ol className="mt-4 space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">{s.label}</p>
              {s.formula && (
                <p className="mt-0.5 break-words font-mono text-sm text-slate-600">{s.formula}</p>
              )}
              {s.result && (
                <p className="mt-0.5 text-sm font-semibold text-brand-700">{s.result}</p>
              )}
              {s.note && <p className="mt-0.5 text-xs text-slate-400">{s.note}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
