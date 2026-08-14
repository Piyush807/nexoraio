import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-base-700 bg-base-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-6">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
          <NexoraMark />
          <span className="font-display text-[17px] font-semibold tracking-tight text-ink-100">
            Nexora
          </span>
        </Link>

        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full border border-base-600 bg-base-900 py-1.5 pl-1.5 pr-3 text-sm text-ink-300 hover:border-signal-violet/50"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-signal-violet/20 font-mono text-xs text-signal-violetSoft">
                {user?.email?.[0]?.toUpperCase() ?? '?'}
              </span>
              <span className="hidden sm:inline max-w-[140px] truncate">{user?.email}</span>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-base-600 bg-base-900 shadow-glow">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      logout()
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm text-ink-300 hover:bg-base-800 hover:text-signal-rose"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <nav className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="px-3.5 py-2 text-sm text-ink-300 hover:text-ink-100"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="rounded-lg bg-signal-violet px-4 py-2 text-sm font-medium text-white shadow-glow hover:bg-signal-violetSoft"
            >
              Get started
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}

export function NexoraMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#6C5CE7" fillOpacity="0.15" />
      <path d="M9 23V9h2.6l10.4 10.6V9H24v14h-2.6L11 12.4V23H9z" fill="#8A7CF0" />
    </svg>
  )
}
