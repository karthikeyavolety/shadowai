import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  GitFork,
  Globe,
  Contact,
  Network,
  Skull,
  MessagesSquare,
  ShieldCheck,
  History,
  Settings,
  LogOut,
  ShieldHalf,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resume', label: 'Resume Analyzer', icon: FileText },
  { to: '/github', label: 'GitHub Scanner', icon: GitFork, comingSoon: true },
  { to: '/portfolio', label: 'Portfolio Scanner', icon: Globe, comingSoon: true },
  { to: '/linkedin', label: 'LinkedIn Scanner', icon: Contact, comingSoon: true },
  { to: '/footprint-map', label: 'Footprint Map', icon: Network, comingSoon: true },
  { to: '/attack-simulation', label: 'Attack Simulation', icon: Skull, comingSoon: true },
  { to: '/privacy-coach', label: 'Privacy Coach', icon: MessagesSquare, comingSoon: true },
  { to: '/safe-resume', label: 'Safe Resume', icon: ShieldCheck, comingSoon: true },
  { to: '/history', label: 'History', icon: History, comingSoon: true },
]

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-base bg-grid">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border-glass p-5 lg:flex">
          <Link to="/" className="mb-8 flex items-center gap-2 px-1">
            <ShieldHalf className="h-6 w-6 text-signal-blue" strokeWidth={2.2} />
            <span className="font-display text-lg font-semibold text-text-primary">ShadowAI</span>
          </Link>

          <nav className="flex flex-1 flex-col gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, comingSoon }) => {
              const active = location.pathname === to
              return (
                <Link
                  key={to}
                  to={comingSoon ? '#' : to}
                  onClick={(e) => comingSoon && e.preventDefault()}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-gradient-to-r from-signal-blue/15 to-signal-purple/15 text-text-primary'
                      : comingSoon
                      ? 'text-text-muted/50 cursor-not-allowed'
                      : 'text-text-muted hover:bg-white/5 hover:text-text-primary'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    {label}
                  </span>
                  {comingSoon && (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-wide text-text-muted/70">
                      Soon
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-1 border-t border-border-glass pt-4">
            <Link
              to="/settings"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-text-muted hover:bg-white/5 hover:text-text-primary"
            >
              <Settings className="h-4 w-4" strokeWidth={2} />
              Settings
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-text-muted hover:bg-risk-critical/10 hover:text-risk-critical"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
              Log out
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border-glass bg-base/80 px-6 py-4 backdrop-blur-md lg:px-8">
            <div>
              <p className="text-xs text-text-muted">Signed in as</p>
              <p className="text-sm font-medium text-text-primary">{user?.name}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-signal-blue to-signal-purple font-display text-sm font-semibold text-white">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </header>
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
