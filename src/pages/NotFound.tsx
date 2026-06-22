import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-3xl place-items-center px-4 py-24 text-center sm:px-6">
      <p className="font-display text-7xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you’re looking for doesn’t exist (yet).</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back home
      </Link>
    </div>
  )
}
