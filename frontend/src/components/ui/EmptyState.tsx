import type { ReactNode } from 'react'

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-base-600 bg-base-900/35 px-6 py-12 text-center">
    {icon ? <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[.06] text-cyan-200">{icon}</div> : <div className="mb-4 h-1.5 w-10 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" />}
    <h3 className="font-display text-lg font-semibold text-ink-100">{title}</h3>
    {description && <p className="mt-2 max-w-md text-sm leading-6 text-ink-500">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
}
