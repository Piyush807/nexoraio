import { useState } from 'react'
import type { RoadmapMilestoneResponse } from '../../types/roadmap'
import { Badge } from '../ui/Badge'

export function MilestoneNode({
  milestone,
  index,
  isLast,
}: {
  milestone: RoadmapMilestoneResponse
  index: number
  isLast: boolean
}) {
  const [open, setOpen] = useState(index === 0)

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {/* Rail */}
      <div className="relative flex w-8 shrink-0 flex-col items-center">
        <div
          className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 font-mono text-xs ${
            milestone.completed
              ? 'border-signal-mint bg-signal-mint/10 text-signal-mint'
              : 'border-signal-violet bg-signal-violet/10 text-signal-violetSoft'
          }`}
        >
          {milestone.completed ? '✓' : index + 1}
        </div>
        {!isLast && (
          <div
            className={`w-px flex-1 ${milestone.completed ? 'bg-signal-mint/40' : 'bg-base-600'}`}
            style={{ minHeight: '1.5rem' }}
          />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-start justify-between gap-3 text-left"
          aria-expanded={open}
        >
          <div>
            <h3 className="font-display text-base text-ink-100">{milestone.title}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {milestone.estimatedDays !== null && (
                <Badge tone="neutral">{milestone.estimatedDays}d</Badge>
              )}
              {milestone.completed && <Badge tone="mint">Complete</Badge>}
            </div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className={`mt-1.5 shrink-0 text-ink-700 transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div className="mt-3 animate-fadeUp rounded-lg border border-base-700 bg-base-900/50 p-4">
            {milestone.description && (
              <p className="text-sm leading-relaxed text-ink-300">{milestone.description}</p>
            )}
            {milestone.tasks.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2">
                {milestone.tasks.map((task, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-500">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-700" />
                    {task}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
