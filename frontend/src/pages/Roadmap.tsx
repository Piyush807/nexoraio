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
import { useToast } from '../components/ui/Toast'
import { ApiError } from '../types/common'
import { formatDate } from '../utils/formatDate'

type ViewState = 'loading' | 'empty' | 'generating' | 'ready' | 'error'

export default function Roadmap() {
  const { goalId } = useParams<{ goalId: string }>()
  const { push } = useToast()

  const [goal, setGoal] = useState<GoalResponse | null>(null)
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null)
  const [state, setState] = useState<ViewState>('loading')
  const [error, setError] = useState<string | null>(null)

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

  const handleGenerate = async () => {
    if (!goalId) return
    setState('generating')
    try {
      const r = await roadmapApi.generate(goalId)
      setRoadmap(r)
      // Let the generation animation land instead of snapping instantly.
      setTimeout(() => setState('ready'), 900)
      push('Roadmap generated.', 'success')
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not generate a roadmap right now.', 'error')
      setState('empty')
    }
  }

  return (
    <div>
      <Link to={goalId ? `/goals/${goalId}` : '/goals'} className="text-sm text-ink-500 hover:text-ink-100">
        ← {goal ? goal.title : 'Back to goal'}
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
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
          <Button variant="secondary" size="sm" onClick={handleGenerate}>
            Regenerate
          </Button>
        )}
      </div>

      <div className="mt-8">
        {state === 'loading' && <LoadingState label="Loading roadmap…" />}

        {state === 'error' && <ErrorState message={error ?? undefined} onRetry={load} />}

        {state === 'empty' && (
          <EmptyState
            title="No roadmap yet"
            description="Generate a personalized roadmap for this goal — Gemini will map out milestones and the skills behind them."
            action={<Button onClick={handleGenerate}>Generate roadmap</Button>}
          />
        )}

        {state === 'generating' && <RoadmapGenerating />}

        {state === 'ready' && roadmap && <RoadmapTimeline roadmap={roadmap} />}
      </div>
    </div>
  )
}
