import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { progressApi } from '../../api/progress'
import { roadmapApi } from '../../api/roadmap'
import type { GoalResponse } from '../../types/goal'
import type { RoadmapResponse } from '../../types/roadmap'
import type { ProgressTaskResponse } from '../../types/progress'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/LoadingState'
import { Button } from '../ui/Button'

export function NextActionCard({ goal }: { goal: GoalResponse }) {
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null)
  const [tasks, setTasks] = useState<ProgressTaskResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([roadmapApi.getByGoalId(goal.id), progressApi.completedTasks(goal.id)])
      .then(([r, completed]) => {
        if (!cancelled) { setRoadmap(r); setTasks(completed) }
      })
      .catch(() => { if (!cancelled) { setRoadmap(null); setTasks([]) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [goal.id])

  const next = useMemo(() => {
    if (!roadmap) return null
    const done = new Set(tasks.map((task) => `${task.milestoneTitle}::${task.taskTitle}`))
    for (const milestone of roadmap.milestones) {
      if (milestone.completed) continue
      for (const task of milestone.tasks) {
        if (!done.has(`${milestone.title}::${task}`)) return { milestone: milestone.title, task }
      }
    }
    return null
  }, [roadmap, tasks])

  const completeNextAction = async () => {
    if (!next || completing) return

    setCompleting(true)
    setError(null)
    try {
      const completed = await progressApi.completeTask(goal.id, {
        milestoneTitle: next.milestone,
        taskTitle: next.task,
      })
      setTasks((current) => [completed, ...current.filter((task) => task.id !== completed.id)])
    } catch {
      setError('Could not mark this task complete. Please try again.')
    } finally {
      setCompleting(false)
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-200">Today / next action</p>
          <h2 className="mt-1 font-display text-lg text-ink-100">Keep {goal.title} moving</h2>
        </div>
        <Link to={`/goals/${goal.id}`} className="text-xs text-ink-700 hover:text-ink-100">Open goal →</Link>
      </div>
      {loading ? (
        <div className="mt-5 space-y-2"><Skeleton className="h-5 w-3/4"/><Skeleton className="h-4 w-1/2"/></div>
      ) : next ? (
        <div className="mt-5 rounded-xl border border-base-700 bg-base-950/60 p-4">
          <p className="text-xs text-ink-700">{next.milestone}</p>
          <p className="mt-1 text-sm font-medium leading-6 text-ink-100">{next.task}</p>
          {error && <p role="alert" className="mt-2 text-xs text-signal-rose">{error}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" isLoading={completing} onClick={completeNextAction}>
              Mark complete
            </Button>
            <Link to={`/goals/${goal.id}`} className="inline-flex">
              <Button size="sm" variant="secondary">View plan</Button>
            </Link>
            <Link to="/conversations" className="inline-flex">
              <Button size="sm" variant="ghost">I’m stuck</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-signal-mint/20 bg-signal-mint/5 p-4">
          <p className="text-sm font-medium text-ink-100">No unfinished roadmap task is waiting.</p>
          <p className="mt-1 text-xs leading-5 text-ink-500">Log progress or review the roadmap to decide what comes next.</p>
        </div>
      )}
    </Card>
  )
}
