import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { CoachMode, CoachResponse, DailyIntelligenceResponse } from '../../types/intelligence'
import { intelligenceApi } from '../../api/intelligence'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Skeleton } from '../ui/LoadingState'
import { Modal } from '../ui/Modal'
import { ApiError } from '../../types/common'
import { cn } from '../../utils/cn'

const modes: Array<{ id: CoachMode; label: string; hint: string; tone: string }> = [
  { id: 'PLAN', label: 'Make a plan', hint: 'Turn this into a focused session', tone: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' },
  { id: 'EXPLAIN', label: 'Teach me', hint: 'Understand what to do and why', tone: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' },
  { id: 'UNSTUCK', label: 'I’m stuck', hint: 'Find a practical way around the blocker', tone: 'border-amber-400/20 bg-amber-400/10 text-amber-200' },
  { id: 'RESTART', label: 'Help me restart', hint: 'Make the first step feel easy', tone: 'border-rose-400/20 bg-rose-400/10 text-rose-200' },
  { id: 'REFLECT', label: 'Reflect', hint: 'Spot the pattern in your progress', tone: 'border-sky-400/20 bg-sky-400/10 text-sky-200' },
]

export function DailyIntelligenceCard() {
  const [data, setData] = useState<DailyIntelligenceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coachOpen, setCoachOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<CoachMode | null>(null)
  const [coach, setCoach] = useState<CoachResponse | null>(null)
  const [coachLoading, setCoachLoading] = useState(false)
  const [coachError, setCoachError] = useState<string | null>(null)

  const load = async () => {
    try {
      setError(null)
      setData(await intelligenceApi.today())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load today’s intelligence.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const askCoach = async (mode: CoachMode) => {
    if (!data?.focusGoalId) return
    setSelectedMode(mode)
    setCoachLoading(true)
    setCoachError(null)
    setCoach(null)
    try {
      setCoach(await intelligenceApi.coach(data.focusGoalId, mode))
    } catch (err) {
      setCoachError(err instanceof ApiError ? err.message : 'Your coach could not respond right now.')
    } finally {
      setCoachLoading(false)
    }
  }

  if (loading) return <Skeleton className="mt-8 h-64" />

  if (error) {
    return (
      <Card className="mt-8 border-rose-400/20 bg-rose-400/[0.04] p-5">
        <p role="alert" className="text-sm text-rose-200">{error}</p>
        <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={load}>Try again</Button>
      </Card>
    )
  }

  if (!data) return null

  const progress = Math.max(0, Math.min(100, data.progressPercent))
  const goalLink = data.focusGoalId ? `/goals/${data.focusGoalId}` : '/goals'
  const modeMeta = selectedMode ? modes.find((m) => m.id === selectedMode) : null

  return (
    <>
      <Card className="group relative mt-8 overflow-hidden border-base-600 bg-base-900 p-0 shadow-[0_24px_80px_-40px_rgba(34,211,238,0.45)]">
        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl transition-opacity duration-500 group-hover:bg-cyan-400/15" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-amber-400/8 blur-3xl" />

        <div className="relative border-b border-base-700/80 p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                  <PulseIcon />
                </span>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200/80">Nexora pulse · today</p>
              </div>
              <h2 className="mt-3 max-w-2xl font-display text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">{data.headline}</h2>
              {data.focusGoalTitle && (
                <Link to={goalLink} className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-sm text-ink-300 hover:text-cyan-200">
                  <span className="truncate">{data.focusGoalTitle}</span><span aria-hidden>↗</span>
                </Link>
              )}
            </div>
            {data.needsRestart ? (
              <span className="w-fit rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-amber-200">
                Momentum needs a reset
              </span>
            ) : (
              <span className="w-fit rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-200">
                Path is moving
              </span>
            )}
          </div>

          <p className="mt-5 max-w-3xl text-sm leading-6 text-ink-300">{data.reason}</p>
        </div>

        <div className="relative grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_260px]">
          <div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-300/10 text-amber-200">
                <ArrowIcon />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-600">Next best action</p>
                <p className="mt-1.5 max-w-2xl text-lg leading-7 text-ink-100">{data.nextAction}</p>
                {data.milestoneTitle && <p className="mt-1.5 text-xs text-ink-600">{data.milestoneTitle}</p>}
              </div>
            </div>

            {data.focusGoalId && (
              <div className="mt-6 flex flex-wrap gap-2">
                <Link to={goalLink}><Button type="button" size="sm">Open goal</Button></Link>
                <Button type="button" size="sm" variant="secondary" onClick={() => { setCoachOpen(true); setCoach(null); setSelectedMode(null) }}>
                  Coach me through it
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-base-700 bg-base-950/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-600">Path progress</span>
              <span className="font-display text-xl text-ink-100">{progress}%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-base-700">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300 transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-ink-600">
              <span>{data.completedTasks} completed</span>
              <span>{data.totalTasks} tracked</span>
            </div>
          </div>
        </div>
      </Card>

      <Modal open={coachOpen} onClose={() => !coachLoading && setCoachOpen(false)} title="Nexora coach">
        {!coach && !coachLoading && !coachError && (
          <div>
            <p className="text-sm leading-6 text-ink-400">Don’t just get an answer. Pick the kind of help you need right now.</p>
            <div className="mt-5 grid gap-2">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => void askCoach(mode.id)}
                  className={cn('group rounded-xl border p-3.5 text-left transition-all hover:-translate-y-0.5', mode.tone)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-sm font-medium">{mode.label}</span>
                    <span className="text-xs opacity-60 transition-transform group-hover:translate-x-0.5">→</span>
                  </div>
                  <p className="mt-1 text-xs opacity-60">{mode.hint}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {coachLoading && (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
              <SparkIcon />
            </div>
            <p className="mt-4 font-display text-base text-ink-100">Reading your context…</p>
            <p className="mt-1 text-sm text-ink-500">Goal, roadmap, progress and memory are all in the room.</p>
          </div>
        )}

        {coachError && (
          <div>
            <p role="alert" className="text-sm text-rose-200">{coachError}</p>
            <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={() => selectedMode && void askCoach(selectedMode)}>Try again</Button>
          </div>
        )}

        {coach && (
          <div>
            <div className={cn('rounded-xl border p-4', modeMeta?.tone ?? 'border-base-700 bg-base-800 text-ink-100')}>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-60">{coach.mode}</p>
              <h3 className="mt-1 font-display text-xl font-semibold">{coach.title}</h3>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-ink-100">{coach.response}</p>
            </div>
            <div className="mt-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.06] p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-200/70">Your micro-action</p>
              <p className="mt-1.5 text-sm leading-6 text-amber-50">{coach.microAction}</p>
            </div>
            <p className="mt-3 text-xs leading-5 text-ink-600">{coach.whyNow}</p>
            <div className="mt-5 flex justify-between gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => { setCoach(null); setSelectedMode(null) }}>Choose another</Button>
              <Button type="button" size="sm" onClick={() => setCoachOpen(false)}>Got it</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

function PulseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 12h4l2.2-6 4.1 12 2.4-6H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function ArrowIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
function SparkIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" stroke="currentColor" strokeWidth="1.5"/><path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" fill="currentColor"/></svg>
}
