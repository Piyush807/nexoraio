import { Link } from 'react-router-dom'
import type { GoalResponse } from '../../types/goal'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { daysUntil, formatDate } from '../../utils/formatDate'

const statusTone = {
  ACTIVE: 'mint',
  PAUSED: 'amber',
  COMPLETED: 'mint',
  CANCELLED: 'rose',
} as const

const levelLabel = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
} as const

export function GoalCard({ goal }: { goal: GoalResponse }) {
  const remaining = daysUntil(goal.targetDate)
  return (
    <Link to={`/goals/${goal.id}`}>
      <Card className="group nexora-sheen relative overflow-hidden p-5 transition-all hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base text-ink-100">{goal.title}</h3>
          <Badge tone={statusTone[goal.status]}>{goal.status}</Badge>
        </div>
        {goal.description && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-500">{goal.description}</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-ink-700">
          <span>{levelLabel[goal.currentLevel]}</span>
          <span>·</span>
          <span>{goal.dailyStudyHours}h / day</span>
          <span>·</span>
          <span>
            {remaining === null
              ? formatDate(goal.targetDate)
              : remaining >= 0
                ? `${remaining}d left`
                : 'Past due'}
          </span>
        </div>
      </Card>
    </Link>
  )
}
