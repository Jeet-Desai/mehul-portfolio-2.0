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
    <footer className="mt-20 border-t border-slate-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <span className="font-display text-xl font-extrabold text-slate-900">{site.brand}</span>
          <p className="mt-1 text-sm text-slate-400">{site.byline}</p>
          <p className="mt-4 max-w-xs text-sm text-slate-500">{site.description}</p>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-slate-400">Explore</h4>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-slate-600 hover:text-brand-600">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/formulas" className="text-slate-600 hover:text-brand-600">
                Formula Sheets
              </Link>
            </li>
            <li>
              <Link to="/notices" className="text-slate-600 hover:text-brand-600">
                Notice Board
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-slate-400">Connect</h4>
          <a
            href={`mailto:${contact.email}`}
            className="mt-4 flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600"
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
                  className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
                  aria-label={key}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 border-t border-slate-100 py-5 text-center text-xs text-slate-400 sm:flex-row sm:gap-4">
        <span>© {new Date().getFullYear()} {site.brand} · {site.byline}</span>
        <span className="hidden sm:inline">·</span>
        <Link to="/privacy" className="hover:text-brand-600">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-brand-600">Terms of Service</Link>
      </div>
    </footer>
  )
}
