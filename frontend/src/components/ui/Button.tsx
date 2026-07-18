import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  isLoading?: boolean
}

export function Button({ variant = 'primary', isLoading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' &&
          'bg-gradient-to-r from-signal-blue to-signal-purple text-white shadow-lg shadow-signal-purple/20 hover:shadow-signal-purple/40 hover:-translate-y-0.5',
        variant === 'secondary' && 'glass text-text-primary hover:bg-white/5',
        variant === 'ghost' && 'text-text-muted hover:text-text-primary',
        variant === 'danger' && 'bg-risk-critical/10 text-risk-critical border border-risk-critical/30 hover:bg-risk-critical/20',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        children
      )}
    </button>
  )
}
