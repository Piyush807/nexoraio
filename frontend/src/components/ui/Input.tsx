import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '../../utils/cn'

interface FieldWrapperProps {
  label?: string
  error?: string
  hint?: string
  id: string
}

const baseFieldClass =
  'w-full min-h-11 rounded-xl border border-base-600 bg-base-900/85 px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:border-cyan-300/60 focus:bg-base-800/90 focus:ring-4 focus:ring-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50'

export const Field = ({ label, error, hint, id, children }: FieldWrapperProps & { children: ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={id} className="text-[11px] font-semibold tracking-[0.08em] text-ink-400">
        {label}
      </label>
    )}
    {children}
    {error && <p className="text-xs text-signal-rose">{error}</p>}
    {!error && hint && <p className="text-xs text-ink-700">{hint}</p>}
  </div>
)

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, Omit<FieldWrapperProps, 'id'> {
  id: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => (
    <Field label={label} error={error} hint={hint} id={id}>
      <input
        ref={ref}
        id={id}
        className={cn(baseFieldClass, error && 'border-signal-rose focus:border-signal-rose', className)}
        {...props}
      />
    </Field>
  ),
)
Input.displayName = 'Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, Omit<FieldWrapperProps, 'id'> {
  id: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className, ...props }, ref) => (
    <Field label={label} error={error} hint={hint} id={id}>
      <textarea
        ref={ref}
        id={id}
        className={cn(baseFieldClass, 'resize-none', error && 'border-signal-rose focus:border-signal-rose', className)}
        {...props}
      />
    </Field>
  ),
)
Textarea.displayName = 'Textarea'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, Omit<FieldWrapperProps, 'id'> {
  id: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, id, className, children, ...props }, ref) => (
    <Field label={label} error={error} hint={hint} id={id}>
      <select
        ref={ref}
        id={id}
        className={cn(baseFieldClass, 'appearance-none cursor-pointer', className)}
        {...props}
      >
        {children}
      </select>
    </Field>
  ),
)
Select.displayName = 'Select'
