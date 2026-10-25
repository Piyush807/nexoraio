import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { journeyApi } from '../api/journey'
import type { JourneyOverview } from '../types/journey'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/LoadingState'
import { ErrorState } from '../components/ui/ErrorState'
import { formatDate } from '../utils/formatDate'

export default function Journey() {
  const [data, setData] = useState<JourneyOverview | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setError(null)
    journeyApi.overview().then(setData).catch(() => setError('Could not load your growth journey.'))
  }
  useEffect(load, [])

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return <JourneySkeleton />

  return (
    <div className="nexora-page nexora-page-journey mx-auto max-w-6xl">
      <header className="relative overflow-hidden rounded-3xl border border-base-700 bg-base-900/75 p-6 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-300">Your growth journey</p>
              <h1 className="mt-2 max-w-2xl font-display text-3xl font-semibold text-ink-100 md:text-4xl">{data.headline}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-500">{data.summary}</p>
            </div>
            <Badge tone="mint">{formatDate(data.periodStart)} — {formatDate(data.periodEnd)}</Badge>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric label="Active days" value={data.thisWeekActiveDays} accent="cyan" />
            <Metric label="Tasks finished" value={data.thisWeekCompletedTasks} accent="mint" />
            <Metric label="Check-ins" value={data.thisWeekProgressEntries} accent="amber" />
            <Metric label="Goals in motion" value={data.goals.length} accent="rose" />
          </div>
        </div>
      </header>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <Card className="overflow-hidden p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-700">The bigger picture</p>
              <h2 className="mt-1 font-display text-xl text-ink-100">Goals in motion</h2>
            </div>
            <Link to="/goals" className="text-sm text-cyan-300 hover:text-cyan-200">View all →</Link>
          </div>
          <div className="mt-5 space-y-3">
            {data.goals.length === 0 && <p className="text-sm text-ink-500">Create a goal and Nexora will start mapping your journey here.</p>}
            {data.goals.map((goal) => (
              <Link key={goal.goalId} to={`/goals/${goal.goalId}`} className="group block rounded-2xl border border-base-700 bg-base-950/50 p-4 transition hover:-translate-y-0.5 hover:border-base-600">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium text-ink-100 group-hover:text-cyan-200">{goal.title}</h3>
                    <p className="mt-1 text-xs text-ink-700">{goal.completedTasks}/{goal.totalTasks || '—'} tracked tasks · {goal.signal}</p>
                  </div>
                  <span className="font-mono text-sm text-ink-300">{goal.progressPercent}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-base-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-300 to-amber-300 transition-all" style={{ width: `${goal.progressPercent}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-300">Weekly reflection</p>
          <h2 className="mt-1 font-display text-xl text-ink-100">Pause. Notice. Adjust.</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500">A growth system should remember what happened, not just what is left to do.</p>
          <div className="mt-5 space-y-3">
            {data.reflectionPrompts.map((prompt, i) => (
              <div key={prompt} className="rounded-2xl border border-base-700 bg-base-950/55 p-4">
                <span className="font-mono text-xs text-amber-300">0{i + 1}</span>
                <p className="mt-2 text-sm leading-5 text-ink-200">{prompt}</p>
              </div>
            ))}
          </div>
          <Link to="/conversations" className="mt-5 block">
            <Button className="w-full" variant="secondary">Reflect with your coach</Button>
          </Link>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <Card className="p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-700">Week over week</p>
          <h2 className="mt-1 font-display text-xl text-ink-100">Your rhythm</h2>
          <div className="mt-5 space-y-4">
            <Compare label="Active days" current={data.thisWeekActiveDays} previous={data.previousWeekActiveDays} />
            <Compare label="Tasks finished" current={data.thisWeekCompletedTasks} previous={data.previousWeekCompletedTasks} />
            <Compare label="Check-ins" current={data.thisWeekProgressEntries} previous={data.previousWeekProgressEntries} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-emerald-300">Recent signals</p>
              <h2 className="mt-1 font-display text-xl text-ink-100">Your week, in context</h2>
            </div>
            <span className="text-xs text-ink-700">Last 7 days</span>
          </div>
          {data.timeline.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-base-600 p-6 text-sm text-ink-500">Your first activity will appear here as a living timeline.</div>
          ) : (
            <div className="mt-5 space-y-0">
              {data.timeline.map((item, index) => (
                <div key={`${item.date}-${item.type}-${item.title}-${index}`} className="relative flex gap-4 pb-5 last:pb-0">
                  <div className="relative flex w-5 shrink-0 justify-center">
                    {index < data.timeline.length - 1 && <span className="absolute top-5 h-full w-px bg-base-700" />}
                    <span className={`relative mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-base-900 ${item.type === 'TASK' ? 'bg-emerald-300' : 'bg-cyan-300'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-ink-100">{item.title}</span>
                      <span className="font-mono text-[10px] uppercase tracking-wide text-ink-700">{formatDate(item.date)}</span>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-ink-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}

function Metric({ label, value, accent }: { label: string; value: number; accent: 'cyan' | 'mint' | 'amber' | 'rose' }) {
  const dot = { cyan: 'bg-cyan-300', mint: 'bg-emerald-300', amber: 'bg-amber-300', rose: 'bg-rose-300' }[accent]
  return <div className="rounded-2xl border border-base-700 bg-base-950/45 p-4"><span className={`inline-block h-2 w-2 rounded-full ${dot}`} /><p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-ink-700">{label}</p><p className="mt-1 font-display text-2xl text-ink-100">{value}</p></div>
}

function Compare({ label, current, previous }: { label: string; current: number; previous: number }) {
  const delta = current - previous
  return <div><div className="flex items-center justify-between text-sm"><span className="text-ink-300">{label}</span><span className={delta > 0 ? 'text-emerald-300' : delta < 0 ? 'text-amber-300' : 'text-ink-700'}>{delta > 0 ? `+${delta}` : delta === 0 ? 'steady' : delta}</span></div><div className="mt-2 flex gap-1"><div className="h-2 flex-1 rounded-full bg-base-800"><div className="h-full rounded-full bg-cyan-300/80" style={{ width: `${Math.min(100, current / 7 * 100)}%` }} /></div><span className="w-7 text-right font-mono text-[10px] text-ink-700">{current}</span></div><p className="mt-1 text-[11px] text-ink-700">Previous: {previous}</p></div>
}

function JourneySkeleton() {
  return <div className="mx-auto max-w-6xl space-y-6"><Skeleton className="h-64 w-full rounded-3xl" /><div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div></div>
}
