import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { conversationsApi } from '../api/conversations'
import { goalsApi } from '../api/goals'
import type { ConversationResponse } from '../types/conversation'
import type { GoalResponse } from '../types/goal'
import { ConversationList } from '../components/conversation/ConversationList'
import { ChatWindow } from '../components/conversation/ChatWindow'
import { Modal } from '../components/ui/Modal'
import { Input, Select } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { ApiError } from '../types/common'
import { useToast } from '../components/ui/Toast'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'

export default function Conversations() {
  const { conversationId } = useParams<{ conversationId?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { push } = useToast()

  const [conversations, setConversations] = useState<ConversationResponse[] | null>(null)
  const [goals, setGoals] = useState<GoalResponse[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [requestedGoalId, setRequestedGoalId] = useState('')

  useEffect(() => {
    const goalId = new URLSearchParams(location.search).get('goalId')
    if (goalId && !conversationId) {
      setRequestedGoalId(goalId)
      setModalOpen(true)
    }
  }, [location.search, conversationId])

  useEffect(() => {
    conversationsApi
      .list()
      .then(setConversations)
      .catch(() => setConversations([]))
    goalsApi.list().then(setGoals).catch(() => setGoals([]))
  }, [])

  const active = conversations?.find((c) => c.id === conversationId) ?? null
  const filteredConversations = useMemo(() => {
    if (!conversations) return []
    const query = search.trim().toLowerCase()
    if (!query) return conversations
    return conversations.filter((conversation) => conversation.title.toLowerCase().includes(query))
  }, [conversations, search])

  const handleCreate = async (title: string, goalId: string) => {
    const conversation = await conversationsApi.create({
      title,
      goalId: goalId || undefined,
    })
    setConversations((prev) => (prev ? [conversation, ...prev] : [conversation]))
    setModalOpen(false)
    navigate(`/conversations/${conversation.id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await conversationsApi.remove(id)
      setConversations((prev) => (prev ? prev.filter((c) => c.id !== id) : prev))
      push('Conversation deleted.', 'success')
      setDeleteId(null)
      if (conversationId === id) navigate('/conversations')
    } catch (err) {
      push(err instanceof ApiError ? err.message : 'Could not delete the conversation.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="nexora-page nexora-page-conversations flex h-[calc(100vh-9rem)] gap-6">
      <div className="hidden w-64 shrink-0 rounded-xl border border-base-700 bg-base-900/50 p-3 sm:flex">
        {conversations === null ? (
          <div className="flex w-full items-center justify-center">
            <LoadingState label="Loading…" />
          </div>
        ) : (
          <>
            <div className="mb-3"><Input id="conversation-search" aria-label="Search conversations" type="search" placeholder="Search conversations…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <ConversationList conversations={filteredConversations} onNew={() => { setRequestedGoalId(''); setModalOpen(true) }} onDelete={(id) => setDeleteId(id)} />
          </>
        )}
      </div>

      <div className="min-w-0 flex-1 rounded-xl border border-base-700 bg-base-900/50">
        {conversations && conversations.length > 0 && (
          <div className="flex gap-2 overflow-x-auto border-b border-base-700 p-2 no-scrollbar sm:hidden" aria-label="Conversation switcher">
            {conversations.map((conversation) => (
              <button key={conversation.id} type="button" onClick={() => navigate(`/conversations/${conversation.id}`)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${conversation.id === conversationId ? 'border-cyan-200/40 bg-cyan-200/10 text-ink-100' : 'border-base-700 text-ink-500'}`}>
                {conversation.goalId ? conversation.title : `◎ ${conversation.title}`}
              </button>
            ))}
          </div>
        )}
        {!conversationId && (
          <div className="flex h-full items-center justify-center p-6">
            <EmptyState
              title="Pick a conversation, or start a new one"
              description="Each conversation keeps its own history. Choose a goal for focused coaching, or use All goals for a broader growth conversation."
              action={<Button onClick={() => { setRequestedGoalId(''); setModalOpen(true) }}>New conversation</Button>}
            />
          </div>
        )}
        {conversationId && active && <ChatWindow conversation={active} />}
        {conversationId && conversations !== null && !active && (
          <div className="flex h-full items-center justify-center p-6">
            <EmptyState title="Conversation not found" description="It may have been deleted." />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete conversation?"
        message="This conversation and its message history will be removed. This action cannot be undone."
        confirmLabel="Delete conversation"
        danger
        loading={!!deleteId && deletingId === deleteId}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setRequestedGoalId(''); if (location.search) navigate('/conversations', { replace: true }) }} title="New conversation">
        <NewConversationForm goals={goals} initialGoalId={requestedGoalId} onCreate={handleCreate} onCancel={() => { setModalOpen(false); setRequestedGoalId(''); if (location.search) navigate('/conversations', { replace: true }) }} push={push} />
      </Modal>

      {/* Mobile conversation switcher */}
      {!conversationId && (
        <div className="fixed inset-x-4 bottom-4 sm:hidden">
          <Button className="w-full" onClick={() => setModalOpen(true)}>
            + New conversation
          </Button>
        </div>
      )}
    </div>
  )
}

function NewConversationForm({
  goals,
  onCreate,
  onCancel,
  initialGoalId,
  push,
}: {
  goals: GoalResponse[]
  onCreate: (title: string, goalId: string) => Promise<void>
  onCancel: () => void
  initialGoalId?: string
  push: (msg: string, kind?: 'success' | 'error' | 'info') => void
}) {
  const [title, setTitle] = useState('Coaching session')
  const [goalId, setGoalId] = useState(initialGoalId || '')
  const initialGoal = goals.find((goal) => goal.id === initialGoalId)

  useEffect(() => {
    if (initialGoalId) setGoalId(initialGoalId)
    if (initialGoal && !title) setTitle(`Coaching: ${initialGoal.title}`)
  }, [initialGoalId, initialGoal, title])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Give the conversation a title.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await onCreate(title.trim(), goalId)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not start the conversation.'
      setError(message)
      push(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="conv-title"
        label="Title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Java fundamentals"
      />
      <Select
        id="conv-goal"
        label="Link to a goal (optional)"
        value={goalId}
        onChange={(e) => setGoalId(e.target.value)}
      >
        <option value="">All goals / general</option>
        {goals.map((g) => (
          <option key={g.id} value={g.id}>
            {g.title}
          </option>
        ))}
      </Select>
      {error && <p className="text-xs text-signal-rose">{error}</p>}
      <div className="mt-1 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={submitting}>
          Start conversation
        </Button>
      </div>
    </form>
  )
}
