import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { usePageTitle } from '../lib/usePageTitle'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <div className="mx-auto grid max-w-3xl place-items-center px-4 py-24 text-center sm:px-6">
      <p className="font-display text-[110px] font-medium leading-none text-line sm:text-[140px]">404</p>
      <h1 className="mt-3 text-3xl">Page not found</h1>
      <p className="mt-3 text-slate-600">The page you’re looking for doesn’t exist (yet).</p>
      <Link to="/" className="btn-accent mt-8 px-6 py-3 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>
    </div>
  )
}
