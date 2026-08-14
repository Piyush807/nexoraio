import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base-950 px-6 text-center">
      <p className="font-mono text-sm text-signal-violetSoft">404</p>
      <h1 className="font-display text-2xl text-ink-100">This route doesn't map to anything.</h1>
      <p className="text-sm text-ink-500">The page you're looking for doesn't exist or has moved.</p>
      <Link
        to="/"
        className="mt-2 rounded-lg bg-signal-violet px-4 py-2 text-sm font-medium text-white hover:bg-signal-violetSoft"
      >
        Back to Nexora
      </Link>
    </div>
  )
}
