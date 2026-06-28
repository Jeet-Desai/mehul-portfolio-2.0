/* ----------------------------------------------------------------------------
   Career Guide — paths after B.Com / 12th commerce. Data-driven.
   Facts kept general (structures change) — always confirm eligibility, fees and
   the exam scheme on the official institute website (linked per card).
---------------------------------------------------------------------------- */

export type CareerCategory = 'Professional' | 'Postgraduate' | 'Global' | 'Government'

export type CareerPath = {
  id: string
  name: string
  fullName: string
  body: string
  category: CareerCategory
  blurb: string
  eligibility: string
  duration: string
  stages: string[]
  cost: string
  prospects: string[]
  officialUrl: string
}

export const careerCategories: CareerCategory[] = ['Professional', 'Postgraduate', 'Global', 'Government']

export const careers: CareerPath[] = [
  {
    id: 'ca',
    name: 'CA',
    fullName: 'Chartered Accountancy',
    body: 'ICAI',
    category: 'Professional',
    blurb: 'The flagship accounting & audit qualification in India — audit, taxation, finance and assurance.',
    eligibility: 'After Class 12 (Foundation route) or graduation (Direct Entry).',
    duration: 'About 4.5–5 years from Class 12.',
    stages: [
      'CA Foundation — entry exam after Class 12',
      'CA Intermediate — two groups of papers',
      'Articleship — practical training (around 2–3 years)',
      'CA Final — clear both groups to qualify',
    ],
    cost: 'Low relative to other professional routes (mostly institute fees).',
    prospects: ['Statutory & internal audit', 'Direct & indirect taxation', 'Corporate finance / CFO track', 'Independent practice'],
    officialUrl: 'https://www.icai.org',
  },
  {
    id: 'cs',
    name: 'CS',
    fullName: 'Company Secretary',
    body: 'ICSI',
    category: 'Professional',
    blurb: 'Corporate governance, company law and secretarial / compliance practice.',
    eligibility: 'After Class 12 (via CSEET) or graduation.',
    duration: 'Around 3 years.',
    stages: [
      'CSEET — entrance test',
      'CS Executive programme',
      'CS Professional programme',
      'Practical training to qualify as a member',
    ],
    cost: 'Moderate — mainly institute fees.',
    prospects: ['Company secretary / compliance officer', 'Corporate governance & legal', 'Secretarial audit', 'Independent practice'],
    officialUrl: 'https://www.icsi.edu',
  },
  {
    id: 'cma',
    name: 'CMA',
    fullName: 'Cost & Management Accountancy',
    body: 'ICMAI',
    category: 'Professional',
    blurb: 'Cost control, management accounting and strategic financial decision-making — Dr. Desai’s own specialism.',
    eligibility: 'After Class 12 (Foundation) or graduation (direct to Intermediate).',
    duration: 'Around 3–4 years.',
    stages: [
      'CMA Foundation — after Class 12',
      'CMA Intermediate — two groups',
      'Practical training',
      'CMA Final — clear both groups',
    ],
    cost: 'Moderate — mainly institute fees.',
    prospects: ['Cost accounting & control', 'Management accounting / FP&A', 'Cost audit', 'Industry finance roles'],
    officialUrl: 'https://www.icmai.in',
  },
  {
    id: 'mba',
    name: 'MBA',
    fullName: 'Master of Business Administration',
    body: 'Universities / B-schools',
    category: 'Postgraduate',
    blurb: 'A management degree with finance, marketing, HR and analytics specialisations.',
    eligibility: 'Graduation in any stream + an entrance test (CAT / XAT / CMAT / MAT / GMAT).',
    duration: '2 years (full-time).',
    stages: [
      'Graduate in any discipline',
      'Clear an MBA entrance exam',
      'Group discussion & personal interview',
      'Two-year programme with a specialisation',
    ],
    cost: 'Wide range — modest at public institutes, high at premier private B-schools.',
    prospects: ['Investment banking / corporate finance', 'Consulting', 'Marketing & product', 'General management'],
    officialUrl: 'https://iimcat.ac.in',
  },
  {
    id: 'mcom',
    name: 'M.Com',
    fullName: 'Master of Commerce',
    body: 'Universities',
    category: 'Postgraduate',
    blurb: 'A deeper academic grounding in commerce — the gateway to teaching and research.',
    eligibility: 'B.Com or an equivalent bachelor’s degree.',
    duration: '2 years.',
    stages: [
      'Complete your bachelor’s degree (B.Com / BBA / BCA or equivalent)',
      'Enrol in M.Com (specialise in accounting / finance)',
      'Qualify UGC-NET / SET for lectureship',
      'Optional: pursue a Ph.D. for a research career',
    ],
    cost: 'Low (mostly university fees).',
    prospects: ['Assistant professor / lecturer', 'Research & academia', 'Banking & financial services', 'Civil services preparation'],
    officialUrl: 'https://ugcnet.nta.ac.in',
  },
  {
    id: 'acca',
    name: 'ACCA',
    fullName: 'Association of Chartered Certified Accountants',
    body: 'ACCA (UK)',
    category: 'Global',
    blurb: 'A globally recognised accounting qualification — useful for MNCs and overseas roles.',
    eligibility: 'After Class 12 / graduation; commerce graduates may get exam exemptions.',
    duration: 'Around 2–3 years depending on exemptions.',
    stages: [
      'Applied Knowledge level',
      'Applied Skills level',
      'Strategic Professional level',
      'Practical experience requirement (PER)',
    ],
    cost: 'Higher — exams are priced in GBP.',
    prospects: ['MNCs & Big-4 firms', 'International finance & reporting (IFRS)', 'Overseas opportunities', 'Audit & advisory'],
    officialUrl: 'https://www.accaglobal.com',
  },
  {
    id: 'govt',
    name: 'Govt & Banking',
    fullName: 'Government & Banking Exams',
    body: 'UPSC / IBPS / SSC / RBI',
    category: 'Government',
    blurb: 'Stable, prestigious public-sector careers — banking, civil services and central agencies.',
    eligibility: 'Graduation in any stream (age limits and attempts vary by exam).',
    duration: 'Exam-cycle based; preparation typically 1–2 years.',
    stages: [
      'Graduate in any discipline',
      'Bank PO/Clerk (IBPS/SBI) or RBI Grade B',
      'SSC CGL for central government posts',
      'UPSC Civil Services for IAS/IRS etc.',
    ],
    cost: 'Very low (nominal exam fees).',
    prospects: ['Bank Probationary Officer', 'RBI / SEBI officer', 'Income Tax / Audit & Accounts (via SSC)', 'Civil services (IAS/IRS)'],
    officialUrl: 'https://www.ibps.in',
  },
]
