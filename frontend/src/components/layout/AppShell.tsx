import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { OnboardingGuide } from '../onboarding/OnboardingGuide'
import { NexoraAtmosphere } from './NexoraAtmosphere'

function toneForPath(pathname: string) {
  if (pathname.startsWith('/goals/')) return 'mint'
  if (pathname.startsWith('/goals')) return 'amber'
  if (pathname.startsWith('/journey')) return 'mint'
  if (pathname.startsWith('/conversations')) return 'rose'
  if (pathname.startsWith('/settings')) return 'amber'
  return 'cyan'
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <div className="nexora-app min-h-screen text-ink-100">
      <NexoraAtmosphere variant={toneForPath(pathname) as 'cyan' | 'mint' | 'amber' | 'rose'} />
      <Navbar />
      <div className="relative z-10 mx-auto flex max-w-[1440px]">
        <Sidebar />
        <main className="min-w-0 flex-1 px-4 py-6 pb-24 sm:px-6 md:px-9 md:py-10 md:pb-12"><div className="mx-auto mb-5 flex max-w-[1280px] items-center gap-2 text-[10px] font-semibold uppercase tracking-[.18em] text-cyan-100/35"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,.8)]" /> <span>Personal growth system</span><span className="text-white/10">/</span><span className="hidden sm:inline">Goal → Path → Action → Growth</span></div>{children}</main>
      </div>
      <MobileNav />
      <OnboardingGuide />
    </div>
  )
}
