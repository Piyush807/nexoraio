import { Link } from 'react-router-dom'
import { NexoraMark } from '../components/layout/Navbar'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth()
  if (!isLoading && isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-base-950">
      <header className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <NexoraMark />
          <span className="font-display text-[17px] font-semibold tracking-tight text-ink-100">Nexora</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link to="/login" className="px-3.5 py-2 text-sm text-ink-300 hover:text-ink-100">
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-signal-violet px-4 py-2 text-sm font-medium text-white shadow-glow hover:bg-signal-violetSoft"
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-fade pointer-events-none" />
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-2 lg:py-32">
          <div className="animate-fadeUp">
            <span className="inline-flex items-center gap-2 rounded-full border border-base-600 bg-base-900 px-3 py-1 font-mono text-xs text-ink-500">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-mint animate-pulseSoft" />
              Goal-aware AI, not a generic chatbot
            </span>
            <h1 className="mt-5 text-balance font-display text-4xl font-semibold leading-[1.08] text-ink-100 sm:text-5xl lg:text-[3.4rem]">
              Turn a goal into a roadmap the AI actually remembers.
            </h1>
            <p className="mt-5 max-w-lg text-balance text-base leading-relaxed text-ink-300">
              Nexora traces one line from your goal to a personalized roadmap, your day-to-day
              progress, and every conversation with your AI assistant — so the advice you get is
              built on what you've actually done, not a blank page.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="rounded-lg bg-signal-violet px-5 py-3 text-sm font-medium text-white shadow-glow hover:bg-signal-violetSoft"
              >
                Create your first goal
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-base-600 px-5 py-3 text-sm font-medium text-ink-300 hover:border-signal-violet/50 hover:text-ink-100"
              >
                Sign in
              </Link>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-base-700 pt-6">
              {[
                ['4', 'linked domains'],
                ['1', 'source of truth'],
                ['24/7', 'context-aware AI'],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl text-ink-100">{value}</dt>
                  <dd className="mt-1 font-mono text-xs uppercase tracking-wide text-ink-700">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <TraceDiagram />
        </div>
      </section>

      {/* Feature strip — mirrors the actual domain spine, nothing invented */}
      <section className="mx-auto max-w-[1400px] border-t border-base-700 px-4 py-16 md:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-signal-violetSoft">The spine</p>
        <h2 className="mt-2 font-display text-2xl text-ink-100 sm:text-3xl">
          Goal → Roadmap → Progress → Conversation
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group rounded-xl border border-base-700 bg-base-900/60 p-5 transition-colors hover:border-signal-violet/40"
            >
              <span className="font-mono text-xs text-ink-700">0{i + 1}</span>
              <h3 className="mt-3 font-display text-base text-ink-100">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-base-700 px-4 py-8 md:px-6">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 text-xs text-ink-700 sm:flex-row">
          <span>© {new Date().getFullYear()} Nexora</span>
              <span className="font-mono">Built with Spring Boot, PostgreSQL, and Gemini</span>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: 'Goal',
    body: 'Set a title, your current level, target date, and daily study hours — the inputs the AI reasons from.',
  },
  {
    title: 'Roadmap',
    body: 'Gemini generates structured milestones and skills for that goal, stored in Nexora, not in the prompt window.',
  },
  {
    title: 'Progress',
    body: 'Log entries and completed tasks against your roadmap to build a real record over time.',
  },
  {
    title: 'Conversation',
    body: 'Chat with persistent history, so a question today can build on what you asked last week.',
  },
]

function TraceDiagram() {
  const nodes = [
    { label: 'GOAL', x: 40, y: 40 },
    { label: 'ROADMAP', x: 260, y: 120 },
    { label: 'PROGRESS', x: 40, y: 200 },
    { label: 'CONVERSATION', x: 260, y: 280 },
  ]
  return (
    <div className="relative mx-auto w-full max-w-md animate-fadeUp [animation-delay:150ms]">
      <svg viewBox="0 0 380 340" className="w-full" role="img" aria-label="Diagram of Goal, Roadmap, Progress, and Conversation connected in sequence">
        <path
          d="M60 50 L280 130 L60 210 L280 290"
          fill="none"
          stroke="#232838"
          strokeWidth="2"
        />
        <path
          d="M60 50 L280 130 L60 210 L280 290"
          fill="none"
          stroke="#6C5CE7"
          strokeWidth="2"
          strokeDasharray="620"
          strokeDashoffset="620"
          className="animate-dash"
        />
        {nodes.map((n, i) => (
          <g key={n.label} transform={`translate(${n.x},${n.y})`}>
            <circle
              r="20"
              fill="#12161F"
              stroke={i === 3 ? '#3DDC97' : '#6C5CE7'}
              strokeWidth="2"
            />
            <circle r="4" fill={i === 3 ? '#3DDC97' : '#8A7CF0'} />
          </g>
        ))}
        {nodes.map((n) => (
          <text
            key={n.label}
            x={n.x}
            y={n.y + 40}
            textAnchor="middle"
            className="fill-ink-300"
            style={{ font: '600 11px "JetBrains Mono", monospace', letterSpacing: '0.04em' }}
          >
            {n.label}
          </text>
        ))}
      </svg>
    </div>
  )
}
