import { useState } from 'react'
import { progressApi } from '../../api/progress'
import { Button } from '../ui/Button'
import { ApiError } from '../../types/common'

export function DailyCoachCard({ goalId }: { goalId: string }) {
  const [reply, setReply] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [askedToday, setAskedToday] = useState(false)

  const fetchCoach = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await progressApi.dailyCoach(goalId)
      setReply(res.reply)
      setAskedToday(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach your coach right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {!reply && !loading && !error && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-ink-500">
            Get a quick, goal-aware nudge based on your roadmap and recent progress.
          </p>
          <Button size="sm" onClick={fetchCoach}>
            Ask my coach
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2.5 text-sm text-ink-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-200 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-200" />
          </span>
          Thinking about your day…
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-signal-rose">{error}</p>
          <Button size="sm" variant="secondary" onClick={fetchCoach}>
            Try again
          </Button>
        </div>
      )}

      {reply && !loading && (
        <div>
          <div className="rounded-xl border border-cyan-200/25 bg-cyan-200/5 px-4 py-3.5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-100">{reply}</p>
          </div>
          {askedToday && (
            <p className="mt-2 font-mono text-[10px] text-ink-700">
              This is today's coach message — it won't change if you ask again today.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
