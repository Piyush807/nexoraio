import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { goalsApi } from '../api/goals'
import { conversationsApi } from '../api/conversations'
import type { GoalResponse } from '../types/goal'
import type { ConversationResponse } from '../types/conversation'
import { useAuth } from '../hooks/useAuth'
import { GoalCard } from '../components/goals/GoalCard'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/LoadingState'
import { formatDate } from '../utils/formatDate'

export default function Dashboard() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<GoalResponse[] | null>(null)
  const [conversations, setConversations] = useState<ConversationResponse[] | null>(null)

  useEffect(() => {
    goalsApi.list().then(setGoals).catch(() => setGoals([]))
    conversationsApi.list().then(setConversations).catch(() => setConversations([]))
  }, [])

  const activeGoals = goals?.filter((g) => g.status === 'ACTIVE') ?? []
  const firstName = user?.email?.split('@')[0]

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-100">
        Welcome back{firstName ? `, ${firstName}` : ''}
      </h1>
      <p className="mt-1 text-sm text-ink-500">Here's where your goals and conversations stand.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active goals" value={goals === null ? null : String(activeGoals.length)} />
        <StatCard label="Total goals" value={goals === null ? null : String(goals.length)} />
        <StatCard
          label="Conversations"
          value={conversations === null ? null : String(conversations.length)}
        />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display text-lg text-ink-100">Your goals</h2>
        <Link to="/goals" className="text-sm text-signal-violetSoft hover:underline">
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
              <Button onClick={() => (window.location.href = '/goals')}>Create your first goal</Button>
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
        <Link to="/conversations" className="text-sm text-signal-violetSoft hover:underline">
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

function StatCard({ label, value }: { label: string; value: string | null }) {
  return (
    <Card className="p-5">
      <p className="font-mono text-xs uppercase tracking-wide text-ink-700">{label}</p>
      {value === null ? (
        <Skeleton className="mt-2 h-7 w-12" />
      ) : (
        <p className="mt-1 font-display text-2xl text-ink-100">{value}</p>
      )}
    </Card>
  )
}
