import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

export default function Conversations() {
  const { conversationId } = useParams<{ conversationId?: string }>()
  const navigate = useNavigate()
  const { push } = useToast()

  const [conversations, setConversations] = useState<ConversationResponse[] | null>(null)
  const [goals, setGoals] = useState<GoalResponse[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    conversationsApi
      .list()
      .then(setConversations)
      .catch(() => setConversations([]))
    goalsApi.list().then(setGoals).catch(() => setGoals([]))
  }, [])

  const active = conversations?.find((c) => c.id === conversationId) ?? null

  const handleCreate = async (title: string, goalId: string) => {
    const conversation = await conversationsApi.create({
      title,
      goalId: goalId || undefined,
    })
    setConversations((prev) => (prev ? [conversation, ...prev] : [conversation]))
    setModalOpen(false)
    navigate(`/conversations/${conversation.id}`)
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] gap-6">
      <div className="hidden w-64 shrink-0 rounded-xl border border-base-700 bg-base-900/50 p-3 sm:flex">
        {conversations === null ? (
          <div className="flex w-full items-center justify-center">
            <LoadingState label="Loading…" />
          </div>
        ) : (
          <ConversationList conversations={conversations} onNew={() => setModalOpen(true)} />
        )}
      </div>

      <div className="min-w-0 flex-1 rounded-xl border border-base-700 bg-base-900/50">
        {!conversationId && (
          <div className="flex h-full items-center justify-center p-6">
            <EmptyState
              title="Pick a conversation, or start a new one"
              description="Each conversation keeps its own history. Link one to a goal so the assistant has that context."
              action={<Button onClick={() => setModalOpen(true)}>New conversation</Button>}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New conversation">
        <NewConversationForm goals={goals} onCreate={handleCreate} onCancel={() => setModalOpen(false)} push={push} />
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
  push,
}: {
  goals: GoalResponse[]
  onCreate: (title: string, goalId: string) => Promise<void>
  onCancel: () => void
  push: (msg: string, kind?: 'success' | 'error' | 'info') => void
}) {
  const [title, setTitle] = useState('')
  const [goalId, setGoalId] = useState('')
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
        <option value="">No goal</option>
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
