import { Download } from 'lucide-react'
import Reveal from '../components/Reveal'
import CountUp from '../components/CountUp'
import { professor, fullStats, timeline } from '../data/site'
import { usePageTitle } from '../lib/usePageTitle'

/* Ledger About (design 3a) — bio · info cards · timeline · by-the-numbers. */

const infoItems = [
  { label: 'Qualification', value: professor.qualifications.join(' · ') },
  { label: 'Designation', value: professor.role },
  { label: 'Research area', value: professor.researchArea },
  { label: 'Languages', value: professor.languages.join(' · ') },
]

/* fullStats values are strings like "22" — split so CountUp animates the
   numeric part and any trailing suffix stays static. */
function StatValue({ value }: { value: string }) {
  const m = value.match(/^(\d+)(.*)$/)
  if (!m) return <>{value}</>
  return <CountUp to={Number(m[1])} suffix={m[2]} />
}

export default function About() {
  usePageTitle('About Dr. Mehulkumar Desai', 'Professor of commerce for 22 years — qualifications, teaching journey and the story behind this free learning hub.')
  return (
    <div className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pt-14">
      {/* ---------- header — name + CV left, offset-frame photo right ---------- */}
      <Reveal className="grid items-center gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <span className="eyebrow">About</span>
          <h1 className="mt-3.5 text-4xl leading-[1.05] sm:text-[52px]">{professor.name}</h1>
          <p className="mt-2 max-w-lg text-[15.5px] leading-relaxed text-slate-600">
            {professor.role} — {professor.institution}.
          </p>
          <a
            href={professor.cv}
            download="mehulkumar-desai-cv.pdf"
            className="btn-accent mt-6 px-5 py-3 text-sm"
          >
            <Download className="h-4 w-4" /> Download CV
          </a>
        </div>

        {/* professor photo in the offset accent frame */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div
            aria-hidden
            className="absolute -bottom-2.5 -right-2.5 left-3.5 top-3.5 rounded-md border-[1.5px] border-brand-600 opacity-50"
          />
          <img
            src={professor.photo}
            alt={professor.name}
            className="relative aspect-square w-full rounded-md border border-slate-200 object-cover"
          />
        </div>
      </Reveal>

      {/* ---------- bio + info cards | timeline ---------- */}
      <div className="mt-11 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <Reveal>
          <h2 className="text-2xl">Information about me</h2>
          <p className="mt-3 text-[15px] leading-[1.75] text-slate-600">{professor.bio}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {infoItems.map((it) => (
              <div key={it.label} className="cl-card rounded-[10px] px-[18px] py-4">
                <p className="font-sans text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  {it.label}
                </p>
                <p className="mt-1 font-display text-sm font-semibold text-slate-900">{it.value}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.09}>
          <h2 className="text-2xl">Timeline</h2>
          <div className="mt-4 flex flex-col gap-5 border-l-2 border-line pl-5">
            {timeline.map((t) => (
              <div key={t.period} className="relative">
                <span className="absolute -left-[27px] top-[3px] h-3 w-3 rounded-full bg-brand-600 ring-[3px] ring-slate-50" />
                <p className="text-xs font-bold text-brand-600">{t.period}</p>
                <p className="mt-0.5 font-display text-[15px] font-semibold text-slate-900">{t.role}</p>
                <p className="text-[13px] text-slate-600">{t.org}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ---------- by the numbers ---------- */}
      <Reveal className="mt-11">
        <h2 className="text-2xl">By the numbers</h2>
        <div className="mt-4 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {fullStats.map((s) => (
            <div key={s.label} className="cl-card rounded-[10px] p-5 text-center">
              <p className="font-display text-[34px] leading-tight font-semibold text-brand-600">
                <StatValue value={s.value} />
              </p>
              <p className="mt-1.5 text-[12.5px] text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  )
}
