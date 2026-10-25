import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'

const links = [
  { to: '/dashboard', label: 'Today', icon: GridIcon },
  { to: '/goals', label: 'Goals', icon: TargetIcon },
  { to: '/journey', label: 'Journey', icon: JourneyIcon },
  { to: '/conversations', label: 'Coach', icon: ChatIcon },
  { to: '/settings', label: 'Settings', icon: GearIcon },
]

export function MobileNav() {
  return (
    <nav aria-label="Primary navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[.07] bg-[#05070c]/88 px-2 pb-[max(.55rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => cn('flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-colors', isActive ? 'bg-cyan-200/[.10] text-cyan-100 shadow-[0_0_24px_-14px_rgba(34,211,238,.8)]' : 'text-ink-700 hover:bg-white/[.04] hover:text-ink-300')}>
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
function GridIcon(){return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/></svg>}
function TargetIcon(){return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>}
function JourneyIcon(){return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 17.5 9 12l3 3 7-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 7h3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
function ChatIcon(){return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20.5 11.5a7.5 7.5 0 0 1-11.3 6.5L4 19.5l1.2-4A7.5 7.5 0 1 1 20.5 11.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>}
function GearIcon(){return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" stroke="currentColor" strokeWidth="1.6"/><path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 1 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V4a1.7 1.7 0 1 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 1 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2.9Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}
