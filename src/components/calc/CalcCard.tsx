import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Calculator } from '../../calculators/types'

export default function CalcCard({ calc }: { calc: Calculator }) {
  return (
    <Link to={`/learn/c/${calc.slug}`} className="cl-card flex h-full flex-col p-6">
      <div className="flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
          <calc.icon className="h-6 w-6" />
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
          {calc.category}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold">{calc.title}</h3>
      <p className="mt-1.5 flex-1 text-sm text-slate-600">{calc.blurb}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
        Open calculator <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  )
}
