import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute } from './routes/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Goals from './pages/Goals'
import GoalDetail from './pages/GoalDetail'
import Roadmap from './pages/Roadmap'
import Conversations from './pages/Conversations'
import Settings from './pages/Settings'
import Journey from './pages/Journey'
import NotFound from './pages/NotFound'
class RouteErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Nexora page failed to render.', error, info)
  }

  componentDidUpdate(previousProps: { children: ReactNode; resetKey: string }) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <main className="flex min-h-screen items-center justify-center bg-base-950 p-6 text-ink-100">
        <section className="w-full max-w-lg rounded-3xl border border-base-700 bg-base-900 p-7 shadow-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-amber-200">Page unavailable</p>
          <h1 className="mt-2 font-display text-2xl">This page could not load.</h1>
          <p className="mt-3 text-sm leading-6 text-ink-400">Your navigation is still available. Try the page again or return to your goals.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => this.setState({ error: null })} className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950">Try again</button>
            <Link to="/goals" className="rounded-xl border border-base-600 px-4 py-2.5 text-sm font-semibold text-ink-200">Open goals</Link>
          </div>
        </section>
      </main>
    )
  }
}

export default function App() {
  const location = useLocation()

  return (
    <RouteErrorBoundary resetKey={location.pathname}>
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<ProtectedRoute><AppShell><Dashboard /></AppShell></ProtectedRoute>} />
      <Route path="/goals" element={<ProtectedRoute><AppShell><Goals /></AppShell></ProtectedRoute>} />
      <Route path="/journey" element={<ProtectedRoute><AppShell><Journey /></AppShell></ProtectedRoute>} />
      <Route path="/goals/:goalId" element={<ProtectedRoute><AppShell><GoalDetail /></AppShell></ProtectedRoute>} />
      <Route path="/goals/:goalId/roadmap" element={<ProtectedRoute><AppShell><Roadmap /></AppShell></ProtectedRoute>} />
      <Route path="/conversations" element={<ProtectedRoute><AppShell><Conversations /></AppShell></ProtectedRoute>} />
      <Route path="/conversations/:conversationId" element={<ProtectedRoute><AppShell><Conversations /></AppShell></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppShell><Settings /></AppShell></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
    </RouteErrorBoundary>
  )
}
