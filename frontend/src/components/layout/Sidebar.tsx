import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: GridIcon },
  { to: '/goals', label: 'Goals', icon: TargetIcon },
  { to: '/conversations', label: 'AI Chat', icon: ChatIcon },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col gap-1 border-r border-base-700 bg-base-950/60 px-3 py-6">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-signal-violet/10 text-ink-100 border border-signal-violet/30'
                : 'text-ink-500 border border-transparent hover:text-ink-100 hover:bg-base-800',
            )
          }
        >
          <Icon />
          {label}
        </NavLink>
      ))}
    </aside>
  )
}

function GridIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
function TargetIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}
function ChatIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 11.5a7.5 7.5 0 01-11.4 6.4L4 19l1.1-4.2A7.5 7.5 0 1121 11.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}
