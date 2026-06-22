import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'

/** A single line in the "show your working" panel. */
export type Step = {
  label: string
  /** the formula / substitution, e.g. "BEP = 50,000 ÷ 40" */
  formula?: string
  /** the resulting value, e.g. "1,250 units" */
  result?: string
  note?: string
}

export type CalcCategory =
  | 'Costing'
  | 'Accounting'
  | 'Taxation'
  | 'Finance'
  | 'Financial Management'
  | 'Investing'

export type Calculator = {
  slug: string
  title: string
  category: CalcCategory
  blurb: string
  icon: LucideIcon
  /** lazy loader for the calculator component (keeps heavy chart code out of the main bundle) */
  load: () => Promise<{ default: ComponentType }>
  /** search keywords */
  tags?: string[]
}
