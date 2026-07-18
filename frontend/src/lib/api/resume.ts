import { api } from './client'
import type { ApiEnvelope, DashboardSummary, Scan } from '../../types'

export async function scanResume(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post<ApiEnvelope<Scan>>('/resume/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.data
}

export async function getResumeScan(scanId: string) {
  const res = await api.get<ApiEnvelope<Scan>>(`/resume/scan/${scanId}`)
  return res.data.data
}

export async function getDashboardSummary() {
  const res = await api.get<ApiEnvelope<DashboardSummary>>('/dashboard/summary')
  return res.data.data
}
