import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { goalsApi } from '../api/goals'
import { conversationsApi } from '../api/conversations'
import { progressApi } from '../api/progress'
import type { GoalResponse } from '../types/goal'
import type { ConversationResponse } from '../types/conversation'
import type { ProgressEntryResponse } from '../types/progress'
import { GoalCard } from '../components/goals/GoalCard'
import { DailyCoachCard } from '../components/progress/DailyCoachCard'
import { ProgressChart } from '../components/progress/ProgressChart'
import { StreakWidget } from '../components/progress/StreakWidget'
import { InactivityBanner } from '../components/progress/InactivityBanner'
import { GoalMomentumCard } from '../components/progress/GoalMomentumCard'
import { NextActionCard } from '../components/progress/NextActionCard'
import { GrowthMemoryCard } from '../components/progress/GrowthMemoryCard'
import { DailyIntelligenceCard } from '../components/progress/DailyIntelligenceCard'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/LoadingState'
import { formatDate } from '../utils/formatDate'

export default function Dashboard() {
  const [goals, setGoals] = useState<GoalResponse[] | null>(null)
  const [conversations, setConversations] = useState<ConversationResponse[] | null>(null)
  const [focusEntries, setFocusEntries] = useState<ProgressEntryResponse[] | null>(null)
  const [lastEntryDate, setLastEntryDate] = useState<string | null>(null)

  useEffect(() => {
    goalsApi.list().then(setGoals).catch(() => setGoals([]))
    conversationsApi.list().then(setConversations).catch(() => setConversations([]))
    progressApi.streak().then((streak) => setLastEntryDate(streak.lastEntryDate)).catch(() => setLastEntryDate(null))
  }, [])

  const activeGoals = goals?.filter((g) => g.status === 'ACTIVE') ?? []
  // Spotlight the goal that most needs attention: soonest target date first,
  // then most recently updated. This keeps the home screen action-oriented
  // instead of simply mirroring database order.
  const focusGoal =
    activeGoals.length > 0
      ? [...activeGoals].sort((a, b) => {
          const aDate = new Date(`${a.targetDate}T00:00:00`).getTime()
          const bDate = new Date(`${b.targetDate}T00:00:00`).getTime()
          const aValid = Number.isFinite(aDate)
          const bValid = Number.isFinite(bDate)
          if (aValid && bValid && aDate !== bDate) return aDate - bDate
          return b.updatedAt.localeCompare(a.updatedAt)
        })[0]
      : null

  useEffect(() => {
    if (!focusGoal) {
      setFocusEntries(null)
      return
    }
    progressApi
      .list(focusGoal.id)
      .then(setFocusEntries)
      .catch(() => setFocusEntries([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusGoal?.id])

  return (
    <div className="nexora-page nexora-page-dashboard">
      <div className="relative overflow-hidden rounded-[28px] border border-cyan-200/10 bg-gradient-to-br from-cyan-200/[.07] via-base-900/65 to-emerald-200/[.035] p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-300/[.08] blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="nexora-kicker text-cyan-200/75">Today</p>
            <h1 className="mt-2 max-w-2xl font-display text-3xl font-semibold leading-tight text-ink-100 sm:text-4xl">
              Make today count.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink-400">Your path is ready. Choose one useful step and let the rest wait.</p>
          </div>
          {focusGoal && <Link to={`/goals/${focusGoal.id}`} className="shrink-0 text-sm font-semibold text-cyan-200 hover:text-cyan-100">Open focus goal →</Link>}
        </div>
      </div>

      <InactivityBanner lastEntryDate={lastEntryDate} focusGoalId={focusGoal?.id} />

      <section className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="Quick actions">
        <Link to="/goals" className="nexora-action nexora-sheen group min-h-0 border-amber-300/10 bg-gradient-to-br from-amber-300/[.07] to-base-900/70">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-300/10 text-amber-200"><PlusIcon /></span>
          <span className="mt-3 block font-display text-sm font-semibold text-ink-100">Create a goal</span>
          <span className="mt-1 block text-xs leading-5 text-ink-600">Turn something you want into a path.</span>
        </Link>
        <Link to="/conversations" className="nexora-action nexora-sheen group min-h-0 border-cyan-300/10 bg-gradient-to-br from-cyan-300/[.07] to-base-900/70">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200"><ChatIcon /></span>
          <span className="mt-3 block font-display text-sm font-semibold text-ink-100">Talk to your coach</span>
          <span className="mt-1 block text-xs leading-5 text-ink-600">Ask what to do, learn, restart or reflect.</span>
        </Link>
        <Link to="/journey" className="nexora-action nexora-sheen group min-h-0 border-emerald-300/10 bg-gradient-to-br from-emerald-300/[.07] to-base-900/70">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-200"><JourneyIcon /></span>
          <span className="mt-3 block font-display text-sm font-semibold text-ink-100">See your journey</span>
          <span className="mt-1 block text-xs leading-5 text-ink-600">Review your rhythm and recent growth.</span>
        </Link>
      </section>

      <DailyIntelligenceCard />
      <GrowthMemoryCard />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StreakWidget />
        <StatCard label="Active goals" value={goals === null ? null : String(activeGoals.length)} tone="cyan" />
        <StatCard
          label="Conversations"
          value={conversations === null ? null : String(conversations.length)}
          tone="amber"
        />
      </div>

      {focusGoal && (
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink-100">Today's focus</h2>
            <Link
              to={`/goals/${focusGoal.id}`}
              className="text-sm text-cyan-200 hover:underline"
            >
              {focusGoal.title} →
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <NextActionCard goal={focusGoal} />
            <GoalMomentumCard goal={focusGoal} />
            <Card className="p-6">
              <h3 className="font-display text-base text-ink-100">Daily coach</h3>
              <div className="mt-3">
                <DailyCoachCard goalId={focusGoal.id} />
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-base text-ink-100">Progress trend</h3>
              <div className="mt-3">
                {focusEntries === null ? (
                  <Skeleton className="h-40" />
                ) : (
                  <ProgressChart entries={focusEntries} />
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-lg text-ink-100">Your goals</h2>
        <Link to="/goals" className="text-sm text-cyan-200 hover:underline">
          View all
        </Link>
      </div>

      <div className="mt-4">
        {goals === null && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        )}
        {goals?.length === 0 && (
          <EmptyState
            title="No goals yet"
            description="A goal is the starting point for everything in Nexora — the roadmap, progress, and AI context all build from it."
            action={
              <Link to="/goals"><Button>Create your first goal</Button></Link>
            }
          />
        )}
        {goals && goals.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.slice(0, 3).map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-lg text-ink-100">Recent conversations</h2>
        <Link to="/conversations" className="text-sm text-cyan-200 hover:underline">
          Open AI chat
        </Link>
      </div>

      <div className="mt-4">
        {conversations === null && (
          <div className="flex flex-col gap-2">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        )}
        {conversations?.length === 0 && (
          <EmptyState
            title="No conversations yet"
            description="Start a chat with your AI assistant — it can be tied to a specific goal for context."
            action={<Link to="/conversations"><Button>Start a conversation</Button></Link>}
          />
        )}
        {conversations && conversations.length > 0 && (
          <div className="flex flex-col divide-y divide-base-700 rounded-xl border border-base-700 bg-base-900/60">
            {conversations.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                to={`/conversations/${c.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3.5 text-sm hover:bg-base-800/60"
              >
                <span className="truncate text-ink-100">{c.title}</span>
                <span className="shrink-0 font-mono text-xs text-ink-700">{formatDate(c.updatedAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, tone = 'mint' }: { label: string; value: string | null; tone?: 'mint' | 'cyan' | 'amber' }) {
  const tones = { mint: 'bg-emerald-300/10 text-emerald-200', cyan: 'bg-cyan-300/10 text-cyan-200', amber: 'bg-amber-300/10 text-amber-200' }
  return (
    <Card className="relative overflow-hidden p-5">
      <span className={`absolute right-4 top-4 h-2 w-2 rounded-full ${tones[tone].split(' ')[0]}`} />
      <p className="font-mono text-xs uppercase tracking-wide text-ink-700">{label}</p>
      {value === null ? (
        <Skeleton className="mt-2 h-7 w-12" />
      ) : (
        <p className="mt-1 font-display text-2xl text-ink-100">{value}</p>
      )}
    </Card>
  )
}

function PlusIcon(){return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>}
function ChatIcon(){return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 11.5a7.5 7.5 0 0 1-11.3 6.5L4 19.5l1.2-4A7.5 7.5 0 1 1 20 11.5Z" stroke="currentColor" strokeWidth="1.7"/></svg>}
function JourneyIcon(){return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 17.5 9 12l3 3 7-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
