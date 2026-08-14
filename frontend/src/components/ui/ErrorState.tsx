import { Button } from './Button'

export function ErrorState({
  message = 'Something went wrong. Try again.',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-signal-rose/25 bg-signal-rose/5 py-14 px-6 text-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-signal-rose">
        <path
          d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 004 21h16a2 2 0 001.89-2.96L13.71 3.86a2 2 0 00-3.42 0z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="max-w-sm text-sm text-ink-300">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
