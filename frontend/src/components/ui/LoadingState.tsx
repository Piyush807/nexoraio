export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-500">
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-full border-2 border-base-600" />
        <div className="absolute inset-0 rounded-full border-2 border-cyan-300 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulseSoft rounded-md bg-base-800 ${className}`} />
}
