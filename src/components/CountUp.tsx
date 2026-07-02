import { useEffect, useRef, useState } from 'react'

/** Animated counter — counts up (ease-out cubic) the first time it scrolls
    into view. Respects prefers-reduced-motion by snapping to the target. */
export default function CountUp({
  to,
  suffix = '',
  duration = 1.5,
}: {
  to: number
  suffix?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [val, setVal] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(to)
      return
    }
    // NOTE: entries batch — a single delivery can contain the initial
    // not-intersecting record AND the scrolled-into-view one; check them all.
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting) || started.current) return
      started.current = true
      io.disconnect()
      const t0 = performance.now()
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / (duration * 1000))
        setVal(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [to, duration])

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  )
}
