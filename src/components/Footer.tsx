import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Facebook, Instagram } from './BrandIcons'
import { site, contact, navLinks } from '../data/site'

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
              <Link to="/career" className="text-slate-600 hover:text-brand-600">
                Career Guide
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
          <div className="mt-4 flex gap-3">
            <a
              href={contact.socials.facebook}
              target="_blank"
              rel="noreferrer"
              className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={contact.socials.instagram}
              target="_blank"
              rel="noreferrer"
              className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {site.brand} · {site.byline}
      </div>
    </footer>
  )
}
