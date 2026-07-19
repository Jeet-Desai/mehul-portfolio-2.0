import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, LogIn, LogOut, ShieldCheck, Search } from 'lucide-react'
import { navLinks } from '../data/site'
import { useAuth } from '../lib/auth'
import { useIsAdmin } from '../lib/admin'
import Logo from './Logo'
import ExamChip from './ExamChip'
import CommandPalette from './CommandPalette'

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

/** Square bordered control — the Ledger nav button (theme toggle, auth, menu). */
const iconBtn =
  'grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-[10px] border border-slate-200 bg-white text-slate-800 transition hover:border-brand-600 hover:text-brand-600'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { dark, toggle } = useDarkMode()
  const { enabled, user, signOut } = useAuth()
  const isAdmin = useIsAdmin()
  const navigate = useNavigate()

  /** Sign out from Home, NOT from wherever we're standing. If we sign out while
      on a protected page, RequireAuth bounces to /login remembering THAT page —
      and the next account to log in (maybe a different person on a shared
      device) gets returned to the previous account's page, e.g. a classroom
      they aren't a member of. Navigate home first so no guard ever fires. */
  const handleSignOut = () => {
    try {
      localStorage.removeItem('as:next') // stale OAuth hand-off must not leak to the next account
    } catch {
      /* private mode */
    }
    navigate('/')
    signOut()
  }

  // Ctrl/⌘+K opens the command palette from anywhere on the site.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  )

  /** Login / logout — only when auth is switched on. Always visible so you can sign out. */
  const AuthControl = () => {
    if (!enabled) return null
    if (user)
      return (
        <button onClick={handleSignOut} className={iconBtn} aria-label="Sign out" title={user.email ? `Sign out (${user.email})` : 'Sign out'}>
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      )
    return (
      <Link to="/login" className={iconBtn} aria-label="Log in" title="Log in">
        <LogIn className="h-[18px] w-[18px]" />
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-slate-50/85 backdrop-blur-md">
      <nav className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Logo />

        {/* desktop links — only when there is room (xl+). Active = accent + underline. */}
        <div className="hidden items-center gap-0.5 xl:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap border-b-2 px-2.5 py-2 text-[13px] transition ${
                  isActive
                    ? 'border-brand-600 font-bold text-brand-600'
                    : 'border-transparent font-semibold text-slate-600 hover:text-slate-900'
                }`
              }
            >
              {l.short ?? l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `inline-flex items-center gap-1 whitespace-nowrap border-b-2 px-3 py-2 text-[13px] transition ${
                  isActive
                    ? 'border-brand-600 font-bold text-brand-600'
                    : 'border-transparent font-semibold text-slate-600 hover:text-slate-900'
                }`
              }
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </NavLink>
          )}
        </div>

        {/* right controls — evenly aligned, consistent sizing, always visible */}
        <div className="flex items-center gap-2">
          <ExamChip />
          <button
            onClick={() => setPaletteOpen(true)}
            className={iconBtn}
            aria-label="Search the site"
            title="Search (Ctrl+K)"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <ThemeToggle />
          <AuthControl />
          {/* CTA only while the link row is collapsed — at xl+ the Learn link is right there */}
          <Link to="/learn" className="btn-accent hidden h-10 shrink-0 whitespace-nowrap px-4 text-[13px] sm:inline-flex xl:hidden">
            <span className="hidden md:inline">Start Learning</span>
            <span className="md:hidden">Learn</span>
          </Link>
          <button className={`${iconBtn} xl:hidden`} onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* slide-down vertical menu — shown below xl (where the links don't fit).
          Scrolls internally if taller than the viewport; background is scroll-locked. */}
      {open && (
        <div className="max-h-[calc(100dvh-4.25rem)] overflow-y-auto border-t border-slate-200 bg-slate-50 px-4 py-3 xl:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-[10px] px-4 py-3 text-base font-semibold ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-[10px] px-4 py-3 text-base font-semibold ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <ShieldCheck className="h-5 w-5" /> Admin
              </NavLink>
            )}

            <div className="mt-2 border-t border-slate-200 pt-2">
              {enabled &&
                (user ? (
                  <button
                    onClick={() => {
                      handleSignOut()
                      setOpen(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-[10px] px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <LogOut className="h-5 w-5" /> Sign out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center gap-2 rounded-[10px] px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <LogIn className="h-5 w-5" /> Log in
                  </Link>
                ))}
              <Link to="/learn" onClick={() => setOpen(false)} className="btn-accent mt-1 flex px-5 py-3 text-[15px]">
                Start Learning
              </Link>
            </div>
          </div>
        </div>
      )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  )
}
