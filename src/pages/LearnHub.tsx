import PageHeader from '../components/PageHeader'
import ComingSoon from '../components/ComingSoon'

export default function LearnHub() {
  return (
    <>
      <PageHeader
        eyebrow="Learn Hub"
        title="Tools that teach, not just compute"
        subtitle="Calculators that show their working, practice quizzes, formula sheets and a subject-wise resource library — all free."
      />
      <ComingSoon
        phase="Coming in Phase 1 & 2"
        points={[
          'Hero calculators: break-even / CVP (with live chart), GST, income tax (old vs new), EMI, depreciation',
          'Full solver set across accounting, costing, financial management, statistics and economics',
          'Searchable formula & cheat-sheets, downloadable as PDF',
          'Resource library organised subject- and semester-wise',
        ]}
      />
    </>
  )
}
