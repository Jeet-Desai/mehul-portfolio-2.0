import { Link } from 'react-router-dom'
import { site } from '../data/site'

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${className}`}>
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-display text-base font-extrabold text-white shadow-md shadow-brand-500/30 transition group-hover:scale-105">
        CL
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-extrabold text-slate-900">
          {site.brand}
        </span>
        <span className="block text-[11px] font-medium text-slate-400">{site.byline}</span>
      </span>
    </Link>
  )
}
