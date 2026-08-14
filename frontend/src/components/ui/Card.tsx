import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-base-700 bg-base-900/70 backdrop-blur-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
