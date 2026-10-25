import type { RoadmapResponse } from '../../types/roadmap'
import type { ProgressTaskResponse } from '../../types/progress'
import { MilestoneNode } from './MilestoneNode'
import { SkillBadge } from './SkillBadge'
import { Card } from '../ui/Card'
import { TaskChecklist } from '../progress/TaskChecklist'

export function RoadmapTimeline({
  roadmap,
  completedTasks,
  onCompleteTask,
  onToggleMilestone,
}: {
  roadmap: RoadmapResponse
  completedTasks: ProgressTaskResponse[]
  onCompleteTask: (payload: { milestoneTitle: string; taskTitle: string }) => Promise<void>
  onToggleMilestone: (milestoneId: string, completed: boolean) => Promise<void>
}) {
  const sorted = [...roadmap.milestones].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
  const completedCount = sorted.filter((m) => m.completed).length

  return (
    <div className="space-y-6">
      <TaskChecklist roadmap={roadmap} completedTasks={completedTasks} onComplete={onCompleteTask} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="p-6">
          <div className="mb-1 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg text-ink-100">Your path</h2>
              <p className="mt-1 text-xs text-ink-600">Milestones show the bigger stages. Use the checklist above for day-to-day execution.</p>
            </div>
            <span className="font-mono text-xs text-ink-700">{completedCount}/{sorted.length}</span>
          </div>
          <div className="mt-6">
            {sorted.map((m, i) => (
              <MilestoneNode
                key={m.id}
                milestone={m}
                index={i}
                isLast={i === sorted.length - 1}
                onToggle={onToggleMilestone}
              />
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <h2 className="font-display text-base text-ink-100">Skills</h2>
            <p className="mt-1 text-xs text-ink-700">What this roadmap builds toward.</p>
            <div className="mt-4 flex flex-col gap-2">
              {roadmap.skills.length === 0 ? (
                <p className="text-sm text-ink-700">No skills listed for this roadmap.</p>
              ) : (
                roadmap.skills.map((s) => <SkillBadge key={s.id} skill={s} />)
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
