import { useMemo, useState } from 'react'
import type { RoadmapResponse } from '../../types/roadmap'
import type { ProgressTaskResponse } from '../../types/progress'
import { formatDate } from '../../utils/formatDate'
import { ApiError } from '../../types/common'

interface TaskChecklistProps {
  roadmap: RoadmapResponse | null
  completedTasks: ProgressTaskResponse[]
  onComplete: (payload: { milestoneTitle: string; taskTitle: string }) => Promise<void>
}

export function TaskChecklist({ roadmap, completedTasks, onComplete }: TaskChecklistProps) {
  const completedKeys = useMemo(
    () => new Set(completedTasks.filter((t) => t.completed).map((t) => `${t.milestoneTitle}::${t.taskTitle}`)),
    [completedTasks],
  )
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const milestones = useMemo(
    () => [...(roadmap?.milestones ?? [])].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)),
    [roadmap],
  )

  if (!roadmap) {
    return (
      <div className="rounded-2xl border border-dashed border-base-700 bg-base-950/30 p-5">
        <p className="text-sm font-medium text-ink-200">Your tasks will appear here</p>
        <p className="mt-1 text-sm text-ink-600">Generate a roadmap first, then use this checklist to turn the plan into daily action.</p>
      </div>
    )
  }

  const totalTasks = milestones.reduce((sum, milestone) => sum + milestone.tasks.length, 0)
  const completedCount = milestones.reduce(
    (sum, milestone) => sum + milestone.tasks.filter((task) => completedKeys.has(`${milestone.title}::${task}`)).length,
    0,
  )
  const remaining = totalTasks - completedCount
  const nextKey = useMemo(() => {
    for (const milestone of milestones) {
      for (const task of milestone.tasks) {
        const key = `${milestone.title}::${task}`
        if (!completedKeys.has(key)) return key
      }
    }
    return null
  }, [milestones, completedKeys])

  const handleComplete = async (milestoneTitle: string, taskTitle: string) => {
    const key = `${milestoneTitle}::${taskTitle}`
    if (pendingKey || completedKeys.has(key)) return
    setPendingKey(key)
    setError(null)
    try {
      await onComplete({ milestoneTitle, taskTitle })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not mark that task complete. Try again.')
    } finally {
      setPendingKey(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-base font-semibold text-ink-100">Turn the roadmap into action</p>
          <p className="mt-1 text-xs text-ink-600">
            {remaining === 0 ? 'Everything on this path is complete.' : `${remaining} task${remaining === 1 ? '' : 's'} left · check them off as you finish.`}
          </p>
        </div>
        <div className="min-w-[130px] text-right">
          <p className="font-mono text-[10px] uppercase tracking-[.12em] text-ink-700">Progress</p>
          <p className="mt-1 text-sm font-semibold text-ink-200">{completedCount}/{totalTasks}</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-4 rounded-xl border border-signal-rose/20 bg-signal-rose/[.06] px-3 py-2 text-xs text-signal-rose">
          {error}
        </div>
      )}

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-base-700" role="progressbar" aria-valuemin={0} aria-valuemax={totalTasks || 1} aria-valuenow={completedCount} aria-label="Task progress">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-all duration-500" style={{ width: `${totalTasks ? (completedCount / totalTasks) * 100 : 0}%` }} />
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {milestones.map((milestone, milestoneIndex) => {
          const milestoneCompleted = milestone.tasks.filter((task) => completedKeys.has(`${milestone.title}::${task}`)).length
          const milestoneTotal = milestone.tasks.length
          const milestonePercent = milestoneTotal ? Math.round((milestoneCompleted / milestoneTotal) * 100) : 0

          return (
            <section key={milestone.id} className="overflow-hidden rounded-2xl border border-base-700 bg-base-950/35">
              <div className="flex items-center justify-between gap-3 border-b border-base-700/80 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${milestone.completed ? 'bg-emerald-300/15 text-emerald-200' : 'bg-cyan-300/10 text-cyan-200'}`}>
                      {milestone.completed ? '✓' : milestoneIndex + 1}
                    </span>
                    <h3 className="truncate text-sm font-semibold text-ink-100">{milestone.title}</h3>
                  </div>
                  {milestone.description && <p className="ml-8 mt-1 line-clamp-1 text-xs text-ink-600">{milestone.description}</p>}
                </div>
                <span className="shrink-0 font-mono text-[10px] text-ink-700">{milestoneCompleted}/{milestoneTotal}</span>
              </div>

              {milestone.tasks.length > 0 ? (
                <div className="divide-y divide-base-700/70">
                  {milestone.tasks.map((task) => {
                    const key = `${milestone.title}::${task}`
                    const done = completedKeys.has(key)
                    const saving = pendingKey === key
                    return (
                      <button
                        key={task}
                        type="button"
                        onClick={() => handleComplete(milestone.title, task)}
                        disabled={done || Boolean(pendingKey)}
                        aria-pressed={done}
                        className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition ${done ? 'cursor-default bg-emerald-300/[.025]' : 'hover:bg-cyan-300/[.035]'} disabled:cursor-default`}
                      >
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${done ? 'border-emerald-300/50 bg-emerald-300/15 text-emerald-200' : 'border-base-500 bg-base-900 text-transparent group-hover:border-cyan-300/50'} ${saving ? 'animate-pulse' : ''}`} aria-hidden="true">
                          {saving ? '·' : '✓'}
                        </span>
                        <span className={`min-w-0 flex-1 text-sm leading-5 ${done ? 'text-ink-600 line-through decoration-ink-700' : 'text-ink-200 group-hover:text-ink-100'}`}>
                          {task}
                        </span>
                        {done && (
                          <span className="shrink-0 font-mono text-[9px] text-emerald-300/60">done</span>
                        )}
                        {!done && !saving && (key === nextKey ? <span className="shrink-0 rounded-full border border-cyan-300/15 bg-cyan-300/[.06] px-2 py-1 font-mono text-[9px] uppercase tracking-wide text-cyan-200/80">Next</span> : <span className="shrink-0 text-xs text-ink-700 opacity-0 transition group-hover:opacity-100">Complete →</span>)}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="px-4 py-4 text-xs text-ink-700">No tasks were generated for this milestone.</p>
              )}
              <div className="h-0.5 bg-base-800">
                <div className="h-full bg-emerald-300/60 transition-all duration-500" style={{ width: `${milestonePercent}%` }} />
              </div>
            </section>
          )
        })}
      </div>

      {completedTasks.length > 0 && (
        <details className="mt-5 rounded-xl border border-base-700/80 bg-base-950/20">
          <summary className="cursor-pointer px-4 py-3 text-xs font-medium text-ink-500 hover:text-ink-300">
            Completion history · {completedTasks.length}
          </summary>
          <ul className="border-t border-base-700/70 px-4 py-2">
            {completedTasks.slice(0, 12).map((task) => (
              <li key={task.id} className="flex items-center justify-between gap-3 border-b border-base-800 py-2 last:border-0">
                <span className="min-w-0 truncate text-xs text-ink-600">{task.taskTitle}</span>
                <span className="shrink-0 font-mono text-[9px] text-ink-700">{task.completedAt ? formatDate(task.completedAt) : ''}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
