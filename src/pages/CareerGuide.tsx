import PageHeader from '../components/PageHeader'
import ComingSoon from '../components/ComingSoon'

export default function CareerGuide() {
  return (
    <>
      <PageHeader
        eyebrow="Career Guide"
        title="What after B.Com?"
        subtitle="Clear roadmaps for every path a commerce student can take — with timelines, exams and prospects."
      />
      <ComingSoon
        phase="Coming in Phase 4"
        points={[
          'Roadmaps for CA, CS, CMA, MBA, M.Com, ACCA',
          'Government & banking exam tracks (SSC, IBPS, RBI)',
          'New-age paths: data analytics, fintech, financial modelling',
          'Eligibility, duration, cost and career prospects at a glance',
        ]}
      />
    </>
  )
}
