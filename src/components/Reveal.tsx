import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * House scroll-reveal — a translate-only rise (y: 22 → 0, 0.8s, the Ledger
 * cubic-bezier). Deliberately NO opacity fade on primary content: if the
 * animation is interrupted the text is still readable (handoff rule).
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'span'
}) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      initial={reduce ? false : { y: 22 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1], delay }}
    >
      {children}
    </Tag>
  )
}
