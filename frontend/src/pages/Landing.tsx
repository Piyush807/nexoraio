import { Link, Navigate } from 'react-router-dom'
import { NexoraMark } from '../components/layout/Navbar'
import { useAuth } from '../hooks/useAuth'
import { AuroraField } from '../components/landing/AuroraField'

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth()
  if (!isLoading && isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="nexora-page nexora-page-landing min-h-screen bg-base-950">
      <header className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5"><NexoraMark size={30} /><span className="font-display text-lg font-bold">Nexora</span></Link>
        <nav className="flex items-center gap-1.5" aria-label="Account navigation">
          <Link to="/login" className="inline-flex min-h-10 items-center rounded-xl px-3.5 text-sm font-semibold text-ink-400 hover:bg-base-800 hover:text-ink-100">Sign in</Link>
          <Link to="/register" className="inline-flex min-h-10 items-center rounded-xl bg-cyan-300 px-4 text-sm font-bold text-slate-950 hover:bg-cyan-200">Get started</Link>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden border-t border-base-700/50">
          <AuroraField />
          <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
          <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.05fr_.95fr] lg:py-28">
            <div className="relative z-10 animate-fadeUp">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[.06] px-3 py-1.5 text-[11px] font-semibold text-cyan-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulseSoft" aria-hidden="true" />
                A personal growth operating system
              </span>
              <h1 className="mt-6 max-w-3xl animate-fadeUp font-display text-4xl font-bold leading-[1.05] tracking-[-.05em] text-ink-100 [animation-delay:80ms] sm:text-5xl lg:text-[4.25rem]">
                Stop collecting plans.<br /><span className="text-cyan-200">Start becoming.</span>
              </h1>
              <p className="mt-6 max-w-xl animate-fadeUp text-base leading-7 text-slate-400 [animation-delay:160ms] sm:text-lg">
                Nexora takes what you want to achieve, turns it into a realistic path, helps you act today, and learns from the progress you actually make.
              </p>
              <div className="mt-8 flex animate-fadeUp flex-wrap gap-3 [animation-delay:240ms]">
                <Link to="/register" className="inline-flex min-h-12 items-center rounded-xl bg-cyan-300 px-5 text-sm font-bold text-slate-950 shadow-[0_18px_42px_-24px_rgba(34,211,238,.95)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-cyan-200">Create your first goal <span className="ml-2">→</span></Link>
                <Link to="/login" className="inline-flex min-h-12 items-center rounded-xl border border-base-600 bg-base-900/70 px-5 text-sm font-semibold text-ink-200 transition-colors hover:border-cyan-300/25 hover:bg-base-800">I already have an account</Link>
              </div>
              <div className="mt-10 flex animate-fadeUp flex-wrap gap-x-6 gap-y-2 text-xs text-ink-700 [animation-delay:320ms]">
                <span>Goal-aware coaching</span><span>•</span><span>Progress memory</span><span>•</span><span>Adaptive paths</span>
              </div>
            </div>
            <JourneyPreview />
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 md:py-20">
          <div className="max-w-2xl"><p className="nexora-kicker text-cyan-200/80">The product loop</p><h2 className="mt-2 font-display text-3xl font-bold text-ink-100 sm:text-4xl">One system instead of five disconnected tools.</h2><p className="mt-4 text-sm leading-6 text-ink-500">Every part of Nexora feeds the next, so the interface always has a reason to ask you to do something.</p></div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-base-700 bg-base-700 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => <div key={f.title} className="group bg-base-950 p-6 transition-colors hover:bg-base-900">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${f.tone}`}>{String(i + 1).padStart(2, '0')}</div>
              <h3 className="mt-6 font-display text-lg font-semibold text-ink-100">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-500">{f.body}</p>
              <div className="mt-6 text-xs font-semibold text-ink-700 group-hover:text-ink-400">{f.micro}</div>
            </div>)}
          </div>
        </section>

        <section className="border-y border-base-700/70 bg-base-900/30">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-16 sm:px-6 md:grid-cols-[.75fr_1.25fr] md:py-20">
            <div><p className="nexora-kicker text-amber-200/80">Designed around action</p><h2 className="mt-2 font-display text-3xl font-bold text-ink-100">Open Nexora and know what matters now.</h2></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <MiniFeature title="Today" body="Daily intelligence surfaces the next useful move instead of making you scan everything." tone="cyan" />
              <MiniFeature title="Your path" body="Roadmaps break ambition into milestones and tasks you can actually execute." tone="mint" />
              <MiniFeature title="Your coach" body="Conversations stay connected to the goal, roadmap, progress and memory." tone="rose" />
              <MiniFeature title="Your journey" body="See rhythm, completed work and reflection signals over time." tone="amber" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-4 py-20 text-center sm:px-6">
          <p className="nexora-kicker text-emerald-200/80">Start small</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-bold text-ink-100 sm:text-4xl">Give Nexora one goal. Let the system grow from there.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-ink-500">No long setup. Define the outcome, choose where you're starting, and let the first path take shape.</p>
          <Link to="/register" className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-emerald-300 px-5 text-sm font-bold text-slate-950 hover:bg-emerald-200">Build my path <span className="ml-2">→</span></Link>
        </section>
      </main>

      <footer className="border-t border-base-700/70 px-4 py-8 sm:px-6"><div className="mx-auto flex max-w-[1240px] flex-col gap-2 text-xs text-ink-700 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Nexora</span><span>From a goal to a path. From a path to progress. From progress to growth.</span></div></footer>
    </div>
  )
}

const features = [
  { title:'Goal', body:'Define the outcome in plain language, with your current level, time and target date.', micro:'Start with where you are.', tone:'bg-cyan-300/10 text-cyan-200' },
  { title:'Path', body:'Turn the outcome into milestones, skills and tasks with a roadmap you can review.', micro:'See the whole route.', tone:'bg-emerald-300/10 text-emerald-200' },
  { title:'Action', body:'Surface the next meaningful task so progress feels concrete instead of overwhelming.', micro:'Know what to do next.', tone:'bg-amber-300/10 text-amber-200' },
  { title:'Growth', body:'Use progress, reflection and coaching context to keep the path relevant as you change.', micro:'Let the system learn.', tone:'bg-rose-300/10 text-rose-200' },
]

function MiniFeature({ title, body, tone }: { title:string; body:string; tone:'cyan'|'mint'|'rose'|'amber' }) {
  const colors={cyan:'border-cyan-300/15 bg-cyan-300/[.04]',mint:'border-emerald-300/15 bg-emerald-300/[.04]',rose:'border-rose-300/15 bg-rose-300/[.04]',amber:'border-amber-300/15 bg-amber-300/[.04]'}
  return <div className={`rounded-2xl border p-5 ${colors[tone]}`}><h3 className="font-display font-semibold text-ink-100">{title}</h3><p className="mt-2 text-sm leading-6 text-ink-500">{body}</p></div>
}

function JourneyPreview(){
  return <div className="relative mx-auto w-full max-w-[520px] animate-fadeUp [animation-delay:200ms] lg:pl-6" aria-label="Preview of the Nexora growth loop">
    <div className="absolute -inset-6 rounded-[40px] bg-cyan-300/[.035] blur-2xl" />
    <div className="group relative overflow-hidden rounded-[28px] border border-base-600 bg-[#0d1319] p-5 shadow-[0_35px_100px_-55px_rgba(34,211,238,.55)] transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between border-b border-base-700 pb-4"><div><p className="nexora-kicker text-cyan-200/70">TODAY</p><p className="mt-1 text-sm font-semibold text-ink-100">What moves the goal forward?</p></div><span className="rounded-full bg-emerald-300/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">ON TRACK</span></div>
      <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/[.045] p-5"><p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-200/70">NEXT BEST ACTION</p><p className="mt-2 text-lg font-semibold leading-7 text-ink-100">Finish the Spring Boot validation task.</p><p className="mt-2 text-xs leading-5 text-ink-500">It closes the current milestone and unlocks the next backend task.</p><div className="mt-4 flex gap-2"><span className="h-1.5 flex-1 rounded-full bg-cyan-300"/><span className="h-1.5 flex-1 rounded-full bg-cyan-300/40"/><span className="h-1.5 flex-1 rounded-full bg-base-700"/><span className="h-1.5 flex-1 rounded-full bg-base-700"/></div></div>
      <div className="mt-4 grid grid-cols-3 gap-2"><Stat label="Tasks" value="12/18"/><Stat label="Rhythm" value="4 days"/><Stat label="Focus" value="Backend"/></div>
      <div className="mt-4 rounded-2xl border border-base-700 bg-base-950/60 p-4"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-ink-200">Your coach</p><span className="text-[10px] text-ink-700">goal-aware</span></div><p className="mt-2 text-sm leading-6 text-ink-400">“Keep today's task small. You are one step away from closing this milestone.”</p></div>
    </div>
  </div>
}
function Stat({label,value}:{label:string;value:string}){return <div className="rounded-xl border border-base-700 bg-base-950/60 p-3"><p className="text-[10px] uppercase tracking-wider text-ink-700">{label}</p><p className="mt-1 text-sm font-semibold text-ink-100">{value}</p></div>}
