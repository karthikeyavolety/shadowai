import { useState, useCallback, useRef } from 'react'
import type React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, FileText, AlertTriangle, X } from 'lucide-react'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { RiskGauge } from '../../components/ui/RiskGauge'
import { scanResume } from '../../lib/api/resume'
import type { Scan } from '../../types'

const ENTITY_LABELS: Record<string, string> = {
  phone: 'Phone Numbers',
  email: 'Email Addresses',
  address: 'Addresses',
  dob: 'Date of Birth',
  passport: 'Passport Numbers',
  pan: 'PAN Numbers',
  aadhaar: 'Aadhaar Numbers',
  linkedin: 'LinkedIn Links',
  github: 'GitHub Links',
  certificates: 'Certificates',
  skills: 'Skills',
}

const CRITICAL_KEYS = ['aadhaar', 'passport', 'pan']

export default function ResumeAnalyzerPage() {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (f: File) => scanResume(f),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] }),
  })

  const handleFile = useCallback((f: File | null) => {
    if (!f) return
    if (f.type !== 'application/pdf') {
      mutation.reset()
      return
    }
    mutation.mutate(f)
  }, [mutation])

  const result: Scan | undefined = mutation.data

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-text-primary">Resume Analyzer</h1>
        <p className="mt-1 text-sm text-text-muted">
          Upload your resume as a PDF. We extract text locally, detect sensitive fields, and score your exposure —
          your file isn't stored or shared anywhere else.
        </p>
      </div>

      {!result && (
        <Card
          className={`flex flex-col items-center gap-4 border-2 border-dashed py-16 text-center transition-colors ${
            dragOver ? 'border-signal-blue bg-signal-blue/5' : 'border-border-glass'
          }`}
          onDragOver={(e: React.DragEvent) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e: React.DragEvent) => {
            e.preventDefault()
            setDragOver(false)
            handleFile(e.dataTransfer.files?.[0] ?? null)
          }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-signal-blue/20 to-signal-purple/20">
            <Upload className="h-6 w-6 text-signal-blue" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-text-primary">
              {mutation.isPending ? 'Analyzing your resume…' : 'Drop your resume PDF here'}
            </h3>
            <p className="mt-1 text-sm text-text-muted">or click below to browse — PDF only, up to 5MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <Button isLoading={mutation.isPending} onClick={() => fileInputRef.current?.click()}>
            Choose file
          </Button>
          {mutation.isError && (
            <p className="mt-2 flex items-center gap-2 rounded-lg bg-risk-critical/10 px-3 py-2 text-sm text-risk-critical">
              <AlertTriangle className="h-4 w-4" />
              {(mutation.error as any)?.response?.data?.message || 'Could not analyze this file.'}
            </p>
          )}
        </Card>
      )}

      {result && (
        <div className="flex flex-col gap-6">
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-signal-blue" />
              <div>
                <p className="font-medium text-text-primary">{result.input_reference}</p>
                <p className="text-xs text-text-muted">Analyzed just now</p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                mutation.reset()
              }}
            >
              <X className="h-4 w-4" /> New scan
            </Button>
          </Card>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Card className="flex items-center justify-center">
              <RiskGauge value={result.scores.overall} label="Overall Risk" size={130} />
            </Card>
            <Card className="flex items-center justify-center">
              <RiskGauge value={result.scores.privacy} label="Privacy" size={130} />
            </Card>
            <Card className="flex items-center justify-center">
              <RiskGauge value={result.scores.identity_theft} label="Identity Theft" size={130} />
            </Card>
            <Card className="flex items-center justify-center">
              <RiskGauge value={result.scores.social_engineering} label="Social Eng." size={130} />
            </Card>
            <Card className="flex items-center justify-center">
              <RiskGauge value={result.scores.credential_exposure} label="Credential Exp." size={130} />
            </Card>
          </div>

          <Card>
            <CardHeader title="Detected Information" subtitle="Everything found in the document, grouped by field" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(result.extracted_entities)
                .filter(([, values]) => (values as string[]).length > 0)
                .map(([key, values]) => (
                  <div
                    key={key}
                    className={`rounded-xl border p-4 ${
                      CRITICAL_KEYS.includes(key) ? 'border-risk-critical/40 bg-risk-critical/5' : 'border-border-glass bg-white/[0.02]'
                    }`}
                  >
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-muted">
                      {ENTITY_LABELS[key] || key}
                      {CRITICAL_KEYS.includes(key) && <AlertTriangle className="h-3 w-3 text-risk-critical" />}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(values as string[]).map((v, i) => (
                        <span key={i} className="rounded-md bg-white/5 px-2 py-1 font-mono text-xs text-text-primary">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recommendations" subtitle="What to fix, in order of priority" />
            <ul className="flex flex-col gap-3">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-white/[0.02] p-3 text-sm text-text-primary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-signal-blue/15 font-mono text-[11px] text-signal-blue">
                    {i + 1}
                  </span>
                  {rec}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </DashboardShell>
  )
}
