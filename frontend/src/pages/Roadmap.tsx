import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { roadmapApi } from '../api/roadmap'
import { goalsApi } from '../api/goals'
import type { RoadmapResponse } from '../types/roadmap'
import type { GoalResponse } from '../types/goal'
import { RoadmapTimeline } from '../components/roadmap/RoadmapTimeline'
import { RoadmapGenerating } from '../components/roadmap/RoadmapGenerating'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useToast } from '../components/ui/Toast'
import { ApiError } from '../types/common'
import { formatDate } from '../utils/formatDate'
import { progressApi } from '../api/progress'
import type { ProgressTaskResponse } from '../types/progress'
import { TaskChecklist } from '../components/progress/TaskChecklist'

type ViewState = 'loading' | 'empty' | 'generating' | 'ready' | 'error'

export default function Roadmap() {
  const { goalId } = useParams<{ goalId: string }>()
  const { push } = useToast()

  const [goal, setGoal] = useState<GoalResponse | null>(null)
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null)
  const [state, setState] = useState<ViewState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [completedTasks, setCompletedTasks] = useState<ProgressTaskResponse[]>([])
  const [regenerateConfirmOpen, setRegenerateConfirmOpen] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  const load = async () => {
    if (!goalId) return
    setState('loading')
    try {
      const g = await goalsApi.getById(goalId)
      setGoal(g)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load this goal.')
      setState('error')
      return
    }
    try {
      const r = await roadmapApi.getByGoalId(goalId)
      setRoadmap(r)
      progressApi.completedTasks(goalId).then(setCompletedTasks).catch(() => setCompletedTasks([]))
      setState('ready')
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setState('empty')
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not load the roadmap.')
        setState('error')
      }
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalId])

  const handleToggleMilestone = async (milestoneId: string, completed: boolean) => {
    if (!goalId) return
    try {
      const updated = await roadmapApi.setMilestoneCompletion(goalId, milestoneId, completed)
      setRoadmap((prev) =>
        prev
          ? { ...prev, milestones: prev.milestones.map((m) => (m.id === updated.id ? updated : m)) }
          : prev,
      )
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not update that milestone. Try again.', 'error')
    }
  }

  const handleCompleteTask = async (payload: { milestoneTitle: string; taskTitle: string }) => {
    if (!goalId) return
    const task = await progressApi.completeTask(goalId, payload)
    setCompletedTasks((prev) => [task, ...prev.filter((item) => item.id !== task.id)])
    const refreshed = await roadmapApi.getByGoalId(goalId)
    setRoadmap(refreshed)
    push('Task completed. Your path has been updated.', 'success')
  }

  const handleGenerate = async () => {
    if (!goalId) return
    setState('generating')
    try {
      const r = await roadmapApi.generate(goalId)
      setRoadmap(r)
      setTimeout(() => setState('ready'), 900)
      push('Roadmap generated.', 'success')
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not generate a roadmap right now.', 'error')
      setState(roadmap ? 'ready' : 'empty')
    }
  }

  const handleRegenerate = async () => {
    if (!goalId || !roadmap || regenerating) return
    const previous = roadmap
    setRegenerating(true)
    setState('generating')
    try {
      const r = await roadmapApi.regenerate(goalId)
      setRoadmap(r)
      setState('ready')
      push('Roadmap regenerated.', 'success')
      setRegenerateConfirmOpen(false)
    } catch (err) {
      setRoadmap(previous)
      setState('ready')
      push(err instanceof ApiError ? err.message : 'Could not regenerate the roadmap right now. Your current roadmap is unchanged.', 'error')
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="nexora-page nexora-page-roadmap">
      <Link to={goalId ? `/goals/${goalId}` : '/goals'} className="text-sm text-ink-500 hover:text-ink-100">
        ← {goal ? goal.title : 'Back to goal'}
      </Link>

      <div className="mt-4 overflow-hidden rounded-3xl border border-base-700 bg-gradient-to-br from-cyan-300/[.05] via-base-900/70 to-amber-300/[.04] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink-100">
            {roadmap ? roadmap.title : 'Roadmap'}
          </h1>
          {roadmap && (
            <p className="mt-1 text-sm text-ink-500">
              Generated {formatDate(roadmap.generatedAt)} {roadmap.description ? `· ${roadmap.description}` : ''}
            </p>
          )}
        </div>
        {state === 'ready' && (
          <Button variant="secondary" size="sm" onClick={() => setRegenerateConfirmOpen(true)} disabled={regenerating}>
            Regenerate
          </Button>
        )}
      </div>
      <div className="mt-5 flex flex-wrap gap-2 text-xs text-ink-600"><span className="rounded-full border border-cyan-300/15 bg-cyan-300/[.05] px-3 py-1.5">Path</span><span>Milestones → tasks → progress</span></div>
      </div>

      <ConfirmDialog
        open={regenerateConfirmOpen}
        title="Regenerate this roadmap?"
        message="Your current roadmap will be replaced by a new generated path. Your completed progress records stay intact."
        confirmLabel="Regenerate roadmap"
        loading={regenerating}
        onCancel={() => !regenerating && setRegenerateConfirmOpen(false)}
        onConfirm={() => void handleRegenerate()}
      />

      <div className="mt-8">
        {state === 'loading' && <LoadingState label="Loading roadmap…" />}

        {state === 'error' && <ErrorState message={error ?? undefined} onRetry={load} />}

        {state === 'empty' && (
          <EmptyState
            title="No roadmap yet"
            description="Generate a personalized roadmap for this goal — AI will map out milestones and the skills behind them."
            action={<Button onClick={handleGenerate}>Generate roadmap</Button>}
          />
        )}

        {state === 'generating' && <RoadmapGenerating />}

        {state === 'ready' && roadmap && (
          <RoadmapTimeline roadmap={roadmap} completedTasks={completedTasks} onCompleteTask={handleCompleteTask} onToggleMilestone={handleToggleMilestone} />
        )}
      </div>
    </div>
  )
}
