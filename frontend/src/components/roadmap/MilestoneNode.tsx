import { useState } from 'react'
import type { RoadmapMilestoneResponse } from '../../types/roadmap'
import { Badge } from '../ui/Badge'

export function MilestoneNode({
  milestone,
  index,
  isLast,
  onToggle,
}: {
  milestone: RoadmapMilestoneResponse
  index: number
  isLast: boolean
  onToggle: (milestoneId: string, completed: boolean) => Promise<void>
}) {
  const [open, setOpen] = useState(index === 0)
  const [saving, setSaving] = useState(false)

  const handleToggle = async () => {
    if (saving) return
    setSaving(true)
    try {
      await onToggle(milestone.id, !milestone.completed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {/* Rail */}
      <div className="relative flex w-8 shrink-0 flex-col items-center">
        <button
          type="button"
          onClick={handleToggle}
          disabled={saving}
          aria-pressed={milestone.completed}
          aria-label={milestone.completed ? 'Mark milestone incomplete' : 'Mark milestone complete'}
          title={milestone.completed ? 'Mark as incomplete' : 'Mark as complete'}
          className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 font-mono text-xs transition-colors disabled:cursor-wait ${
            milestone.completed
              ? 'border-signal-mint bg-signal-mint/10 text-signal-mint hover:bg-signal-mint/20'
              : 'border-cyan-200 bg-cyan-200/10 text-cyan-200 hover:bg-cyan-200/15'
          }`}
        >
          {saving ? (
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
            </svg>
          ) : milestone.completed ? (
            '✓'
          ) : (
            index + 1
          )}
        </button>
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
          type="button"
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
              {milestone.manualOverride && (
                <Badge tone="cyan" title="Set manually — checking off tasks won't change this">
                  Manually set
                </Badge>
              )}
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
              <div className="mt-3 rounded-xl border border-cyan-300/10 bg-cyan-300/[.025] px-3 py-3">
                <p className="text-xs font-medium text-ink-300">{milestone.tasks.length} action{milestone.tasks.length === 1 ? '' : 's'} in this stage</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-600">Open the checklist above to complete these tasks and have your progress saved automatically.</p>
              </div>
            )}
            <button
              type="button"
              onClick={handleToggle}
              disabled={saving}
              className="mt-4 text-xs font-mono text-cyan-200 hover:underline disabled:opacity-50"
            >
              {milestone.completed ? 'Mark as incomplete' : 'Mark as complete'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
