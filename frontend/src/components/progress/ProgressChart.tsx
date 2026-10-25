import { useMemo, useState } from 'react'
import type { ProgressEntryResponse } from '../../types/progress'
import { formatDate } from '../../utils/formatDate'

type Metric = 'growthScore' | 'completedMilestones' | 'completedTasks'

const METRICS: { key: Metric; label: string; max: number | null }[] = [
  { key: 'growthScore', label: 'Growth score', max: 10 },
  { key: 'completedMilestones', label: 'Milestones', max: null },
  { key: 'completedTasks', label: 'Tasks', max: null },
]

const WIDTH = 640
const HEIGHT = 160
const PAD_X = 12
const PAD_Y = 16

export function ProgressChart({ entries }: { entries: ProgressEntryResponse[] }) {
  const [metric, setMetric] = useState<Metric>('growthScore')
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const points = useMemo(() => {
    return [...entries]
      .filter((e) => e[metric] !== null && e[metric] !== undefined)
      .sort((a, b) => a.entryDate.localeCompare(b.entryDate))
  }, [entries, metric])

  if (entries.length === 0) {
    return <p className="text-sm text-ink-500">No progress entries yet — log one to start tracking trends.</p>
  }

  if (points.length === 0) {
    return (
      <p className="text-sm text-ink-500">
        No entries have a value for this metric yet. Try logging progress with a {metric === 'growthScore' ? 'growth score' : 'count'} set.
      </p>
    )
  }

  const activeMetricDef = METRICS.find((m) => m.key === metric)!
  const values = points.map((p) => Number(p[metric]))
  const dataMax = Math.max(...values, activeMetricDef.max ?? 0, 1)
  const dataMin = Math.min(...values, 0)

  const xFor = (i: number) =>
    points.length === 1
      ? WIDTH / 2
      : PAD_X + (i / (points.length - 1)) * (WIDTH - PAD_X * 2)
  const yFor = (v: number) => {
    const range = dataMax - dataMin || 1
    return HEIGHT - PAD_Y - ((v - dataMin) / range) * (HEIGHT - PAD_Y * 2)
  }

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(Number(p[metric]))}`).join(' ')
  const areaPath = `${linePath} L ${xFor(points.length - 1)} ${HEIGHT - PAD_Y} L ${xFor(0)} ${HEIGHT - PAD_Y} Z`

  const hovered = hoverIdx !== null ? points[hoverIdx] : null

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {METRICS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => {
              setMetric(m.key)
              setHoverIdx(null)
            }}
            className={
              'rounded-full border px-2.5 py-1 text-xs font-mono transition-colors ' +
              (metric === m.key
                ? 'border-cyan-200/60 bg-cyan-200/10 text-cyan-200'
                : 'border-base-700 text-ink-500 hover:text-ink-100')
            }
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="relative mt-4">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(139 92 246)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="rgb(139 92 246)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* baseline */}
          <line x1={PAD_X} y1={HEIGHT - PAD_Y} x2={WIDTH - PAD_X} y2={HEIGHT - PAD_Y} stroke="rgb(63 63 70)" strokeWidth="1" />

          <path d={areaPath} fill="url(#progressFill)" stroke="none" />
          <path d={linePath} fill="none" stroke="rgb(167 139 250)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {points.map((p, i) => (
            <circle
              key={p.id}
              cx={xFor(i)}
              cy={yFor(Number(p[metric]))}
              r={hoverIdx === i ? 5 : 3}
              fill={hoverIdx === i ? 'rgb(167 139 250)' : 'rgb(24 24 27)'}
              stroke="rgb(167 139 250)"
              strokeWidth="1.5"
              onMouseEnter={() => setHoverIdx(i)}
              className="cursor-pointer transition-all"
            />
          ))}

          {/* invisible wider hit targets so hover works on small screens */}
          {points.map((p, i) => (
            <rect
              key={`${p.id}-hit`}
              x={xFor(i) - (WIDTH / points.length) / 2}
              y={0}
              width={WIDTH / points.length}
              height={HEIGHT}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
            />
          ))}
        </svg>

        <div className="mt-1 flex justify-between font-mono text-[10px] text-ink-700">
          <span>{formatDate(points[0].entryDate)}</span>
          {points.length > 1 && <span>{formatDate(points[points.length - 1].entryDate)}</span>}
        </div>
      </div>

      <div className="mt-3 flex h-10 items-center gap-3 rounded-lg border border-base-700 bg-base-950/40 px-3.5 text-sm">
        {hovered ? (
          <>
            <span className="font-mono text-ink-700">{formatDate(hovered.entryDate)}</span>
            <span className="text-ink-100">
              {activeMetricDef.label}: {String(hovered[metric])}
            </span>
            {hovered.note && <span className="truncate text-ink-500">— {hovered.note}</span>}
          </>
        ) : (
          <span className="text-ink-700">Hover a point to see details</span>
        )}
      </div>
    </div>
  )
}
