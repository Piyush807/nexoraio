import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

function daysSince(date: string | null) {
  if (!date) return null
  const today = new Date()
  const then = new Date(`${date}T00:00:00`)
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const thenUtc = Date.UTC(then.getFullYear(), then.getMonth(), then.getDate())
  return Math.max(0, Math.floor((todayUtc - thenUtc) / 86400000))
}

export function InactivityBanner({ lastEntryDate, focusGoalId }: { lastEntryDate: string | null; focusGoalId?: string | null }) {
  const days = daysSince(lastEntryDate)
  if (days === null || days < 3) return null

  return (
    <Card className="mt-8 border-signal-amber/25 bg-signal-amber/5 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-signal-amber">Momentum check</p>
          <h2 className="mt-1 font-display text-base text-ink-100">
            {days === 3 ? 'It has been 3 days since your last progress entry.' : `You have been away for ${days} days.`}
          </h2>
          <p className="mt-1 text-sm text-ink-500">You do not need a perfect restart. Log one small win and pick the next action.</p>
        </div>
        <Link to={focusGoalId ? `/goals/${focusGoalId}?log=1` : '/goals'} className="shrink-0"><Button size="sm">Log a win</Button></Link>
      </div>
    </Card>
  )
}
