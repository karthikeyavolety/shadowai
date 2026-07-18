import { api } from './client'
import type { ApiEnvelope, TokenPair, User } from '../../types'

export async function signup(name: string, email: string, password: string) {
  const res = await api.post<ApiEnvelope<TokenPair>>('/auth/signup', { name, email, password })
  return res.data.data
}

export async function login(email: string, password: string) {
  const res = await api.post<ApiEnvelope<TokenPair>>('/auth/login', { email, password })
  return res.data.data
}

export async function forgotPassword(email: string) {
  const res = await api.post<ApiEnvelope<{ demo_reset_token: string | null }>>('/auth/forgot-password', { email })
  return res.data.data
}

export async function resetPassword(token: string, new_password: string) {
  const res = await api.post<ApiEnvelope<null>>('/auth/reset-password', { token, new_password })
  return res.data
}

export async function getMe() {
  const res = await api.get<ApiEnvelope<User>>('/auth/me')
  return res.data.data
}

export async function updateProfile(updates: { name?: string }) {
  const res = await api.patch<ApiEnvelope<User>>('/auth/me', updates)
  return res.data.data
}

export async function updateSettings(settings: { theme: string; email_notifications: boolean }) {
  const res = await api.patch<ApiEnvelope<User>>('/auth/settings', settings)
  return res.data.data
}
