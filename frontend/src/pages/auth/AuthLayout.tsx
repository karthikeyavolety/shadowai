import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShieldHalf } from 'lucide-react'

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-base bg-grid px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-signal-blue/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-signal-purple/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <ShieldHalf className="h-7 w-7 text-signal-blue" strokeWidth={2.2} />
          <span className="font-display text-xl font-semibold text-text-primary">ShadowAI</span>
        </Link>

        <div className="glass rounded-2xl p-8">
          <h1 className="font-display text-2xl font-semibold text-text-primary">{title}</h1>
          <p className="mt-1.5 mb-6 text-sm text-text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
