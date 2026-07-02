import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import { getExam, daysLeft, EXAM_EVENT, type ExamTarget } from '../lib/exam'

/** Navbar exam countdown — appears once the student sets a target on /progress. */
export default function ExamChip() {
  const [exam, setExamState] = useState<ExamTarget | null>(() => getExam())

  useEffect(() => {
    const refresh = () => setExamState(getExam())
    window.addEventListener(EXAM_EVENT, refresh)
    window.addEventListener('storage', refresh) // cross-tab
    return () => {
      window.removeEventListener(EXAM_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  if (!exam) return null
  const left = daysLeft(exam)
  if (left < 0) return null

  return (
    <Link
      to="/progress"
      title={`${exam.name} · ${exam.date}`}
      className="hidden h-10 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-800 transition hover:border-brand-600 hover:text-brand-600 md:inline-flex"
    >
      <CalendarClock className="h-3.5 w-3.5 text-brand-600" />
      {left === 0 ? 'Exam today' : `${left}d to exam`}
    </Link>
  )
}
