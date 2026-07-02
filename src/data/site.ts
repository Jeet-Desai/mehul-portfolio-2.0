/* Single source of truth for site content — easy to extend without touching UI. */

export const site = {
  brand: 'AccrualSense',
  byline: 'by Mehul Desai',
  tagline: 'Built by a professor of 22 years — for every commerce student.',
  description:
    'A free learning hub for every commerce student — calculators that show their working, practice quizzes, formula sheets and a 24/7 AI doubt-tutor.',
}

export const professor = {
  name: 'Dr. Mehulkumar Desai',
  role: 'Principal & Professor of Commerce',
  institution:
    'Udhna Citizen Commerce College & SPBCBA & SDHG College of BCA & IT, Surat',
  photo: '/images/DeanMEssage.jpeg',
  cv: '/resume-2.pdf',
  qualifications: ['Ph.D.', 'M.Phil.', 'NET (Commerce)', 'M.Com'],
  researchArea: 'Accounting and Finance',
  subject: 'Cost and Management Accounting',
  languages: ['English', 'Hindi', 'Gujarati'],
  bio: `With over 22 years of combined teaching and administrative experience, specializing in Cost and Management Accounting, I've nurtured a culture of learning and independent thought. My research in Accounting, Finance, and Management seeks innovative solutions to contemporary challenges. By emphasizing critical thinking and lifelong learning, I equip students with essential skills for success.`,
}

export const stats = [
  { value: 22, suffix: '+', label: 'Years teaching' },
  { value: 36, label: 'Research papers' },
  { value: 7, label: 'Ph.D. scholars guided' },
  { value: 3, label: 'Books authored' },
]

export const fullStats = [
  { value: '22', label: 'Years teaching experience' },
  { value: '36', label: 'Research papers published' },
  { value: '19', label: 'Papers presented' },
  { value: '3', label: 'Books authored' },
  { value: '4', label: 'Chapters in edited books' },
  { value: '7', label: 'Candidates guided for Ph.D.' },
  { value: '8', label: 'Candidates working for Ph.D.' },
  { value: '2', label: 'Candidates guided for M.Phil.' },
]

export const timeline = [
  { period: '2018 – Present', role: 'Principal', org: 'Udhna Citizen Commerce College' },
  { period: '2017 – 2018', role: 'Associate Professor', org: 'Udhna Citizen Commerce College' },
  { period: '2002 – 2017', role: 'Assistant Professor', org: 'Udhna Citizen Commerce College' },
]

export const contact = {
  email: 'mehul_p_desai@yahoo.com',
  address: '214, Ranchhod Nagar, Udhna, Surat, Gujarat 394210',
  hours: '8:00 to 13:00',
  socials: {
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
  },
}

export type NavLink = { to: string; label: string }

export const navLinks: NavLink[] = [
  { to: '/', label: 'Home' },
  { to: '/learn', label: 'Learn Hub' },
  { to: '/resources', label: 'Library' },
  { to: '/practice', label: 'Practice' },
  { to: '/revise', label: 'Revise' },
  { to: '/ask', label: 'Ask AI' },
  { to: '/career', label: 'Career' },
  { to: '/research', label: 'Research' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]
