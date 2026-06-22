import { Download, GraduationCap, BookOpen, Languages, Briefcase } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { professor, fullStats, timeline } from '../data/site'

const infoItems = [
  { icon: GraduationCap, label: 'Qualification', value: professor.qualifications.join(', ') },
  { icon: Briefcase, label: 'Designation', value: professor.role },
  { icon: BookOpen, label: 'Research area', value: professor.researchArea },
  { icon: Languages, label: 'Languages', value: professor.languages.join(', ') },
]

export default function About() {
  return (
    <>
      <PageHeader eyebrow="About" title={professor.name} subtitle={professor.institution}>
        <a
          href={professor.cv}
          download="mehulkumar-desai-cv.pdf"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-700"
        >
          <Download className="h-4 w-4" /> Download CV
        </a>
      </PageHeader>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* bio + info */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold">Information about me</h2>
            <p className="mt-3 leading-relaxed text-slate-600">{professor.bio}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {infoItems.map((it) => (
                <div key={it.label} className="cl-card flex items-start gap-3 p-4 hover:translate-y-0">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <it.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {it.label}
                    </p>
                    <p className="text-sm font-medium text-slate-700">{it.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* timeline */}
          <div>
            <h2 className="text-xl font-bold">Timeline</h2>
            <div className="mt-4 space-y-4 border-l-2 border-brand-100 pl-5">
              {timeline.map((t) => (
                <div key={t.period} className="relative">
                  <span className="absolute -left-[27px] top-1 grid h-5 w-5 place-items-center rounded-full bg-brand-600 ring-4 ring-brand-100">
                    <Briefcase className="h-2.5 w-2.5 text-white" />
                  </span>
                  <p className="text-xs font-semibold text-brand-600">{t.period}</p>
                  <p className="font-semibold text-slate-800">{t.role}</p>
                  <p className="text-sm text-slate-500">{t.org}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* stats */}
        <h2 className="mt-14 text-xl font-bold">By the numbers</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {fullStats.map((s) => (
            <div key={s.label} className="cl-card p-5 text-center hover:translate-y-0">
              <p className="font-display text-3xl font-extrabold text-brand-600">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
