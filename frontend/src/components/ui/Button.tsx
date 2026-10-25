import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'border border-cyan-200/20 bg-gradient-to-r from-cyan-200 via-cyan-300 to-cyan-200 text-slate-950 shadow-[0_16px_42px_-22px_rgba(34,211,238,.95)] hover:from-cyan-100 hover:via-cyan-200 hover:to-cyan-100 hover:shadow-[0_18px_46px_-20px_rgba(34,211,238,.95)]',
  secondary:
    'border border-white/[.10] bg-white/[.045] text-ink-100 hover:border-cyan-200/30 hover:bg-white/[.075]',
  soft:
    'border border-cyan-200/15 bg-cyan-200/[.07] text-cyan-100 hover:border-cyan-200/30 hover:bg-cyan-200/[.12]',
  ghost: 'border border-transparent bg-transparent text-ink-400 hover:border-white/[.08] hover:bg-white/[.035] hover:text-ink-100',
  danger: 'border border-signal-rose/30 bg-signal-rose/10 text-rose-100 hover:bg-signal-rose/16 hover:border-signal-rose/45',
}

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-9 px-3 text-xs rounded-lg gap-2',
  md: 'min-h-11 px-4 text-sm rounded-xl gap-2',
  lg: 'min-h-12 px-5 text-sm rounded-xl gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className, children, disabled, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center font-semibold tracking-[-0.01em] transition-[background-color,border-color,box-shadow,color,transform] duration-200',
        'disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none',
        'active:translate-y-px',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-base-950',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {isLoading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
          <path className="opacity-90" fill="currentColor" d="M12 3a9 9 0 0 1 8.5 6h-2.7A6.5 6.5 0 0 0 12 5.5V3Z" />
        </svg>
      )}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
