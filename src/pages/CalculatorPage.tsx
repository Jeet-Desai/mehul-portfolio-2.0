import { lazy, Suspense, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { getCalculator } from '../calculators/registry'
import NotFound from './NotFound'

export default function CalculatorPage() {
  const { slug = '' } = useParams()
  const calc = getCalculator(slug)
  const Calc = useMemo(() => (calc ? lazy(calc.load) : null), [slug])
  if (!calc || !Calc) return <NotFound />

  return (
    <>
      <section className="border-b border-slate-100 bg-gradient-to-b from-brand-50/60 to-transparent dark:from-brand-500/10">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <Link
            to="/learn"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" /> All calculators
          </Link>
          <div className="mt-4 flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">
              <calc.icon className="h-7 w-7" />
            </span>
            <div>
              <span className="cl-pill bg-brand-100 text-brand-700">{calc.category}</span>
              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{calc.title}</h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-slate-600">{calc.blurb}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center gap-2 py-20 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading calculator…
            </div>
          }
        >
          <Calc />
        </Suspense>
      </div>
    </>
  )
}
