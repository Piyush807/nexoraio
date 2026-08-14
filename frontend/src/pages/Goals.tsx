import { useEffect, useState } from 'react'
import { goalsApi } from '../api/goals'
import type { GoalResponse, CreateGoalRequest } from '../types/goal'
import { GoalCard } from '../components/goals/GoalCard'
import { GoalForm } from '../components/goals/GoalForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { LoadingState, Skeleton } from '../components/ui/LoadingState'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { useToast } from '../components/ui/Toast'
import { ApiError } from '../types/common'

export default function Goals() {
  const [goals, setGoals] = useState<GoalResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
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

  const handleCreate = async (payload: CreateGoalRequest) => {
    const goal = await goalsApi.create(payload)
    setGoals((prev) => (prev ? [goal, ...prev] : [goal]))
    setModalOpen(false)
    push('Goal created.', 'success')
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink-100">Goals</h1>
          <p className="mt-1 text-sm text-ink-500">Everything Nexora's roadmap and AI build on.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ New goal</Button>
      </div>

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
          <EmptyState
            title="No goals yet"
            description="Create your first goal to unlock a personalized roadmap."
            action={<Button onClick={() => setModalOpen(true)}>Create a goal</Button>}
          />
        )}

        {!error && goals && goals.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create a goal">
        <GoalForm onSubmit={handleCreate} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
