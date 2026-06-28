import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, Sparkles, Sun, Moon, LogIn, LogOut } from 'lucide-react'
import { navLinks } from '../data/site'
import { useAuth } from '../lib/auth'
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

/** Shared sizing so every top-bar control lines up at exactly h-10. */
const iconBtn =
  'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { dark, toggle } = useDarkMode()
  const { enabled, user, signOut } = useAuth()

  // Lock background page scroll while the mobile menu is open. The scroll
  // container is the <html> element, so lock both it and <body> to be safe.
  useEffect(() => {
    if (!open) return
    const docEl = document.documentElement
    const prevHtml = docEl.style.overflow
    const prevBody = document.body.style.overflow
    docEl.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      docEl.style.overflow = prevHtml
      document.body.style.overflow = prevBody
    }
  }, [open])

  const ThemeToggle = () => (
    <button onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} className={iconBtn}>
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )

  /** Login / logout — only when auth is switched on. Always visible so you can sign out. */
  const AuthControl = () => {
    if (!enabled) return null
    if (user)
      return (
        <button onClick={() => signOut()} className={iconBtn} aria-label="Sign out" title={user.email ? `Sign out (${user.email})` : 'Sign out'}>
          <LogOut className="h-5 w-5" />
        </button>
      )
    return (
      <Link to="/login" className={iconBtn} aria-label="Log in" title="Log in">
        <LogIn className="h-5 w-5" />
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Logo />

        {/* desktop links — only when there is room (xl+) */}
        <div className="hidden items-center gap-0.5 xl:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-2.5 py-2 text-sm font-semibold transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* right controls — evenly aligned, consistent sizing, always visible */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <AuthControl />
          <Link
            to="/learn"
            className="ml-1 hidden h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-brand-600 px-4 text-sm font-semibold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-700 sm:inline-flex"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden md:inline">Start Learning</span>
            <span className="md:hidden">Learn</span>
          </Link>
          <button className={`${iconBtn} xl:hidden`} onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* slide-down vertical menu — shown below xl (where the links don't fit).
          Scrolls internally if taller than the viewport; background is scroll-locked. */}
      {open && (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-slate-100 bg-white px-4 py-3 xl:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
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

            <div className="mt-2 border-t border-slate-100 pt-2">
              {enabled &&
                (user ? (
                  <button
                    onClick={() => {
                      signOut()
                      setOpen(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <LogOut className="h-5 w-5" /> Sign out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <LogIn className="h-5 w-5" /> Log in
                  </Link>
                ))}
              <Link
                to="/learn"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-base font-semibold text-white"
              >
                <Sparkles className="h-4 w-4" />
                Start Learning
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
