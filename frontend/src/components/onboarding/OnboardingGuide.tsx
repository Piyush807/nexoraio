import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'
import { useAuth } from '../../hooks/useAuth'

const STORAGE_KEY = 'nexora:onboarding:v2'
const steps = [
  { eyebrow:'01 · START', title:'Tell Nexora what you want to change.', body:'Create one meaningful goal. Add where you are now, your level and a target date. That gives Nexora enough context to build something useful.', action:'/goals', actionLabel:'Create a goal', tone:'amber' },
  { eyebrow:'02 · BUILD', title:'Let your goal become a path.', body:'Generate a roadmap of milestones and concrete tasks. Review it before you commit, then follow the path at your pace.', action:'/goals', actionLabel:'Explore goals', tone:'cyan' },
  { eyebrow:'03 · DO', title:'Open Nexora for the next move.', body:'Today surfaces the next useful action instead of making you scan your whole plan. Your goal page keeps the full checklist close.', action:'/dashboard', actionLabel:'See Today', tone:'mint' },
  { eyebrow:'04 · THINK', title:'Use the coach when you need help.', body:'Ask for a plan, an explanation, help getting unstuck, a restart, or a reflection. Goal-aware conversations keep the context close.', action:'/conversations', actionLabel:'Open coach', tone:'rose' },
  { eyebrow:'05 · GROW', title:'Come back and let the system learn.', body:'Progress, completed work and conversations feed your growth memory, daily intelligence and journey view. The loop gets more useful as you use it.', action:'/journey', actionLabel:'See the journey', tone:'cyan' },
]

export function OnboardingGuide() {
  const location = useLocation()
  const { hasGoals } = useAuth()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const closeRef = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (['/', '/login', '/register'].includes(location.pathname) || hasGoals === false) return
    const replay = () => { setStep(0); setOpen(true) }
    window.addEventListener('nexora:onboarding-reset', replay)
    try { if (localStorage.getItem(STORAGE_KEY) !== 'complete') setOpen(true) } catch { setOpen(true) }
    return () => window.removeEventListener('nexora:onboarding-reset', replay)
  }, [location.pathname, hasGoals])

  const finish = () => { try { localStorage.setItem(STORAGE_KEY, 'complete') } catch {}; setOpen(false) }

  useEffect(() => {
    if (!open) return
    previousFocus.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => closeRef.current?.focus())
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); finish() }
      if (e.key === 'ArrowRight') setStep((v) => Math.min(steps.length - 1, v + 1))
      if (e.key === 'ArrowLeft') setStep((v) => Math.max(0, v - 1))
    }
    window.addEventListener('keydown', key)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', key); previousFocus.current?.focus() }
  }, [open])

  if (!open) return null
  const current = steps[step]
  const tone = current.tone === 'amber' ? 'bg-amber-300/[.06] text-amber-200' : current.tone === 'mint' ? 'bg-emerald-300/[.06] text-emerald-200' : current.tone === 'rose' ? 'bg-rose-300/[.06] text-rose-200' : 'bg-cyan-300/[.06] text-cyan-200'

  return <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5">
    <div className="absolute inset-0 bg-base-950/90 backdrop-blur-md" aria-hidden="true" />
    <div role="dialog" aria-modal="true" aria-labelledby="onboarding-title" className="relative max-h-[min(720px,calc(100vh-24px))] w-full max-w-3xl overflow-hidden rounded-[28px] border border-base-600 bg-base-900 shadow-[0_35px_110px_-45px_rgba(34,211,238,.38)]">
      <div className="grid max-h-[inherit] sm:grid-cols-[210px_1fr]">
        <aside className={cn('hidden min-h-[520px] overflow-y-auto p-5 sm:flex sm:flex-col', tone)}>
          <div className="flex items-center justify-between"><span className="font-mono text-[10px] font-semibold tracking-widest text-ink-600">QUICK START</span><span className="text-[10px] text-ink-700">{step + 1}/{steps.length}</span></div>
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[.035] p-5"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[.05] font-display text-lg font-bold">{String(step + 1).padStart(2,'0')}</div><p className="mt-5 text-xs leading-5 text-ink-500">Nexora's loop is simple: define the outcome, follow the path, act, reflect, adapt.</p></div>
          <div className="mt-auto space-y-1.5">{steps.map((s,i)=><button key={s.eyebrow} type="button" aria-current={i===step ? 'step' : undefined} onClick={()=>setStep(i)} className={cn('w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-xs transition-colors',i===step?'bg-white/[.07] text-ink-100':'text-ink-600 hover:bg-white/[.035] hover:text-ink-300')}><span className="mr-2 font-mono text-[10px]">{String(i+1).padStart(2,'0')}</span>{s.title}</button>)}</div>
        </aside>
        <section className="flex min-h-[520px] flex-col p-6 sm:p-9">
          <div className="flex items-center justify-between gap-4"><span className="nexora-kicker text-cyan-200/75">{current.eyebrow}</span><button ref={closeRef} type="button" onClick={finish} className="nexora-icon-button" aria-label="Close quick start"><CloseIcon /></button></div>
          <div className="mt-10 sm:mt-14"><h2 id="onboarding-title" className="max-w-xl font-display text-3xl font-bold leading-tight text-ink-100 sm:text-4xl">{current.title}</h2><p className="mt-5 max-w-xl text-sm leading-7 text-ink-400">{current.body}</p></div>
          <div className="mt-8 rounded-2xl border border-base-700 bg-base-950/55 p-5"><p className="nexora-kicker text-ink-600">The simple loop</p><div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold"><span className="rounded-lg bg-cyan-300/10 px-2.5 py-1.5 text-cyan-200">Goal</span><span className="text-ink-700">→</span><span className="rounded-lg bg-emerald-300/10 px-2.5 py-1.5 text-emerald-200">Path</span><span className="text-ink-700">→</span><span className="rounded-lg bg-amber-300/10 px-2.5 py-1.5 text-amber-200">Action</span><span className="text-ink-700">→</span><span className="rounded-lg bg-rose-300/10 px-2.5 py-1.5 text-rose-200">Growth</span></div></div>
          <div className="mt-auto flex items-center justify-between gap-3 pt-8"><button type="button" disabled={step===0} onClick={()=>setStep(v=>v-1)} className="min-h-10 cursor-pointer rounded-xl px-3 text-sm font-semibold text-ink-500 hover:bg-base-800 hover:text-ink-100 disabled:invisible">Back</button><div className="flex items-center gap-2"><span className="hidden text-[11px] text-ink-700 sm:inline">Use ← → to move</span>{step<steps.length-1?<Button onClick={()=>setStep(v=>v+1)}>Next <span aria-hidden="true">→</span></Button>:<Link to={current.action} onClick={finish}><Button>{current.actionLabel} <span aria-hidden="true">→</span></Button></Link>}</div></div>
        </section>
      </div>
    </div>
  </div>
}

function CloseIcon(){return <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>}
export function resetOnboarding(){try{localStorage.removeItem(STORAGE_KEY)}catch{}}
