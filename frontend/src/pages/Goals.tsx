import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { goalsApi } from '../api/goals'
import type { GoalResponse, CreateGoalRequest } from '../types/goal'
import { GoalCard } from '../components/goals/GoalCard'
import { GoalForm } from '../components/goals/GoalForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/LoadingState'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { useToast } from '../components/ui/Toast'
import { ApiError } from '../types/common'
import { useAuth } from '../hooks/useAuth'

export default function Goals() {
  const [goals, setGoals] = useState<GoalResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'>('ALL')
  const navigate = useNavigate()
  const location = useLocation() as { state?: { firstGoal?: boolean } }
  const { refreshGoalState } = useAuth()
  const { push } = useToast()

  const load = async () => {
    setError(null)
    try {
      const data = await goalsApi.list()
      setGoals(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your goals.')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredGoals = useMemo(() => {
    if (!goals) return []
    const query = search.trim().toLowerCase()
    return goals.filter((goal) => {
      const matchesStatus = statusFilter === 'ALL' || goal.status === statusFilter
      const matchesQuery = !query || `${goal.title} ${goal.description ?? ''}`.toLowerCase().includes(query)
      return matchesStatus && matchesQuery
    })
  }, [goals, search, statusFilter])

  const handleCreate = async (payload: CreateGoalRequest) => {
    const goal = await goalsApi.create(payload)
    setGoals((prev) => (prev ? [goal, ...prev] : [goal]))
    setModalOpen(false)
    await refreshGoalState()
    push('Goal created. Let’s build your path.', 'success')
    navigate(`/goals/${goal.id}`, { state: { newGoal: true } })
  }

  return (
    <div className="nexora-page nexora-page-goals">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink-100">{location.state?.firstGoal ? 'Let’s set up Nexora' : 'Goals'}</h1>
          <p className="mt-1 text-sm text-ink-500">Everything Nexora's roadmap and AI build on.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ New goal</Button>
      </div>

      {goals && goals.length > 0 && (
        <div className="nexora-goal-filters mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="max-w-md flex-1"><Input id="goal-search" label="Find a goal" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or description…" /></div>
          <div className="flex max-w-full gap-1.5 overflow-x-auto pb-1 no-scrollbar" aria-label="Filter goals by status">
            {(['ALL', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
              <button key={status} type="button" onClick={() => setStatusFilter(status)} aria-pressed={statusFilter === status} className={`min-h-10 shrink-0 rounded-xl border px-3 text-xs font-semibold transition ${statusFilter === status ? 'border-cyan-300/25 bg-cyan-300/[.08] text-cyan-100' : 'border-base-700 bg-base-900/45 text-ink-600 hover:border-base-500 hover:text-ink-200'}`}>
                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        {error && <ErrorState message={error} onRetry={load} />}

        {!error && goals === null && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        )}

        {!error && goals?.length === 0 && (
          <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
            <div className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[.10] via-base-900/90 to-emerald-300/[.06] p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-cyan-200"><span className="h-2 w-2 rounded-full bg-cyan-300" /> Step 1 of 3</div>
                <h2 className="mt-5 max-w-lg font-display text-3xl font-semibold leading-tight text-ink-100 sm:text-4xl">Start with one outcome you genuinely want.</h2>
                <p className="mt-4 max-w-xl text-sm leading-6 text-ink-400">Tell Nexora where you want to go. It will turn that outcome into a roadmap, help you decide what matters today, and keep adapting as you make progress.</p>
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <SetupStep tone="cyan" number="01" title="Goal" body="Define the outcome." />
                  <SetupStep tone="emerald" number="02" title="Path" body="Build your roadmap." />
                  <SetupStep tone="amber" number="03" title="Action" body="Know what to do next." />
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-base-700 bg-base-900/80 p-5 sm:p-7">
              <div className="mb-5"><p className="font-display text-xl font-semibold text-ink-100">Create your first goal</p><p className="mt-1 text-sm text-ink-500">You can change any of this later.</p></div>
              <GoalForm onSubmit={handleCreate} onCancel={() => undefined} showCancel={false} />
            </div>
          </div>
        )}

        {!error && goals && goals.length > 0 && filteredGoals.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGoals.map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </div>
        )}
        {!error && goals && goals.length > 0 && filteredGoals.length === 0 && (
          <EmptyState title="Nothing matches this view" description="Try another search or status filter." action={<Button variant="secondary" onClick={() => { setSearch(''); setStatusFilter('ALL') }}>Reset filters</Button>} />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create a goal">
        <GoalForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}

function SetupStep({ number, title, body, tone }: { number: string; title: string; body: string; tone: 'cyan' | 'emerald' | 'amber' }) {
  const tones = { cyan: 'border-cyan-300/15 bg-cyan-300/[.06] text-cyan-200', emerald: 'border-emerald-300/15 bg-emerald-300/[.06] text-emerald-200', amber: 'border-amber-300/15 bg-amber-300/[.06] text-amber-200' }
  return <div className={`rounded-2xl border p-3 ${tones[tone]}`}><span className="font-mono text-[10px] opacity-70">{number}</span><p className="mt-2 text-sm font-semibold text-ink-100">{title}</p><p className="mt-1 text-xs text-ink-600">{body}</p></div>
}
