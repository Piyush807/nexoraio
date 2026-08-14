import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { ConversationResponse, MessageResponse } from '../../types/conversation'
import { conversationsApi } from '../../api/conversations'
import { MessageBubble } from './MessageBubble'
import { Button } from '../ui/Button'
import { LoadingState } from '../ui/LoadingState'
import { ErrorState } from '../ui/ErrorState'
import { ApiError } from '../../types/common'

export function ChatWindow({ conversation }: { conversation: ConversationResponse }) {
  const [messages, setMessages] = useState<MessageResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = async () => {
    setError(null)
    setMessages(null)
    try {
      const data = await conversationsApi.getMessages(conversation.id)
      setMessages(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load messages.')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    const content = draft.trim()
    if (!content || sending) return

    // Optimistic USER bubble — the backend's response to this call is
    // actually the generated ASSISTANT message (see MessageService).
    const optimisticUser: MessageResponse = {
      id: `pending-${Date.now()}`,
      role: 'USER',
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => (prev ? [...prev, optimisticUser] : [optimisticUser]))
    setDraft('')
    setSending(true)
    try {
      const assistantMessage = await conversationsApi.sendMessage(conversation.id, { content })
      setMessages((prev) => (prev ? [...prev, assistantMessage] : [assistantMessage]))
    } catch (err) {
      setMessages((prev) => prev?.filter((m) => m.id !== optimisticUser.id) ?? null)
      setError(err instanceof ApiError ? err.message : 'The assistant could not reply. Try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-base-700 px-5 py-4">
        <h2 className="font-display text-base text-ink-100">{conversation.title}</h2>
        {conversation.goalId && (
          <p className="mt-0.5 font-mono text-xs text-signal-violetSoft">Linked to a goal</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {messages === null && !error && <LoadingState label="Loading conversation…" />}
        {error && <ErrorState message={error} onRetry={load} />}
        {messages && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-ink-700">
            Send a message to start this conversation.
          </div>
        )}
        {messages && messages.length > 0 && (
          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} pending={m.id.toString().startsWith('pending-')} />
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-base-700 bg-base-800 px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-ink-500"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-base-700 p-4">
        <textarea
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend(e as unknown as FormEvent)
            }
          }}
          placeholder="Ask anything about your goal…"
          className="max-h-32 flex-1 resize-none rounded-lg border border-base-600 bg-base-900 px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 outline-none focus:border-signal-violet"
        />
        <Button type="submit" isLoading={sending} disabled={!draft.trim()}>
          Send
        </Button>
      </form>
    </div>
  )
}
