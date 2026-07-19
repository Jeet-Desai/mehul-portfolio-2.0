import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FlaskConical, CheckCircle2, XCircle, RotateCw, Share2, Eye, CalendarDays, ArrowUpRight, Info } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import CalcField from '../components/calc/CalcField'
import CalcSteps from '../components/calc/CalcSteps'
import { ResultPanel } from '../components/calc/CalcResult'
import { generateProblem, dailyChallenge, labTemplates, isCorrect, type LabProblem } from '../lib/problemLab'
import { getCalculator } from '../calculators/registry'
import { touchStreak } from '../lib/progress'
import { toNum, formatNum } from '../lib/format'
import { shareCalculation } from '../lib/urlState'
import { usePageTitle } from '../lib/usePageTitle'

/* ----------------------------------------------------------------------------
   Problem Lab — unlimited exam-style numericals, graded figure by figure.

   A problem is fully identified by (template, seed): the URL always carries
   ?t=…&s=…, so every problem is a WhatsApp-shareable "challenge a friend"
   link, and the Daily Challenge is the same sum for every student today.
---------------------------------------------------------------------------- */

type Sel = { templateId: string; seed: number }

function fromUrl(): Sel {
  const p = new URLSearchParams(window.location.search)
  const t = p.get('t')
  const s = Number(p.get('s'))
  if (t && labTemplates.some((x) => x.id === t) && Number.isFinite(s) && s > 0) {
    return { templateId: t, seed: Math.floor(s) }
  }
  return dailyChallenge()
}

function toUrl(sel: Sel) {
  const url = new URL(window.location.href)
  url.searchParams.set('t', sel.templateId)
  url.searchParams.set('s', String(sel.seed))
  window.history.replaceState(window.history.state, '', url)
}

const newSeed = () => Math.floor(Math.random() * 2 ** 31) || 1

export default function ProblemLab() {
  usePageTitle('Problem Lab — Unlimited Practice Sums', 'Endless exam-style commerce numericals with instant grading and full step-by-step solutions — plus a daily challenge you can share with friends.')

  const [sel, setSel] = useState<Sel>(fromUrl)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'shared' | 'failed'>('idle')

  const problem: LabProblem = useMemo(() => generateProblem(sel.templateId, sel.seed), [sel])
  const daily = useMemo(dailyChallenge, [])
  const isDaily = sel.templateId === daily.templateId && sel.seed === daily.seed

  // Stamp ?t&s into the URL from the very first render, so a "challenge a
  // friend" link copied straight away pins TODAY'S sum (not the friend's daily).
  useEffect(() => {
    toUrl(sel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const load = (next: Sel) => {
    setSel(next)
    setInputs({})
    setChecked(false)
    setRevealed(false)
    setShareState('idle')
    toUrl(next)
  }

  const results = useMemo(() => {
    if (!checked) return null
    return problem.answers.map((a) => ({ a, ok: isCorrect(a, toNum(inputs[a.key] ?? '')) }))
  }, [checked, problem, inputs])
  const score = results ? results.filter((r) => r.ok).length : 0

  const check = () => {
    setChecked(true)
    touchStreak()
  }

  const share = async () => {
    const outcome = await shareCalculation(`Can you solve this? ${problem.title} — Problem Lab`)
    setShareState(outcome === 'shared' ? 'shared' : outcome === 'copied' ? 'copied' : 'failed')
  }

  const calc = problem.calc ? getCalculator(problem.calc) : undefined

  return (
    <>
      <PageHeader
        eyebrow="Problem Lab"
        title="A fresh sum,"
        titleAccent="every single time."
        subtitle="Unlimited exam-style numericals — type your answers, get graded figure by figure, then see the full method. Same daily challenge for everyone; share any sum with a friend."
      />

      <div className="mx-auto max-w-6xl px-4 pt-7 pb-12 sm:px-6">
        {/* daily challenge strip */}
        <Reveal>
          <div className="ink-card ink-lines flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 shrink-0 opacity-70" />
              <div>
                <p className="font-sans text-[11px] font-bold uppercase tracking-[0.1em] opacity-60">Daily challenge</p>
                <p className="font-display text-lg font-semibold leading-snug">
                  {isDaily ? 'You’re on today’s sum — every student in the country gets this exact problem.' : 'One sum, same for everyone, every day. Can you keep the streak?'}
                </p>
              </div>
            </div>
            {!isDaily && (
              <button onClick={() => load(daily)} className="btn-accent px-4 py-2 text-[13px]">
                Solve today’s challenge
              </button>
            )}
          </div>
        </Reveal>

        {/* topic chips */}
        <div className="mt-6 flex flex-wrap gap-2">
          {labTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => load({ templateId: t.id, seed: newSeed() })}
              className={`rounded-full px-[15px] py-[7px] text-[12.5px] transition ${
                sel.templateId === t.id
                  ? 'bg-brand-600 font-bold text-white'
                  : 'bg-slate-100 font-semibold text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={() => load({ templateId: labTemplates[Math.floor(Math.random() * labTemplates.length)].id, seed: newSeed() })}
            className="rounded-full bg-slate-100 px-[15px] py-[7px] text-[12.5px] font-semibold text-brand-600 transition hover:bg-slate-200"
          >
            🎲 Surprise me
          </button>
        </div>

        {/* the problem */}
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <div className="cl-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-brand-600">{problem.topic}</span>
                {isDaily && (
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 font-sans text-[10.5px] font-bold uppercase tracking-[0.08em] text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                    Today’s challenge
                  </span>
                )}
              </div>
              <h2 className="mt-2 font-display text-[26px] font-semibold leading-snug">{problem.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{problem.scenario}</p>
            </div>

            <ResultPanel title="Given">
              <div className="divide-y divide-slate-100">
                {problem.given.map((g) => (
                  <div key={g.label} className="flex items-center justify-between gap-4 py-2">
                    <span className="text-sm text-slate-600">{g.label}</span>
                    <span className="text-sm font-semibold text-slate-800">{g.value}</span>
                  </div>
                ))}
              </div>
            </ResultPanel>

            {revealed && <CalcSteps steps={problem.steps} />}

            {revealed && calc && (
              <Link
                to={`/learn/c/${calc.slug}`}
                className="cl-card-lift flex items-center gap-3 rounded-xl border border-slate-200 bg-brand-50 px-5 py-4"
              >
                <calc.icon className="h-5 w-5 shrink-0 text-brand-600" />
                <span className="flex-1 text-sm font-semibold text-slate-800">
                  Practise this method interactively — {calc.title}
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-brand-600" />
              </Link>
            )}
          </div>

          {/* answers */}
          <div className="space-y-4 lg:col-span-2">
            <ResultPanel title="Your answers">
              <div className="space-y-3">
                {problem.answers.map((a) => {
                  const r = results?.find((x) => x.a.key === a.key)
                  return (
                    <div key={a.key}>
                      <CalcField
                        label={a.label}
                        suffix={a.unit}
                        value={inputs[a.key] ?? ''}
                        onChange={(v) => {
                          setInputs((s) => ({ ...s, [a.key]: v }))
                          setChecked(false)
                        }}
                        placeholder="?"
                      />
                      {r && (
                        <p className={`mt-1 flex items-center gap-1.5 text-[12px] font-semibold ${r.ok ? 'text-brand-600' : 'text-sun-600'}`}>
                          {r.ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                          {r.ok
                            ? 'Correct'
                            : revealed
                              ? `Correct answer: ${r.a.unit === '₹' ? '₹' + formatNum(r.a.value) : `${formatNum(r.a.value)}${r.a.unit ? ' ' + r.a.unit : ''}`}`
                              : 'Not quite — try again or reveal the working'}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={check} className="btn-accent px-4 py-2 text-[13px]">
                  Check answers
                </button>
                <button
                  onClick={() => setRevealed(true)}
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-900 transition hover:border-brand-600"
                >
                  <Eye className="h-4 w-4" /> Show working
                </button>
              </div>

              {results && (
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Score: <span className="font-display text-brand-600">{score} / {problem.answers.length}</span>
                  {score === problem.answers.length ? ' — perfect! Try another one.' : revealed ? '' : ' — check the hint, or reveal the full working.'}
                </p>
              )}
            </ResultPanel>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => load({ templateId: sel.templateId, seed: newSeed() })}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-900 transition hover:border-brand-600"
              >
                <RotateCw className="h-4 w-4" /> New problem
              </button>
              <button
                onClick={share}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-900 transition hover:border-brand-600"
              >
                <Share2 className="h-4 w-4" />
                {shareState === 'copied' ? 'Link copied!' : shareState === 'shared' ? 'Shared!' : shareState === 'failed' ? 'Copy failed' : 'Challenge a friend'}
              </button>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Your friend opens the link and gets the <strong>exact same sum</strong> — same numbers, same answers.
                Solve it separately, then compare. Answers are graded with a small rounding tolerance, so 2-decimal
                rounding is never marked wrong.
              </span>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600">
              <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>
                Every problem is generated from the same verified formulas the calculators use — the numbers change,
                the method never does.
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
