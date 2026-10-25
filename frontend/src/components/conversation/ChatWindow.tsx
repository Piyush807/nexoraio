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
  const [showStarters, setShowStarters] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const draftKey = `nexora.chat-draft.v1:${conversation.id}`

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
    try { setDraft(sessionStorage.getItem(draftKey) || '') } catch { /* optional */ }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id, draftKey])

  useEffect(() => {
    try {
      if (draft) sessionStorage.setItem(draftKey, draft)
      else sessionStorage.removeItem(draftKey)
    } catch { /* optional */ }
  }, [draft, draftKey])

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
    try { sessionStorage.removeItem(draftKey) } catch { /* optional */ }
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
      <div className="border-b border-base-700/80 bg-gradient-to-r from-cyan-300/[.045] via-transparent to-emerald-300/[.035] px-5 py-4">
        <div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-base text-ink-100">{conversation.title}</h2>
        {conversation.goalId ? (
          <p className="mt-0.5 font-mono text-xs text-cyan-200">Goal-aware conversation</p>
        ) : (
          <p className="mt-0.5 font-mono text-xs text-signal-mint">All goals context</p>
        )}</div><span className="rounded-full border border-emerald-300/15 bg-emerald-300/[.06] px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-emerald-200/80">AI coach</span></div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {messages === null && !error && <LoadingState label="Loading conversation…" />}
        {error && <ErrorState message={error} onRetry={load} />}
        {messages && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[.07] text-2xl text-cyan-200">✦</div>
            <h3 className="mt-4 font-display text-lg text-ink-100">What do you need right now?</h3>
            <p className="mt-1 max-w-md text-sm leading-5 text-ink-600">Skip the blank page. Pick a starting point or write your own.</p>
            <div className="mt-5 grid w-full max-w-xl gap-2 sm:grid-cols-2">
              {(conversation.goalId ? ['What should I work on next?','Explain the next step simply.','I’m stuck — help me unblock this.','Make me a realistic plan for today.'] : ['Help me choose what to focus on.','Help me turn an idea into a goal.','I’ve fallen behind — help me restart.','Help me reflect on my progress.']).map((prompt)=><button key={prompt} type="button" onClick={()=>{setDraft(prompt);setShowStarters(false)}} className="rounded-xl border border-base-700 bg-base-900/70 px-3 py-3 text-left text-xs text-ink-300 transition hover:border-cyan-300/20 hover:bg-cyan-300/[.04] hover:text-ink-100">{prompt}<span className="ml-2 text-cyan-300">→</span></button>)}
            </div>
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

      <form onSubmit={handleSend} className="border-t border-base-700/80 bg-base-950/55 p-3 sm:p-4">
        {showStarters && messages && messages.length > 0 && <div className="mb-2 flex gap-2 overflow-x-auto no-scrollbar">{['What should I do next?','Explain this simply','I’m stuck','Help me make a plan'].map(prompt=><button key={prompt} type="button" onClick={()=>setDraft(prompt)} className="shrink-0 rounded-full border border-base-700 bg-base-900 px-3 py-1.5 text-[11px] text-ink-500 hover:border-cyan-300/20 hover:text-cyan-200">{prompt}</button>)}</div>}
        <div className="flex items-end gap-2">
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
          aria-label={conversation.goalId ? 'Message your goal coach' : 'Message your Nexora coach'}
          placeholder={conversation.goalId ? 'Ask anything about this goal…' : 'Ask anything across your goals…'}
          className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-base-600 bg-base-900/85 px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 outline-none transition focus:border-cyan-300/60 focus:bg-base-800 focus:ring-4 focus:ring-cyan-300/10"
        />
        <Button type="submit" isLoading={sending} disabled={!draft.trim()}>Send</Button>
        </div>
        <p className="mt-1 px-1 text-[10px] text-ink-700">Enter to send · Shift+Enter for a new line</p>
      </form>
    </div>
  )
}
