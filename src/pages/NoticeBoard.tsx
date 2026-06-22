import PageHeader from '../components/PageHeader'
import ComingSoon from '../components/ComingSoon'

export default function NoticeBoard() {
  return (
    <>
      <PageHeader
        eyebrow="Notice Board"
        title="Announcements & updates"
        subtitle="Exam dates, syllabus changes and important notices — so students never miss a thing."
      />
      <ComingSoon
        phase="Coming in Phase 5"
        points={[
          'Pinned announcements with dates and tags',
          'Exam schedules and syllabus updates',
          'Simple admin posting (no code required)',
          'Optional WhatsApp share for each notice',
        ]}
      />
    </>
  )
}
