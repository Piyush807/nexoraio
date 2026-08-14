import type { MessageResponse } from '../../types/conversation'
import { formatTime } from '../../utils/formatDate'
import { cn } from '../../utils/cn'

export function MessageBubble({ message, pending }: { message: MessageResponse; pending?: boolean }) {
  const isUser = message.role === 'USER'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex max-w-[80%] flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-signal-violet text-white rounded-br-sm'
              : 'bg-base-800 text-ink-100 border border-base-700 rounded-bl-sm',
            pending && 'opacity-60',
          )}
        >
          {message.content}
        </div>
        <span className="px-1 font-mono text-[10px] text-ink-700">
          {pending ? 'Sending…' : formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  )
}
