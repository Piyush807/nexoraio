import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { NexoraMark } from '../components/layout/Navbar'
import { ApiError } from '../types/common'
import { useToast } from '../components/ui/Toast'

export default function Register() {
  const { register, isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const { push } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!isLoading && isAuthenticated) return <Navigate to="/dashboard" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await register({ email, password })
      push('Account created. Sign in to continue.', 'success')
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create your account. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="nexora-page nexora-page-auth min-h-screen bg-base-950 px-4 py-8 sm:px-6">
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
        <div className="hidden lg:block">
          <Link to="/" className="inline-flex items-center gap-2.5"><NexoraMark size={30} /><span className="font-display text-lg font-bold">Nexora</span></Link>
          <p className="mt-12 text-sm font-semibold uppercase tracking-[.18em] text-emerald-200/70">Start your journey</p>
          <h1 className="mt-3 max-w-md font-display text-4xl font-bold leading-tight text-ink-100">One goal is enough to begin.</h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-ink-500">Nexora starts simple. Tell it what you want, where you're starting, and how much time you have. The rest grows from there.</p>
          <div className="mt-8 rounded-2xl border border-base-700 bg-base-900/60 p-5 max-w-md">
            <p className="nexora-kicker text-amber-200/70">Your first session</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold"><span className="rounded-lg bg-cyan-300/10 px-2.5 py-1.5 text-cyan-200">Goal</span><span className="text-ink-700">→</span><span className="rounded-lg bg-emerald-300/10 px-2.5 py-1.5 text-emerald-200">Path</span><span className="text-ink-700">→</span><span className="rounded-lg bg-amber-300/10 px-2.5 py-1.5 text-amber-200">Action</span></div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-7 flex items-center justify-center gap-2.5 lg:hidden"><NexoraMark /><span className="font-display text-lg font-bold">Nexora</span></Link>
          <div className="nexora-auth-card p-7 sm:p-8">
            <p className="nexora-kicker text-emerald-200/70">Create account</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-ink-100">Let's build your first path.</h1>
            <p className="mt-2 text-sm text-ink-500">Create an account now. Your first step after signing in is defining a goal.</p>
            <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-4">
              <Input id="email" label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              <Input id="password" label="Password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
              <Input id="confirm" label="Confirm password" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" />
              {error && <p role="alert" className="rounded-xl border border-signal-rose/30 bg-signal-rose/10 px-3.5 py-3 text-xs leading-5 text-rose-200">{error}</p>}
              <Button type="submit" isLoading={submitting} className="mt-1 w-full">Create account <span aria-hidden="true">→</span></Button>
            </form>
          </div>
          <p className="mt-6 text-center text-sm text-ink-500">Already have an account? <Link to="/login" className="font-semibold text-cyan-200 hover:text-cyan-100">Sign in</Link></p>
        </div>
      </div>
    </div>
  )
}
