import { useEffect, useState, type ReactNode } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Calculator,
  ArrowUpRight,
  Landmark,
  BookMarked,
  Newspaper,
  PlayCircle,
  Eye,
  Download,
} from 'lucide-react'
import { getResourceTopic, type RefKind, type PracticeQuestion } from '../data/resources'
import { getCalculator } from '../calculators/registry'
import { useLang, useUI, subjectLabel, type Lang } from '../lib/lang'
import { recordTopicRead } from '../lib/progress'
import { usePageTitle } from '../lib/usePageTitle'
import NotFound from './NotFound'

/** Print the current topic as a clean PDF (browser "Save as PDF").
    Force light mode for the printout so the PDF is readable on paper. */
function downloadAsPdf() {
  const el = document.documentElement
  const wasDark = el.classList.contains('dark')
  if (wasDark) {
    el.classList.remove('dark')
    const restore = () => {
      el.classList.add('dark')
      window.removeEventListener('afterprint', restore)
    }
    window.addEventListener('afterprint', restore)
  }
  window.print()
}

/** EN / ગુ language toggle (persists via useLang). */
function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="inline-flex rounded-full border border-slate-200 bg-white p-0.5 text-xs font-bold print:hidden">
      {(['en', 'gu'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`rounded-full px-3 py-1.5 transition ${
            lang === l ? 'bg-brand-600 text-white' : 'text-slate-600 hover:text-brand-600'
          }`}
        >
          {l === 'en' ? 'EN' : 'ગુ'}
        </button>
      ))}
    </div>
  )
}

/** A single self-test question with a reveal-on-click answer (always shown in print). */
function PracticeItem({ item, index, ui }: { item: PracticeQuestion; index: number; ui: Record<string, string> }) {
  const [show, setShow] = useState(false)
  return (
    <div className="cl-card p-5">
      <p className="text-sm font-semibold leading-relaxed text-slate-900">
        <span className="font-display text-[15px] text-brand-600">Q{index + 1}.</span> {item.q}
      </p>
      {item.options && (
        <ul className="mt-2.5 space-y-1">
          {item.options.map((o, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-400">{String.fromCharCode(97 + i)})</span> {o}
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => setShow((s) => !s)}
        className="btn-outline mt-4 px-3.5 py-1.5 text-[13px] print:hidden"
      >
        <Eye className="h-3.5 w-3.5" /> {show ? ui.hideAnswer : ui.viewAnswer}
      </button>
      {!show && <p className="mt-2 text-xs text-slate-400 print:hidden">{ui.tryFirst}</p>}
      <div className={show ? 'mt-3 block' : 'mt-3 hidden print:block'}>
        <div className="rounded-[10px] bg-slate-100 p-3.5 text-sm leading-relaxed text-slate-600">
          <span className="font-bold text-slate-900">{ui.answerLabel} </span>
          {item.answer}
        </div>
      </div>
    </div>
  )
}

const refMeta: Record<RefKind, { icon: typeof Landmark; label: string }> = {
  official: { icon: Landmark, label: 'Official' },
  textbook: { icon: BookMarked, label: 'Textbook' },
  article: { icon: Newspaper, label: 'Article' },
  video: { icon: PlayCircle, label: 'Video' },
}

/** Article H2 — Newsreader serif with the house ▸ marker. */
function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="h2-marker text-[26px] font-semibold leading-snug">{children}</h2>
}

/** Bulleted list with the house ▸ marker (accent or dim). */
function MarkerList({ items, dim = false }: { items: string[]; dim?: boolean }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-slate-600">
          <span aria-hidden className={`shrink-0 ${dim ? 'text-slate-400' : 'text-brand-600'}`}>
            ▸
          </span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

export default function ResourceTopic() {
  const { id } = useParams<{ id: string }>()
  const [lang, setLang] = useLang()
  const ui = useUI(lang)
  const topic = id ? getResourceTopic(id) : undefined

  // progress: remember the topic was read + keep the study streak alive
  useEffect(() => {
    if (topic) recordTopicRead(topic.id)
  }, [topic?.id])

  // hooks must run unconditionally — resolve the (possibly Gujarati) title
  // before the not-found guard below.
  usePageTitle(
    topic ? ((lang === 'gu' ? topic.gu?.title : undefined) ?? topic.title) : 'Page not found',
    topic ? ((lang === 'gu' ? topic.gu?.overview?.[0] : undefined) ?? topic.overview[0]) : undefined,
  )

  if (!topic) return <NotFound />

  // Resolve every field through the Gujarati translation, falling back to English.
  const tr = lang === 'gu' ? topic.gu : undefined
  const title = tr?.title ?? topic.title
  const level = tr?.level ?? topic.level
  const overview = tr?.overview ?? topic.overview
  const keyTerms = tr?.keyTerms ?? topic.keyTerms
  const formulas = tr?.formulas ?? topic.formulas
  const procedure = tr?.procedure ?? topic.procedure
  const examTips = tr?.examTips ?? topic.examTips
  const pitfalls = tr?.pitfalls ?? topic.pitfalls
  const applications = tr?.applications ?? topic.applications
  const advantages = tr?.advantages ?? topic.advantages
  const limitations = tr?.limitations ?? topic.limitations
  const workedExample = tr?.workedExample ?? topic.workedExample
  const practice = tr?.practice ?? topic.practice

  // Only link to the calculator if it actually exists in the registry yet.
  const calc = topic.calc ? getCalculator(topic.calc) : undefined
  const hasGu = !!topic.gu

  return (
    <div className="relative mx-auto max-w-[800px] px-4 py-10 sm:px-6">
      {/* the red ledger margin rule — sits in the page gutter, left OF the text
          column (like a notebook margin), so it never crosses the content at
          any width; hidden below lg where there is no spare gutter. */}
      <div
        aria-hidden
        className="margin-rule absolute bottom-0 -left-7 top-0 hidden w-px lg:block print:hidden"
      />

      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link
          to="/resources"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 transition hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" /> {ui.library}
        </Link>
        <div className="flex items-center gap-2.5">
          {hasGu && <LangToggle lang={lang} onChange={setLang} />}
          <button
            onClick={downloadAsPdf}
            className="inline-flex items-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-900 transition hover:border-brand-600"
          >
            <Download className="h-4 w-4" /> {ui.downloadPdf}
          </button>
        </div>
      </div>

      {/* header */}
      <div className="mt-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
            {subjectLabel(lang, topic.subject)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-400">
            <Clock className="h-3.5 w-3.5" /> {topic.readingMinutes} {ui.minRead}
          </span>
        </div>
        <h1 className="mt-4 text-5xl leading-[1.02] sm:text-[56px]">{title}</h1>
        <p className="mt-3 text-[15px] font-semibold text-slate-600">{level}</p>
      </div>

      {/* overview */}
      <section className="mt-9">
        <SectionHeading>{ui.overview}</SectionHeading>
        <div className="mt-3.5 space-y-4">
          {overview.map((p, i) => (
            <p key={i} className="text-[16px] leading-[1.75] text-slate-600">
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* key terms */}
      <section className="mt-10">
        <SectionHeading>{ui.keyTerms}</SectionHeading>
        <dl className="mt-2 divide-y divide-slate-200">
          {keyTerms.map((k) => (
            <div key={k.term} className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-5">
              <dt className="shrink-0 font-display text-[17px] font-semibold text-slate-900 sm:w-[200px]">
                {k.term}
              </dt>
              <dd className="min-w-0 flex-1 text-[14.5px] leading-relaxed text-slate-600">{k.def}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* formulas — accent-soft callouts with a teal margin bar */}
      {formulas && formulas.length > 0 && (
        <section className="mt-10">
          <SectionHeading>{ui.keyFormulas}</SectionHeading>
          <div className="mt-4 space-y-4">
            {formulas.map((f) => (
              <div
                key={f.name}
                className="rounded-lg border border-l-[3px] border-slate-200 border-l-brand-600 bg-brand-50 px-5 py-4 sm:px-6 sm:py-5"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-600">
                  {f.name}
                </p>
                <p className="mt-2 break-words font-display text-[20px] italic leading-snug text-slate-900 sm:text-[21px]">
                  {f.expr}
                </p>
                {f.note && <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{f.note}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* procedure — CalcSteps-style hairline rows */}
      {procedure && (
        <section className="mt-10">
          <SectionHeading>{procedure.heading ?? ui.theMethod}</SectionHeading>
          <ol className="cl-card mt-4 px-5 py-2 sm:px-6">
            {procedure.steps.map((s, i) => (
              <li key={i} className="flex gap-4 border-b border-slate-100 py-3.5 last:border-0">
                <span className="w-6 shrink-0 pt-0.5 font-display text-base text-slate-400">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{s.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* worked example */}
      {workedExample && (
        <section className="mt-10">
          <SectionHeading>{ui.workedExample}</SectionHeading>
          {workedExample.title && (
            <p className="mt-2 text-sm font-semibold text-slate-600">{workedExample.title}</p>
          )}
          <div className="mt-3.5 rounded-[10px] bg-slate-100 p-4 text-[15px] leading-relaxed text-slate-600 sm:p-5">
            <span className="font-bold text-slate-900">{ui.problem} </span>
            {workedExample.problem}
            {workedExample.source && (
              <span className="mt-2 block text-xs text-slate-400">{workedExample.source}</span>
            )}
          </div>
          <ol className="cl-card mt-4 px-5 py-2 sm:px-6">
            {workedExample.steps.map((s, i) => (
              <li key={i} className="flex gap-4 border-b border-slate-100 py-3.5 last:border-0">
                <span className="w-6 shrink-0 pt-0.5 font-display text-base text-slate-400">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{s.label}</p>
                  {s.formula && (
                    <p className="mt-0.5 break-words text-[13px] text-slate-600">{s.formula}</p>
                  )}
                  {s.result && (
                    <p className="mt-1 font-display text-[15px] font-semibold text-brand-600">
                      {s.result}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-lg border border-l-[3px] border-slate-200 border-l-brand-600 bg-brand-50 px-5 py-4 text-[15px] leading-relaxed text-slate-600">
            <span className="font-bold text-brand-600">{ui.answer} </span>
            {workedExample.answer}
          </div>
        </section>
      )}

      {/* industrial applications */}
      {applications && applications.length > 0 && (
        <section className="mt-10">
          <SectionHeading>{ui.applications}</SectionHeading>
          <p className="mt-2 text-sm text-slate-500">{ui.applicationsSub}</p>
          <ul className="mt-4 space-y-2.5">
            {applications.map((a, i) => (
              <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed text-slate-600">
                <span aria-hidden className="shrink-0 text-brand-600">
                  ▸
                </span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* advantages + limitations */}
      {(advantages || limitations) && (
        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          {advantages && (
            <div className="cl-card p-5 sm:p-6">
              <h3 className="text-[19px] font-semibold leading-snug">{ui.advantages}</h3>
              <MarkerList items={advantages} />
            </div>
          )}
          {limitations && (
            <div className="cl-card p-5 sm:p-6">
              <h3 className="text-[19px] font-semibold leading-snug">{ui.limitations}</h3>
              <MarkerList items={limitations} dim />
            </div>
          )}
        </section>
      )}

      {/* exam tips + pitfalls */}
      {(examTips || pitfalls) && (
        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          {examTips && (
            <div className="cl-card p-5 sm:p-6">
              <h3 className="text-[19px] font-semibold leading-snug">{ui.examTips}</h3>
              <MarkerList items={examTips} />
            </div>
          )}
          {pitfalls && (
            <div className="cl-card p-5 sm:p-6">
              <h3 className="text-[19px] font-semibold leading-snug">{ui.commonMistakes}</h3>
              <MarkerList items={pitfalls} dim />
            </div>
          )}
        </section>
      )}

      {/* practice */}
      {practice && practice.length > 0 && (
        <section className="mt-10">
          <SectionHeading>{ui.testYourself}</SectionHeading>
          <p className="mt-2 text-sm text-slate-500">{ui.testYourselfSub}</p>
          <div className="mt-4 space-y-3">
            {practice.map((p, i) => (
              <PracticeItem key={i} item={p} index={i} ui={ui} />
            ))}
          </div>
        </section>
      )}

      {/* practise CTAs */}
      <section className="mt-12 grid gap-4 sm:grid-cols-2 print:hidden">
        {calc && (
          <div className="flex flex-col rounded-xl border border-slate-200 bg-brand-50 p-6">
            <p className="font-display text-[19px] font-semibold text-slate-900">
              {ui.tryCalculator}
            </p>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600">
              {ui.tryCalculatorSub}
            </p>
            <Link
              to={`/learn/c/${calc.slug}`}
              className="btn-accent mt-4 self-start px-5 py-2.5 text-[13px]"
            >
              <Calculator className="h-4 w-4" /> {calc.title}
            </Link>
          </div>
        )}
        <Link to="/formulas" className="cl-card cl-card-lift group flex items-center gap-4 p-6">
          <div className="min-w-0 flex-1">
            <p className="font-display text-[19px] font-semibold text-slate-900">
              {ui.formulaSheet}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{ui.formulaSheetSub}</p>
          </div>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-brand-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </section>

      {/* references */}
      <section className="mt-12 border-t border-slate-200 pt-8">
        <SectionHeading>{ui.references}</SectionHeading>
        <ul className="mt-4 space-y-2.5">
          {topic.references.map((r) => {
            const meta = refMeta[r.kind]
            return (
              <li key={r.url}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 text-[13px]"
                >
                  <span className="inline-flex w-[88px] shrink-0 items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    <meta.icon className="h-3.5 w-3.5" /> {meta.label}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-slate-600 transition group-hover:text-brand-600">
                    {r.label}
                  </span>
                  {r.source && <span className="shrink-0 text-slate-400">{r.source}</span>}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </a>
              </li>
            )
          })}
        </ul>
        <p className="mt-5 text-xs leading-relaxed text-slate-400">{ui.topicDisclaimer}</p>
      </section>
    </div>
  )
}
