import { NavLink } from 'react-router-dom'
import type { ConversationResponse } from '../../types/conversation'
import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/formatDate'

export function ConversationList({
  conversations,
  onNew,
}: {
  conversations: ConversationResponse[]
  onNew: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-1 pb-3">
        <h2 className="font-display text-sm text-ink-100">Conversations</h2>
        <button
          onClick={onNew}
          className="rounded-md p-1.5 text-ink-500 hover:bg-base-800 hover:text-signal-violetSoft"
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
            <NavLink
              key={c.id}
              to={`/conversations/${c.id}`}
              className={({ isActive }) =>
                cn(
                  'flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors',
                  isActive
                    ? 'bg-signal-violet/10 border border-signal-violet/30'
                    : 'border border-transparent hover:bg-base-800',
                )
              }
            >
              <span className="truncate text-sm text-ink-100">{c.title}</span>
              <span className="font-mono text-[10px] text-ink-700">{formatDate(c.updatedAt)}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}
