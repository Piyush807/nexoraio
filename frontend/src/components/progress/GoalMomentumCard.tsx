import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { roadmapApi } from '../../api/roadmap'
import { progressApi } from '../../api/progress'
import type { GoalResponse } from '../../types/goal'
import type { RoadmapResponse } from '../../types/roadmap'
import type { ProgressEntryResponse, ProgressTaskResponse } from '../../types/progress'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/LoadingState'
import { Button } from '../ui/Button'

function daysSince(date: string | null): number | null {
  if (!date) return null
  const then = new Date(`${date}T00:00:00`).getTime()
  if (Number.isNaN(then)) return null
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000))
}

export function GoalMomentumCard({ goal }: { goal: GoalResponse }) {
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null)
  const [tasks, setTasks] = useState<ProgressTaskResponse[]>([])
  const [entries, setEntries] = useState<ProgressEntryResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      roadmapApi.getByGoalId(goal.id),
      progressApi.completedTasks(goal.id),
      progressApi.list(goal.id),
    ])
      .then(([r, completed, progress]) => {
        if (cancelled) return
        setRoadmap(r)
        setTasks(completed)
        setEntries(progress)
      })
      .catch(() => {
        if (cancelled) return
        setRoadmap(null)
        setTasks([])
        setEntries([])
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [goal.id])

  const summary = useMemo(() => {
    if (!roadmap) return null
    const done = new Set(tasks.map((task) => `${task.milestoneTitle}::${task.taskTitle}`))
    const allTasks = roadmap.milestones.flatMap((milestone) =>
      milestone.tasks.map((task) => ({ milestone: milestone.title, task })),
    )
    const completedCount = allTasks.filter(({ milestone, task }) => done.has(`${milestone}::${task}`)).length
    const percentage = allTasks.length ? Math.round((completedCount / allTasks.length) * 100) : 0
    const next = allTasks.find(({ milestone, task }) => !done.has(`${milestone}::${task}`))
    const latest = entries[0]?.entryDate ?? null
    const inactiveDays = daysSince(latest)
    const target = new Date(`${goal.targetDate}T00:00:00`).getTime()
    const daysLeft = Number.isNaN(target) ? null : Math.ceil((target - Date.now()) / 86_400_000)

    let state: 'moving' | 'attention' | 'deadline' | 'complete' = 'moving'
    let message = 'You have a clear next step. Keep the momentum going.'
    if (!next) {
      state = 'complete'
      message = 'Your roadmap tasks are complete. Review your progress and decide what comes next.'
    } else if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 7) {
      state = 'deadline'
      message = `${daysLeft === 0 ? 'Your target date is today.' : `${daysLeft} days remain.`} Keep today’s action small and focused.`
    } else if (inactiveDays !== null && inactiveDays >= 3) {
      state = 'attention'
      message = `You have not logged progress for ${inactiveDays} days. A small session can restart the momentum.`
    }

    return { completedCount, total: allTasks.length, percentage, next, inactiveDays, daysLeft, state, message }
  }, [goal.targetDate, roadmap, tasks, entries])

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-200">Your momentum</p>
          <h2 className="mt-1 font-display text-lg text-ink-100">The next useful move</h2>
        </div>
        <Link to={`/goals/${goal.id}`} className="text-xs text-ink-700 hover:text-ink-100">Open goal →</Link>
      </div>

      {loading ? (
        <div className="mt-5 space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      ) : !summary ? (
        <div className="mt-5 rounded-xl border border-base-700 bg-base-950/50 p-4">
          <p className="text-sm text-ink-300">Generate a roadmap to let Nexora choose your next action.</p>
          <Link to={`/goals/${goal.id}/roadmap`} className="mt-3 inline-flex"><Button size="sm">Build roadmap</Button></Link>
        </div>
      ) : (
        <>
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-500">Roadmap progress</span>
              <span className="font-mono text-ink-300">{summary.completedCount}/{summary.total} tasks · {summary.percentage}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-base-700" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.percentage} aria-label="Goal roadmap progress">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300 transition-all" style={{ width: `${summary.percentage}%` }} />
            </div>
          </div>

          <div className={`mt-4 rounded-xl border p-4 ${summary.state === 'attention' ? 'border-signal-amber/25 bg-signal-amber/5' : summary.state === 'deadline' ? 'border-signal-rose/25 bg-signal-rose/5' : 'border-base-700 bg-base-950/60'}`}>
            <p className="text-xs font-mono uppercase tracking-wide text-ink-700">
              {summary.state === 'complete' ? 'Ready for reflection' : summary.state === 'attention' ? 'Momentum check' : summary.state === 'deadline' ? 'Deadline focus' : 'Next action'}
            </p>
            {summary.next && <p className="mt-1.5 text-sm font-medium leading-6 text-ink-100">{summary.next.task}</p>}
            <p className="mt-1 text-xs leading-5 text-ink-500">{summary.message}</p>
            {summary.next && (
              <Link to={`/goals/${goal.id}`} className="mt-3 inline-flex"><Button size="sm">Work on this</Button></Link>
            )}
          </div>
        </>
      )}
    </Card>
  )
}
