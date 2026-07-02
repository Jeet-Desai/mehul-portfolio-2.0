import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Facebook, Instagram } from './BrandIcons'
import { site, contact, navLinks } from '../data/site'

/* Render only the socials that have a URL set (data-driven) — empty ones are hidden. */
const socialIcons = { facebook: Facebook, instagram: Instagram } as const
const activeSocials = (Object.keys(socialIcons) as (keyof typeof socialIcons)[])
  .map((k) => ({ key: k, url: contact.socials[k], Icon: socialIcons[k] }))
  .filter((s) => s.url)

export default function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <span className="font-display text-xl font-semibold text-slate-900">{site.brand}</span>
          <p className="mt-1 text-sm text-slate-400">{site.byline}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">{site.description}</p>
        </div>

        <div>
          <h4 className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Explore</h4>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="font-semibold text-slate-600 transition hover:text-brand-600">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/formulas" className="font-semibold text-slate-600 transition hover:text-brand-600">
                Formula Sheets
              </Link>
            </li>
            <li>
              <Link to="/notices" className="font-semibold text-slate-600 transition hover:text-brand-600">
                Notice Board
              </Link>
            </li>
            <li>
              <Link to="/revise" className="font-semibold text-slate-600 transition hover:text-brand-600">
                Flashcards
              </Link>
            </li>
            <li>
              <Link to="/progress" className="font-semibold text-slate-600 transition hover:text-brand-600">
                My Progress
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Connect</h4>
          <a
            href={`mailto:${contact.email}`}
            className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-brand-600"
          >
            <Mail className="h-4 w-4" /> {contact.email}
          </a>
          {activeSocials.length > 0 && (
            <div className="mt-4 flex gap-3">
              {activeSocials.map(({ key, url, Icon }) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-[10px] border border-slate-200 bg-white text-slate-600 transition hover:border-brand-600 hover:text-brand-600"
                  aria-label={key}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 border-t border-slate-200 py-5 text-center text-xs text-slate-400 sm:flex-row sm:gap-4">
        <span>© {new Date().getFullYear()} {site.brand} · {site.byline}</span>
        <span className="hidden sm:inline">·</span>
        <Link to="/privacy" className="transition hover:text-brand-600">Privacy Policy</Link>
        <Link to="/terms" className="transition hover:text-brand-600">Terms of Service</Link>
      </div>
    </footer>
  )
}
