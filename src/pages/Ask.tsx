import PageHeader from '../components/PageHeader'
import ComingSoon from '../components/ComingSoon'

export default function Ask() {
  return (
    <>
      <PageHeader
        eyebrow="Ask CommerceLab"
        title="Your 24/7 commerce doubt-tutor"
        subtitle="Ask anything in accounting, costing, tax, finance, economics or statistics — and get a clear, worked answer."
      />
      <ComingSoon
        phase="Coming in Phase 4"
        points={[
          'AI tutor in Dr. Desai’s teaching style, scoped to commerce subjects',
          'Step-by-step worked solutions, bilingual (English + हिंदी / ગુજરાતી)',
          'Anonymous Doubt Box — submit a doubt, get an answer, build a public FAQ',
          'Powered by the Claude API behind a secure, rate-limited endpoint',
        ]}
      />
    </>
  )
}
