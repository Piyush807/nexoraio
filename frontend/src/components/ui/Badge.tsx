import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Tone = 'violet' | 'mint' | 'amber' | 'rose' | 'neutral'

const toneClasses: Record<Tone, string> = {
  violet: 'bg-signal-violet/10 text-signal-violetSoft border-signal-violet/30',
  mint: 'bg-signal-mint/10 text-signal-mint border-signal-mint/30',
  amber: 'bg-signal-amber/10 text-signal-amber border-signal-amber/30',
  rose: 'bg-signal-rose/10 text-signal-rose border-signal-rose/30',
  neutral: 'bg-base-800 text-ink-300 border-base-600',
}

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium',
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  )
}
