import { Link } from 'react-router-dom'
import { Hammer, ArrowLeft } from 'lucide-react'

export default function ComingSoon({ phase, points }: { phase: string; points: string[] }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="cl-card p-8 sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600">
          <Hammer className="h-3.5 w-3.5" />
          {phase}
        </span>
        <h2 className="mt-5 text-2xl">This section is on the way</h2>
        <p className="mt-2 text-slate-600">Here's what's planned for it:</p>
        <ul className="mt-5 space-y-3">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-slate-700">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
              {p}
            </li>
          ))}
        </ul>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
      </div>
    </div>
  )
}
