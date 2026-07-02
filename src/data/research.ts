/* Research data. Aggregate counts are real (from the v1 site).
   `books` and `publications` are intentionally empty until the real list /
   Google Scholar profile is provided — we don't invent academic citations. */

export const researchStats = [
  { value: '36', label: 'Research papers published' },
  { value: '19', label: 'Papers presented' },
  { value: '3', label: 'Books authored' },
  { value: '4', label: 'Chapters in edited books' },
]

export const scholars = [
  { value: '11', label: 'Ph.D. scholars guided' },
  { value: '8', label: 'Ph.D. scholars in progress' },
  { value: '2', label: 'M.Phil. scholars guided' },
]

export const researchAreas = ['Accounting', 'Finance', 'Cost & Management Accounting', 'Management']

/** Google Scholar / ORCID / ResearchGate profile URL — add when available. */
export const scholarUrl = ''

export type Book = { title: string; year?: string; publisher?: string }
export const books: Book[] = []

export type Publication = { title: string; journal?: string; year?: string; url?: string }
export const publications: Publication[] = []
