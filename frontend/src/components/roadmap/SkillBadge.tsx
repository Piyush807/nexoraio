import type { RoadmapSkillResponse } from '../../types/roadmap'

export function SkillBadge({ skill }: { skill: RoadmapSkillResponse }) {
  const pct = skill.progressPercentage ?? (skill.completed ? 100 : 0)
  return (
    <div className="flex items-center gap-3 rounded-lg border border-base-700 bg-base-900/60 px-3.5 py-2.5">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          skill.completed ? 'bg-signal-mint' : 'bg-signal-violet'
        }`}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink-100">{skill.name}</p>
        {skill.description && <p className="truncate text-xs text-ink-700">{skill.description}</p>}
      </div>
      <div className="w-16 shrink-0">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-700">
          <div
            className={`h-full rounded-full ${skill.completed ? 'bg-signal-mint' : 'bg-signal-violet'}`}
            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
          />
        </div>
      </div>
    </div>
  )
}
