import { useEffect, useState } from 'react'
import { memoryApi } from '../../api/memory'
import type { GrowthMemoryResponse } from '../../types/memory'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Skeleton } from '../ui/LoadingState'
import { ApiError } from '../../types/common'

export function GrowthMemoryCard() {
  const [memory, setMemory] = useState<GrowthMemoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setError(null)
      setMemory(await memoryApi.get())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your growth memory.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const refresh = async () => {
    setRefreshing(true)
    try {
      setError(null)
      setMemory(await memoryApi.refresh())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not refresh your growth memory.')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <Card className="mt-8 overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-base-700 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200">Nexora memory</p>
          <h2 className="mt-1 font-display text-lg text-ink-100">What Nexora understands about your journey</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-ink-600">
            This is built from your goals, progress, completed work, and recent activity. It changes as your journey changes.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={refresh} isLoading={refreshing}>
          Refresh understanding
        </Button>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-24" /><Skeleton className="h-24" />
            <Skeleton className="h-24" /><Skeleton className="h-24" />
          </div>
        ) : error ? (
          <div className="flex flex-col gap-3 rounded-lg border border-signal-rose/20 bg-signal-rose/5 p-4">
            <p role="alert" className="text-sm text-signal-rose">{error}</p>
            <Button type="button" variant="secondary" size="sm" onClick={load} className="self-start">Try again</Button>
          </div>
        ) : memory ? (
          <div className="grid gap-4 md:grid-cols-2">
            <MemoryItem label="Journey" value={memory.journeySummary} />
            <MemoryItem label="Current focus" value={memory.currentFocus} emphasized />
            <MemoryItem label="Strengths" value={memory.strengths} />
            <MemoryItem label="Friction to watch" value={memory.frictionPoints} />
            <MemoryItem label="Recent pattern" value={memory.patterns} />
            <MemoryItem label="Last activity" value={memory.lastActivityDate ? formatMemoryDate(memory.lastActivityDate) : 'No progress recorded yet'} />
          </div>
        ) : null}
      </div>
    </Card>
  )
}

function MemoryItem({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${emphasized ? 'border-cyan-300/20 bg-cyan-300/[0.04]' : 'border-base-700 bg-base-950/40'}`}>
      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-700">{label}</p>
      <p className="mt-2 text-sm leading-6 text-ink-300">{value}</p>
    </div>
  )
}

function formatMemoryDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}
