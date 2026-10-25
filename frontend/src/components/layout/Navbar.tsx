import { Link } from 'react-router-dom'
import { useState, type ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { resetOnboarding } from '../onboarding/OnboardingGuide'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/[.07] bg-[#05070c]/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-4 md:px-7">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="group flex items-center gap-2.5 rounded-xl" aria-label="Nexora home">
          <NexoraMark size={30} />
          <span className="font-display text-[17px] font-semibold tracking-[.12em] text-white uppercase [text-shadow:0_0_18px_rgba(165,243,252,.25)]">Nexora</span>
        </Link>

        {isAuthenticated ? (
          <div className="relative">
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-white/[.09] bg-white/[.035] py-1.5 pl-1.5 pr-2.5 text-sm text-ink-300 transition-colors hover:border-cyan-200/25 hover:bg-white/[.06] hover:text-ink-100"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-300/10 font-semibold text-xs text-cyan-200">
                {user?.email?.[0]?.toUpperCase() ?? '?'}
              </span>
              <span className="hidden max-w-[150px] truncate sm:inline">{user?.email}</span>
              <ChevronIcon open={menuOpen} />
            </button>
            {menuOpen && (
              <>
                <button type="button" aria-label="Close account menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setMenuOpen(false)} />
                <div role="menu" className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-base-600 bg-base-900 p-1.5 shadow-[0_24px_70px_-35px_rgba(0,0,0,.95)]">
                  <div className="px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-700">Signed in as</p>
                    <p className="mt-1 truncate text-xs text-ink-300">{user?.email}</p>
                  </div>
                  <div className="my-1 h-px bg-base-700" />
                  <MenuButton onClick={() => { resetOnboarding(); setMenuOpen(false); window.dispatchEvent(new Event('nexora:onboarding-reset')) }}>
                    Replay quick start
                  </MenuButton>
                  <Link role="menuitem" to="/settings" onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm text-ink-300 hover:bg-base-800 hover:text-ink-100">
                    Settings
                  </Link>
                  <MenuButton danger onClick={() => { setMenuOpen(false); logout() }}>Sign out</MenuButton>
                </div>
              </>
            )}
          </div>
        ) : (
          <nav className="flex items-center gap-1.5" aria-label="Account navigation">
            <Link to="/login" className="inline-flex min-h-10 items-center rounded-xl px-3.5 text-sm font-semibold text-ink-400 transition-colors hover:bg-base-800 hover:text-ink-100">Sign in</Link>
            <Link to="/register" className="inline-flex min-h-10 items-center rounded-xl border border-cyan-200/20 bg-cyan-300 px-4 text-sm font-bold text-slate-950 shadow-[0_10px_30px_-18px_rgba(34,211,238,.9)] transition-colors hover:bg-cyan-200">Get started</Link>
          </nav>
        )}
      </div>
    </header>
  )
}

function MenuButton({ children, onClick, danger=false }: { children: ReactNode; onClick: () => void; danger?: boolean }) {
  return <button type="button" role="menuitem" onClick={onClick} className={`block w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${danger ? 'text-rose-300 hover:bg-rose-300/[.07]' : 'text-ink-300 hover:bg-base-800 hover:text-ink-100'}`}>{children}</button>
}

function ChevronIcon({ open }: { open: boolean }) { return <svg aria-hidden="true" className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none"><path d="m7 9 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> }

export function NexoraMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#22D3EE" fillOpacity=".10" />
      <path d="M8.5 23V9h2.8l10.2 10.7V9H24v14h-2.6L11.4 12.2V23H8.5Z" fill="#67E8F9" />
      <circle cx="24" cy="8" r="2" fill="#34D399" />
    </svg>
  )
}
