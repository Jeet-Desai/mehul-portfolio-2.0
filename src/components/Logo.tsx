import { Link } from 'react-router-dom'
import { site } from '../data/site'

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label={`${site.brand} — home`}
      className={`group flex items-center gap-2.5 ${className}`}
    >
      {/* Fixed-footprint tile (no scale/translate on the tile → never nudges the
          wordmark). Depth comes from a layered drop-shadow, a hairline ring and a
          glossy top highlight; the mark sits full-bleed on its own near-black. */}
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#0a0a0b] ring-1 ring-white/10 shadow-[0_4px_12px_-3px_rgba(2,6,23,0.5)] transition-shadow duration-300 ease-out group-hover:shadow-[0_10px_26px_-6px_rgba(79,70,229,0.6)] group-hover:ring-brand-400/40">
        <img
          src="/images/accrualsense-mark.png"
          alt={site.brand}
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.07]"
        />
        {/* glossy top sheen for a raised, 3D feel */}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-transparent to-60% opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
        {/* inner edge bevel keeps the rounded corner crisp over the image */}
        <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-extrabold text-slate-900 transition-colors duration-200 group-hover:text-brand-700">
          {site.brand}
        </span>
        <span className="block text-[11px] font-medium text-slate-400">{site.byline}</span>
      </span>
    </Link>
  )
}
