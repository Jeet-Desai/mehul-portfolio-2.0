import { useState, type ReactNode } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Sigma,
  ListChecks,
  Lightbulb,
  AlertTriangle,
  ExternalLink,
  Calculator,
  FileText,
  ArrowUpRight,
  Landmark,
  BookMarked,
  Newspaper,
  PlayCircle,
  FlaskConical,
  GraduationCap,
  Eye,
  Download,
  Trophy,
  Factory,
  ThumbsUp,
  MinusCircle,
} from 'lucide-react'
import { getResourceTopic, type RefKind, type PracticeQuestion } from '../data/resources'
import { getCalculator } from '../calculators/registry'
import { useLang, useUI, type Lang } from '../lib/lang'
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
            lang === l ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-brand-600'
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
    <div className="cl-card p-4 hover:translate-y-0">
      <p className="text-sm font-semibold text-slate-800">
        <span className="text-brand-600">Q{index + 1}.</span> {item.q}
      </p>
      {item.options && (
        <ul className="mt-2 space-y-1">
          {item.options.map((o, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-400">{String.fromCharCode(97 + i)})</span> {o}
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => setShow((s) => !s)}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700 print:hidden"
      >
        <Eye className="h-4 w-4" /> {show ? ui.hideAnswer : ui.viewAnswer}
      </button>
      {!show && <p className="mt-2 text-xs text-slate-400 print:hidden">{ui.tryFirst}</p>}
      <div className={show ? 'mt-3 block' : 'mt-3 hidden print:block'}>
        <div className="rounded-xl bg-mint-50 p-3 text-sm leading-relaxed text-slate-700 dark:bg-mint-500/10">
          <span className="font-bold text-mint-700">{ui.answerLabel} </span>
          {item.answer}
        </div>
      </div>
    </div>
  )
}

const refMeta: Record<RefKind, { icon: typeof Landmark; tone: string; label: string }> = {
  official: { icon: Landmark, tone: 'bg-brand-100 text-brand-700', label: 'Official' },
  textbook: { icon: BookMarked, tone: 'bg-sun-100 text-sun-600', label: 'Textbook' },
  article: { icon: Newspaper, tone: 'bg-mint-100 text-mint-600', label: 'Article' },
  video: { icon: PlayCircle, tone: 'bg-rose-100 text-rose-600', label: 'Video' },
}

function SectionHeading({ icon: Icon, children }: { icon: typeof BookOpen; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-xl font-bold">
      <Icon className="h-5 w-5 text-brand-600" />
      {children}
    </h2>
  )
}

export default function ResourceTopic() {
  const { id } = useParams<{ id: string }>()
  const [lang, setLang] = useLang()
  const ui = useUI(lang)
  const topic = id ? getResourceTopic(id) : undefined
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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link
          to="/resources"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" /> {ui.library}
        </Link>
        <div className="flex items-center gap-2">
          {hasGu && <LangToggle lang={lang} onChange={setLang} />}
          <button
            onClick={downloadAsPdf}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-600"
          >
            <Download className="h-4 w-4" /> {ui.downloadPdf}
          </button>
        </div>
      </div>

      {/* header */}
      <div className="mt-5 flex items-start gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
          <topic.icon className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="cl-pill bg-brand-100 text-brand-700 !px-2.5 !py-0.5 !text-xs">{topic.subject}</span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" /> {topic.readingMinutes} {ui.minRead}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{title}</h1>
          <p className="mt-1 text-sm font-medium text-slate-400">{level}</p>
        </div>
      </div>

      {/* overview */}
      <section className="mt-8">
        <SectionHeading icon={BookOpen}>{ui.overview}</SectionHeading>
        <div className="mt-3 space-y-3">
          {overview.map((p, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-slate-700">
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* key terms */}
      <section className="mt-10">
        <SectionHeading icon={BookMarked}>{ui.keyTerms}</SectionHeading>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {keyTerms.map((k) => (
            <div key={k.term} className="cl-card p-4 hover:translate-y-0">
              <dt className="text-sm font-bold text-slate-800">{k.term}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-slate-600">{k.def}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* formulas */}
      {formulas && formulas.length > 0 && (
        <section className="mt-10">
          <SectionHeading icon={Sigma}>{ui.keyFormulas}</SectionHeading>
          <div className="mt-3 space-y-3">
            {formulas.map((f) => (
              <div key={f.name} className="cl-card p-4 hover:translate-y-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 className="text-sm font-bold text-slate-800">{f.name}</h3>
                </div>
                <p className="mt-1.5 rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm leading-relaxed text-slate-800">
                  {f.expr}
                </p>
                {f.note && <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{f.note}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* procedure */}
      {procedure && (
        <section className="mt-10">
          <SectionHeading icon={ListChecks}>{procedure.heading ?? ui.theMethod}</SectionHeading>
          <ol className="mt-4 space-y-4">
            {procedure.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{s.title}</p>
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
          <SectionHeading icon={FlaskConical}>{ui.workedExample}</SectionHeading>
          {workedExample.title && (
            <p className="mt-2 text-sm font-semibold text-slate-500">{workedExample.title}</p>
          )}
          <div className="mt-3 rounded-2xl border border-brand-100 bg-brand-50/50 p-4 text-sm leading-relaxed text-slate-700 dark:border-brand-500/20 dark:bg-brand-500/10">
            <span className="font-bold text-brand-700">{ui.problem} </span>
            {workedExample.problem}
            {workedExample.source && (
              <span className="mt-1.5 block text-xs text-slate-400">{workedExample.source}</span>
            )}
          </div>
          <ol className="mt-4 space-y-3">
            {workedExample.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{s.label}</p>
                  {s.formula && <p className="mt-0.5 break-words font-mono text-sm text-slate-600">{s.formula}</p>}
                  {s.result && <p className="mt-0.5 text-sm font-semibold text-brand-700">{s.result}</p>}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-mint-50 p-3 text-sm text-slate-700 dark:bg-mint-500/10">
            <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-mint-600" />
            <span>
              <span className="font-bold text-mint-700">{ui.answer} </span>
              {workedExample.answer}
            </span>
          </div>
        </section>
      )}

      {/* industrial applications */}
      {applications && applications.length > 0 && (
        <section className="mt-10">
          <SectionHeading icon={Factory}>{ui.applications}</SectionHeading>
          <p className="mt-2 text-sm text-slate-500">{ui.applicationsSub}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {applications.map((a, i) => (
              <li key={i} className="cl-card flex gap-2.5 p-4 text-sm leading-relaxed text-slate-700 hover:translate-y-0">
                <Factory className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* advantages + limitations */}
      {(advantages || limitations) && (
        <section className="mt-10 grid gap-5 sm:grid-cols-2">
          {advantages && (
            <div className="rounded-2xl border border-mint-200 bg-mint-50 p-5 dark:border-mint-500/30 dark:bg-mint-500/10">
              <h3 className="flex items-center gap-2 text-sm font-bold text-mint-700">
                <ThumbsUp className="h-4 w-4" /> {ui.advantages}
              </h3>
              <ul className="mt-3 space-y-2">
                {advantages.map((t, i) => (
                  <li key={i} className="text-sm leading-relaxed text-slate-700">• {t}</li>
                ))}
              </ul>
            </div>
          )}
          {limitations && (
            <div className="rounded-2xl border border-sun-200 bg-sun-50 p-5 dark:border-sun-500/30 dark:bg-sun-500/10">
              <h3 className="flex items-center gap-2 text-sm font-bold text-sun-600">
                <MinusCircle className="h-4 w-4" /> {ui.limitations}
              </h3>
              <ul className="mt-3 space-y-2">
                {limitations.map((t, i) => (
                  <li key={i} className="text-sm leading-relaxed text-slate-700">• {t}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* exam tips + pitfalls */}
      {(examTips || pitfalls) && (
        <section className="mt-10 grid gap-5 sm:grid-cols-2">
          {examTips && (
            <div className="rounded-2xl border border-mint-200 bg-mint-50 p-5 dark:border-mint-500/30 dark:bg-mint-500/10">
              <h3 className="flex items-center gap-2 text-sm font-bold text-mint-700">
                <Lightbulb className="h-4 w-4" /> {ui.examTips}
              </h3>
              <ul className="mt-3 space-y-2">
                {examTips.map((t, i) => (
                  <li key={i} className="text-sm leading-relaxed text-slate-700">• {t}</li>
                ))}
              </ul>
            </div>
          )}
          {pitfalls && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-500/30 dark:bg-rose-500/10">
              <h3 className="flex items-center gap-2 text-sm font-bold text-rose-600">
                <AlertTriangle className="h-4 w-4" /> {ui.commonMistakes}
              </h3>
              <ul className="mt-3 space-y-2">
                {pitfalls.map((t, i) => (
                  <li key={i} className="text-sm leading-relaxed text-slate-700">• {t}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* practice */}
      {practice && practice.length > 0 && (
        <section className="mt-10">
          <SectionHeading icon={GraduationCap}>{ui.testYourself}</SectionHeading>
          <p className="mt-2 text-sm text-slate-500">{ui.testYourselfSub}</p>
          <div className="mt-4 space-y-3">
            {practice.map((p, i) => (
              <PracticeItem key={i} item={p} index={i} ui={ui} />
            ))}
          </div>
        </section>
      )}

      {/* practise CTAs */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2 print:hidden">
        {calc && (
          <Link
            to={`/learn/c/${calc.slug}`}
            className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white shadow-md transition hover:shadow-lg"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15">
              <Calculator className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{ui.tryCalculator}</p>
              <p className="text-sm text-white/80">{ui.tryCalculatorSub}</p>
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0" />
          </Link>
        )}
        <Link
          to="/formulas"
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-200 hover:bg-brand-50/40"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-brand-600">
            <FileText className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900">{ui.formulaSheet}</p>
            <p className="text-sm text-slate-600">{ui.formulaSheetSub}</p>
          </div>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-400" />
        </Link>
      </section>

      {/* references */}
      <section className="mt-10">
        <SectionHeading icon={ExternalLink}>{ui.references}</SectionHeading>
        <div className="mt-3 space-y-2.5">
          {topic.references.map((r) => {
            const meta = refMeta[r.kind]
            return (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-brand-200 hover:bg-brand-50/40"
              >
                <span className={`cl-pill ${meta.tone} !px-2 !py-0.5 !text-xs`}>
                  <meta.icon className="h-3.5 w-3.5" /> {meta.label}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{r.label}</span>
                {r.source && <span className="shrink-0 text-xs text-slate-400">{r.source}</span>}
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
              </a>
            )
          })}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          A study aid grounded in standard B.Com / CA-CS-CMA texts and Dr. Desai’s class material. Always
          confirm statutory rates and the current exam scheme with the official source before relying on them.
        </p>
      </section>
    </div>
  )
}
