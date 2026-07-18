import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as authApi from '../lib/api/auth'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function refreshUser() {
    const token = localStorage.getItem('shadowai_access_token')
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }
    try {
      const me = await authApi.getMe()
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login(email: string, password: string) {
    const tokens = await authApi.login(email, password)
    localStorage.setItem('shadowai_access_token', tokens.access_token)
    localStorage.setItem('shadowai_refresh_token', tokens.refresh_token)
    setUser(tokens.user)
  }

  async function signup(name: string, email: string, password: string) {
    const tokens = await authApi.signup(name, email, password)
    localStorage.setItem('shadowai_access_token', tokens.access_token)
    localStorage.setItem('shadowai_refresh_token', tokens.refresh_token)
    setUser(tokens.user)
  }

  function logout() {
    localStorage.removeItem('shadowai_access_token')
    localStorage.removeItem('shadowai_refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
