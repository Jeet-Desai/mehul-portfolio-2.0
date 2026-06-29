/* ----------------------------------------------------------------------------
   Notice Board — announcements, study tips and exam pointers. Data-driven.

   HONESTY RULE (this ships under Dr. Desai's name):
   - "Site update" notices describe features that are genuinely live on this site.
   - "Exam info" notices NEVER assert specific exam dates — they point students to
     the official institute/board so they confirm the real schedule themselves.
   - "Study tip" notices are evergreen, generally-true guidance.
   Do NOT add date-specific exam claims here. Link out to the authority instead.
---------------------------------------------------------------------------- */

export type NoticeCategory = 'Site update' | 'Exam info' | 'Study tip'

export type Notice = {
  id: string
  title: string
  /** ISO date the notice was posted (YYYY-MM-DD), parsed as local for display */
  date: string
  category: NoticeCategory
  pinned?: boolean
  body: string
  /** optional call-to-action: internal route (starts with "/") or external URL */
  link?: { label: string; to: string }
}

export const noticeCategories: NoticeCategory[] = ['Site update', 'Exam info', 'Study tip']

export const notices: Notice[] = [
  {
    id: 'bond-inventory',
    title: 'New tools: Bond Pricing & Inventory valuation',
    date: '2026-06-23',
    category: 'Site update',
    pinned: true,
    body: 'Two more calculators are live in the Learn Hub. Bond Pricing & YTM prices a bond from its coupon, yield and maturity (or solves for the yield to maturity), and the Inventory tool values closing stock under FIFO, LIFO or weighted average with a full store-ledger card. Both show the complete working.',
    link: { label: 'Open the Learn Hub', to: '/learn' },
  },
  {
    id: 'formula-sheets',
    title: 'Formula sheets added to the Learn Hub',
    date: '2026-06-23',
    category: 'Site update',
    pinned: true,
    body: 'A searchable set of formula / quick-reference sheets is now live — grouped by subject, so you can revise the key formulas for costing, financial management, accounting and taxation in one place before an exam.',
    link: { label: 'Browse formula sheets', to: '/formulas' },
  },
  {
    id: 'exam-calendars',
    title: 'Always confirm your exam schedule on the official site',
    date: '2026-06-15',
    category: 'Exam info',
    body: 'Exam dates and syllabus schemes change from session to session. For CA/CS/CMA, check the institute directly (ICAI, ICSI, ICMAI); for B.Com / M.Com, check your university. This board will never guess a date for you — always verify against the official source.',
    link: { label: 'ICAI — official site', to: 'https://www.icai.org' },
  },
  {
    id: 'practice-live',
    title: 'Practice & Quizzes — with a beat-the-clock timer',
    date: '2026-06-10',
    category: 'Site update',
    body: 'Test yourself topic-wise (or mixed) with multiple-choice questions that reveal the reasoning once you answer, difficulty tags, an optional exam timer and a score-and-review summary at the end.',
    link: { label: 'Start practising', to: '/practice' },
  },
  {
    id: 'revise-smart',
    title: 'Revising before an exam? Pair the sheets with practice',
    date: '2026-06-05',
    category: 'Study tip',
    body: 'A method that works: skim the formula sheet for a topic, then immediately attempt a few practice questions on it. Active recall beats re-reading. Use the calculators to check your own working step by step, not just the final answer.',
    link: { label: 'Go to the Learn Hub', to: '/learn' },
  },
  {
    id: 'career-guide',
    title: 'Career Guide: map your path after B.Com',
    date: '2026-05-28',
    category: 'Site update',
    body: 'Weighing CA vs CS vs CMA vs M.Com vs MBA vs ACCA vs government exams? The Career Guide lays out the stages, eligibility, rough cost and where each route leads — each linked to its official institute.',
    link: { label: 'Explore career paths', to: '/career' },
  },
  {
    id: 'dark-mode',
    title: 'Dark mode is here',
    date: '2026-05-20',
    category: 'Site update',
    body: 'Studying late? Toggle dark mode from the sun/moon button in the top bar. Your choice is remembered on this device.',
  },
]
