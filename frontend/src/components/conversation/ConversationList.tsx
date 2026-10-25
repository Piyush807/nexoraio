import { NavLink } from 'react-router-dom'
import type { ConversationResponse } from '../../types/conversation'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/formatDate'

export function ConversationList({
  conversations,
  onNew,
  onDelete,
}: {
  conversations: ConversationResponse[]
  onNew: () => void
  onDelete: (conversationId: string) => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1 pb-3">
        <h2 className="font-display text-sm text-ink-100">Conversations</h2>
        <button
          type="button"
          onClick={onNew}
          className="rounded-md p-1.5 text-ink-500 hover:bg-base-800 hover:text-cyan-200"
          aria-label="New conversation"
          title="New conversation"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {conversations.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-ink-700">No conversations yet.</p>
        )}
        <div className="flex flex-col gap-1">
          {conversations.map((c) => (
            <div key={c.id} className="group relative">
              <NavLink
                to={`/conversations/${c.id}`}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col gap-0.5 rounded-lg px-3 py-2.5 pr-8 text-left transition-colors',
                    isActive
                      ? 'bg-cyan-200/10 border border-cyan-200/25'
                      : 'border border-transparent hover:bg-base-800',
                  )
                }
              >
                <span className="truncate text-sm text-ink-100">{c.title}</span>
                <span className="font-mono text-[10px] text-ink-700">{formatDate(c.updatedAt)}</span>
              </NavLink>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onDelete(c.id)
                }}
                aria-label={`Delete ${c.title}`}
                title="Delete conversation"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-700 opacity-0 transition-opacity hover:bg-base-700 hover:text-signal-rose group-hover:opacity-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7h14Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
