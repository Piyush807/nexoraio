import { useEffect, useState } from 'react'
import { progressApi } from '../../api/progress'
import type { StreakResponse } from '../../types/progress'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/LoadingState'

// A custom flame mark built from the existing design tokens (cyan core,
// amber glow) rather than a literal emoji — keeps the streak indicator
// consistent with the rest of Nexora's visual language instead of looking
// bolted on.
function StreakMark({ active, size = 40 }: { active: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="streak-gradient" x1="20" y1="4" x2="20" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={active ? '#F0B429' : '#5B6578'} />
          <stop offset="100%" stopColor={active ? '#22D3EE' : '#323A4E'} />
        </linearGradient>
      </defs>
      <path
        d="M20 4c2 5-3 7-3 12 0 2.5 1.5 4 3 4s3-1.5 3-4c3 2 5 6 5 10a8 8 0 1 1-16 0c0-7 4-9 4-14 0-3-1-5-2-8 2 0 5 0 6 0Z"
        fill="url(#streak-gradient)"
        className={active ? 'animate-pulseSoft' : ''}
        opacity={active ? 1 : 0.5}
      />
    </svg>
  )
}

export function StreakWidget() {
  const [streak, setStreak] = useState<StreakResponse | null | 'error'>(null)

  useEffect(() => {
    progressApi.streak().then(setStreak).catch(() => setStreak('error'))
  }, [])

  if (streak === 'error') return null

  const current = streak === null ? null : streak.currentStreakDays
  const longest = streak === null ? null : streak.longestStreakDays
  const isActive = (current ?? 0) > 0

  return (
    <Card className="flex items-center gap-4 overflow-hidden p-5">
      <div className="shrink-0">
        {current === null ? <Skeleton className="h-10 w-10 rounded-full" /> : <StreakMark active={isActive} />}
      </div>
      <div className="min-w-0 flex-1">
        {current === null ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          <p className="font-display text-xl text-ink-100">
            {current} {current === 1 ? 'day' : 'days'}
            <span className="ml-2 text-xs font-mono font-normal text-ink-700">streak</span>
          </p>
        )}
        <p className="mt-0.5 text-xs text-ink-500">
          {current === null
            ? 'Loading…'
            : isActive
              ? longest && longest > current
                ? `Best: ${longest} days`
                : 'This is your best run yet'
              : 'Log progress today to start a new streak'}
        </p>
      </div>
    </Card>
  )
}
