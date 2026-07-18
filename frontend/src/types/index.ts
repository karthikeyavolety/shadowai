export interface UserSettings {
  theme: 'dark' | 'light'
  email_notifications: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  is_verified: boolean
  is_suspended: boolean
  settings: UserSettings
  created_at: string
  last_login: string | null
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export interface RiskScores {
  overall: number
  privacy: number
  identity_theft: number
  social_engineering: number
  credential_exposure: number
}

export interface ExtractedEntities {
  phone: string[]
  email: string[]
  address: string[]
  dob: string[]
  passport: string[]
  pan: string[]
  aadhaar: string[]
  linkedin: string[]
  github: string[]
  certificates: string[]
  skills: string[]
}

export type ScanType = 'resume' | 'github' | 'portfolio' | 'linkedin'
export type ScanStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Scan {
  id: string
  scan_type: ScanType
  input_reference: string
  extracted_entities: ExtractedEntities
  raw_findings: Record<string, unknown>
  scores: RiskScores
  recommendations: string[]
  status: ScanStatus
  created_at: string
}

export interface ChecklistItem {
  item: string
  done: boolean
}

export interface DashboardSummary {
  scores: RiskScores
  recent_scans: Scan[]
  total_scans: number
  checklist: ChecklistItem[]
}

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  message: string
  error: string | null
}
