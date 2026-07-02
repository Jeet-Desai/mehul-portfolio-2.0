import { Link } from 'react-router-dom'
import { site } from '../data/site'

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label={`${site.brand} — home`}
      className={`group flex items-center gap-2.5 ${className}`}
    >
      {/* Ledger nav tile — the mark full-bleed on its own near-black, 10px radius */}
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[10px] border border-slate-200 bg-[#0b0f18]">
        <img
          src="/images/accrualsense-mark.png"
          alt={site.brand}
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.07]"
        />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[18px] font-semibold tracking-[-0.01em] text-slate-900 transition-colors duration-200 group-hover:text-brand-600">
          {site.brand}
        </span>
        <span className="block text-[11px] font-medium text-slate-400">{site.byline}</span>
      </span>
    </Link>
  )
}
