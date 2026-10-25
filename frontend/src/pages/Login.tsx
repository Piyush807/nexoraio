import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { NexoraMark } from '../components/layout/Navbar'
import { ApiError } from '../types/common'

export default function Login() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: string } }

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isLoading && isAuthenticated) return <Navigate to="/dashboard" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const hasGoalsAfterLogin = await login({ email, password })
      // Use the goal state returned by the login flow, not the pre-login
      // render's hasGoals value (which is stale while the request is running).
      // New accounts start with their first goal; returning users resume where
      // they came from or continue to the dashboard.
      const destination = hasGoalsAfterLogin ? (location.state?.from || '/dashboard') : '/goals'
      navigate(destination, { replace: true, state: hasGoalsAfterLogin ? undefined : { firstGoal: true } })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="nexora-page nexora-page-auth min-h-screen bg-base-950 px-4 py-8 sm:px-6">
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-10 lg:grid-cols-[.9fr_1.1fr]">
        <div className="hidden lg:block">
          <Link to="/" className="inline-flex items-center gap-2.5"><NexoraMark size={30} /><span className="font-display text-lg font-bold">Nexora</span></Link>
          <p className="mt-12 text-sm font-semibold uppercase tracking-[.18em] text-cyan-200/70">Welcome back</p>
          <h1 className="mt-3 max-w-md font-display text-4xl font-bold leading-tight text-ink-100">Pick up where your growth left off.</h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-ink-500">Your goals, roadmap, progress and coaching context stay connected, so you can get back to the next useful action quickly.</p>
          <div className="mt-8 grid max-w-md gap-3">
            {['Your current focus stays visible.','Your coach remembers the journey.','Your next action stays close.'].map((item,i)=><div key={item} className="flex items-center gap-3 text-sm text-ink-400"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-200">{i+1}</span>{item}</div>)}
          </div>
        </div>
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-7 flex items-center justify-center gap-2.5 lg:hidden"><NexoraMark /><span className="font-display text-lg font-bold">Nexora</span></Link>
          <div className="nexora-auth-card p-7 sm:p-8">
            <p className="nexora-kicker text-cyan-200/70">Sign in</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink-100">Welcome back</h1>
            <p className="mt-2 text-sm text-ink-500">Continue your path without starting over.</p>
            <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-4">
              <Input id="email" label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              <Input id="password" label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
              {error && <p role="alert" className="rounded-xl border border-signal-rose/30 bg-signal-rose/10 px-3.5 py-3 text-xs leading-5 text-rose-200">{error}</p>}
              <Button type="submit" isLoading={submitting} className="mt-1 w-full">Sign in <span aria-hidden="true">→</span></Button>
            </form>
          </div>
          <p className="mt-6 text-center text-sm text-ink-500">Don't have an account? <Link to="/register" className="font-semibold text-cyan-200 hover:text-cyan-100">Create one</Link></p>
        </div>
      </div>
    </div>
  )
}
