import type { InputHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import clsx from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className, id, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={clsx(
          'rounded-xl border border-border-glass bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60',
          'focus:border-signal-blue/60 focus:outline-none focus:ring-2 focus:ring-signal-blue/20',
          error && 'border-risk-critical/60 focus:border-risk-critical focus:ring-risk-critical/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-risk-critical">{error}</p>}
    </div>
  )
})
Input.displayName = 'Input'
