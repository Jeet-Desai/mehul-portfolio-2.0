import PageHeader from '../components/PageHeader'
import ComingSoon from '../components/ComingSoon'

export default function Research() {
  return (
    <>
      <PageHeader
        eyebrow="Research"
        title="Publications & scholarship"
        subtitle="36 research papers, 3 authored books, and Ph.D. scholars guided — in Accounting, Finance and Management."
      />
      <ComingSoon
        phase="Coming in Phase 1"
        points={[
          'Full publications list with titles, journals, years and links',
          'Authored books and edited-book chapters with covers',
          'Ph.D. and M.Phil. scholars guided',
          'Google Scholar profile link',
        ]}
      />
    </>
  )
}
