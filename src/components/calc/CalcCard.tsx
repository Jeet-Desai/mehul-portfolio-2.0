import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Calculator } from '../../calculators/types'

/** Ledger calculator card — uppercase category, serif title, muted blurb, → cue. */
export default function CalcCard({ calc }: { calc: Calculator }) {
  return (
    <Link to={`/learn/c/${calc.slug}`} className="cl-card cl-card-lift group flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-brand-600">
          {calc.category}
        </span>
        <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-brand-600" />
      </div>
      <h3 className="mt-3 font-display text-xl font-semibold leading-snug">{calc.title}</h3>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-600">{calc.blurb}</p>
    </Link>
  )
}
