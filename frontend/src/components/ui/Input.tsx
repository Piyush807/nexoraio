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
  'w-full rounded-lg bg-base-900 border border-base-600 px-3.5 py-2.5 text-sm text-ink-100 placeholder:text-ink-700 outline-none transition-colors focus:border-signal-violet disabled:opacity-50'

export const Field = ({ label, error, hint, id, children }: FieldWrapperProps & { children: ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={id} className="text-xs font-medium tracking-wide text-ink-300 uppercase font-mono">
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
