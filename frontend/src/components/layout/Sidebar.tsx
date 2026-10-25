import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn'

const links = [
  { to: '/dashboard', label: 'Today', hint: 'What matters now', icon: GridIcon, tone: 'cyan' },
  { to: '/goals', label: 'Goals', hint: 'Your outcomes', icon: TargetIcon, tone: 'amber' },
  { to: '/journey', label: 'Journey', hint: 'Your rhythm & growth', icon: JourneyIcon, tone: 'mint' },
  { to: '/conversations', label: 'Coach', hint: 'Think with Nexora', icon: ChatIcon, tone: 'rose' },
]

const toneClasses = {
  cyan: 'bg-cyan-300/10 text-cyan-200 group-[.active]:bg-cyan-300/15',
  amber: 'bg-amber-300/10 text-amber-200',
  mint: 'bg-emerald-300/10 text-emerald-200',
  rose: 'bg-rose-300/10 text-rose-200',
}

export function Sidebar() {
  return (
    <aside className="sticky top-[68px] hidden h-[calc(100vh-68px)] w-[252px] shrink-0 border-r border-white/[.06] bg-[#05070c]/38 px-4 py-6 backdrop-blur-xl md:flex md:flex-col">
      <div className="mb-5 rounded-[22px] border border-cyan-200/10 bg-gradient-to-br from-cyan-200/[.08] via-white/[.025] to-transparent p-4 shadow-[0_24px_70px_-50px_rgba(34,211,238,.5)]">
        <div className="flex items-center justify-between">
          <p className="nexora-kicker text-cyan-200/80">Nexora OS</p>
          <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,.7)]" aria-hidden="true" />
        </div>
        <p className="mt-2 text-xs leading-5 text-ink-500">Your goal, next action, progress and coaching — connected.</p>
      </div>

      <nav className="flex flex-col gap-1.5" aria-label="Primary navigation">
        {links.map(({ to, label, hint, icon: Icon, tone }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'group relative flex min-h-[58px] items-center gap-3 rounded-[18px] border px-3 transition-all duration-200',
              isActive
                ? 'active border-cyan-300/20 bg-cyan-300/[.07] text-ink-100 shadow-[inset_3px_0_0_rgba(34,211,238,.8)]'
                : 'border-transparent text-ink-500 hover:border-white/[.09] hover:bg-white/[.035] hover:text-ink-100',
            )}
          >
            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', toneClasses[tone as keyof typeof toneClasses])}>
              <Icon />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{label}</span>
              <span className="mt-0.5 block truncate text-[11px] text-ink-700">{hint}</span>
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-base-700/80 bg-base-900/55 p-4">
        <p className="nexora-kicker text-amber-200/80">The loop</p>
        <p className="mt-2 text-xs leading-5 text-ink-500">Goal → Path → Action → Progress → Reflection → Growth</p>
      </div>
    </aside>
  )
}

function GridIcon(){return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.7"/><rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.7"/><rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.7"/><rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.7"/></svg>}
function TargetIcon(){return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>}
function JourneyIcon(){return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 17.5 9 12l3 3 7-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 7h3v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
function ChatIcon(){return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20.5 11.5a7.5 7.5 0 0 1-11.3 6.5L4 19.5l1.2-4A7.5 7.5 0 1 1 20.5 11.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>}
