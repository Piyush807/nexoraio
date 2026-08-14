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
      await login({ email, password })
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-950 px-4">
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
      <div className="relative w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <NexoraMark />
          <span className="font-display text-lg font-semibold text-ink-100">Nexora</span>
        </Link>

        <div className="rounded-xl border border-base-700 bg-base-900/70 p-7 shadow-glow">
          <h1 className="font-display text-xl text-ink-100">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to continue your roadmap.</p>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {error && (
              <p role="alert" className="rounded-md border border-signal-rose/30 bg-signal-rose/10 px-3 py-2 text-xs text-signal-rose">
                {error}
              </p>
            )}
            <Button type="submit" isLoading={submitting} className="mt-1 w-full">
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-signal-violetSoft hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
