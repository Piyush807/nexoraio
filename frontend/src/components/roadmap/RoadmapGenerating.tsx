import { useEffect, useState } from 'react'

const stages = [
  'Analyzing your goal…',
  'Mapping required skills…',
  'Sequencing milestones…',
  'Structuring your roadmap…',
]

export function RoadmapGenerating() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setStage((s) => Math.min(s + 1, stages.length - 1))
    }, 1400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-xl border border-base-700 bg-base-900/60 py-20 px-6 text-center">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-base-600" />
        <div className="absolute inset-0 rounded-full border-2 border-cyan-200 border-t-transparent animate-spin" />
        <div className="absolute inset-3 rounded-full bg-cyan-200/10 animate-pulseSoft" />
      </div>
      <div>
        <p className="font-mono text-sm text-cyan-200">{stages[stage]}</p>
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {stages.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= stage ? 'w-6 bg-cyan-200' : 'w-1.5 bg-base-600'
              }`}
            />
          ))}
        </div>
      </div>
      <p className="max-w-sm text-xs text-ink-700">
        Nexora is building a structured roadmap from your goal. This usually takes a few seconds.
      </p>
    </div>
  )
}
