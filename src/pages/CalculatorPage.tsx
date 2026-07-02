import { lazy, Suspense, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Reveal from '../components/Reveal'
import ShareButton from '../components/ShareButton'
import { getCalculator } from '../calculators/registry'
import { recordCalcUse } from '../lib/progress'
import { usePageTitle } from '../lib/usePageTitle'
import NotFound from './NotFound'

export default function CalculatorPage() {
  const { slug = '' } = useParams()
  const calc = getCalculator(slug)
  const Calc = useMemo(() => (calc ? lazy(calc.load) : null), [slug])

  usePageTitle(calc?.title, calc?.blurb)

  // progress: count the visit + keep the study streak alive
  useEffect(() => {
    if (calc) recordCalcUse(calc.slug)
  }, [calc?.slug])

  if (!calc || !Calc) return <NotFound />

  return (
    <>
      <section>
        <div className="mx-auto max-w-6xl px-4 pt-9 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 text-[13px] text-slate-600">
                <Link
                  to="/learn"
                  className="inline-flex items-center gap-1 font-semibold text-brand-600 transition hover:text-brand-700"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Learn Hub
                </Link>
                <span className="text-slate-400">/</span>
                <span>{calc.category}</span>
              </div>
              <ShareButton title={calc.title} />
            </div>
            <h1 className="mt-3.5 text-4xl leading-[1.05] sm:text-[44px]">{calc.title}</h1>
            <p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-slate-600">{calc.blurb}</p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:pb-11">
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
