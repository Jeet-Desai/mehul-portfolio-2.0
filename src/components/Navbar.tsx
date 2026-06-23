import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Sparkles, Sun, Moon } from 'lucide-react'
import { navLinks } from '../data/site'
import Logo from './Logo'

function useDarkMode() {
  const [dark, setDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  )
  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      /* ignore storage failures (private mode) */
    }
  }
  return { dark, toggle }
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { dark, toggle } = useDarkMode()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive
        ? 'bg-brand-50 text-brand-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  const ThemeToggle = ({ className = '' }: { className?: string }) => (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 ${className}`}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Logo />

        {/* desktop */}
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-700"
          >
            <Sparkles className="h-4 w-4" />
            Start Learning
          </Link>
        </div>

        {/* mobile controls */}
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 hover:bg-slate-100"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* mobile menu */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-base font-semibold ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to="/learn"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-base font-semibold text-white"
            >
              <Sparkles className="h-4 w-4" />
              Start Learning
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
