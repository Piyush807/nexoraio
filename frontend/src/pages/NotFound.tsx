import { Link } from 'react-router-dom'
import { NexoraMark } from '../components/layout/Navbar'

export default function NotFound() {
  return <div className="nexora-page nexora-page-not-found flex min-h-screen flex-col items-center justify-center bg-base-950 px-6 text-center">
    <NexoraMark size={36} />
    <p className="mt-8 font-mono text-xs font-semibold uppercase tracking-[.2em] text-rose-300/80">404 · off the path</p>
    <h1 className="mt-3 max-w-lg font-display text-4xl font-bold tracking-tight text-ink-100">We couldn't find this part of Nexora.</h1>
    <p className="mt-4 max-w-md text-sm leading-6 text-ink-500">The page may have moved, or the link may no longer be part of your journey.</p>
    <div className="mt-7 flex flex-wrap justify-center gap-2">
      <Link to="/dashboard" className="inline-flex min-h-11 items-center rounded-xl bg-cyan-300 px-4 text-sm font-bold text-slate-950 hover:bg-cyan-200">Go to Today</Link>
      <Link to="/goals" className="inline-flex min-h-11 items-center rounded-xl border border-base-600 bg-base-900/70 px-4 text-sm font-semibold text-ink-200 hover:border-cyan-300/25 hover:bg-base-800">View goals</Link>
    </div>
  </div>
}
