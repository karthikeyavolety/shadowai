import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, FileText, Upload, ArrowRight } from 'lucide-react'
import { DashboardShell } from '../../components/layout/DashboardShell'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { RiskGauge } from '../../components/ui/RiskGauge'
import { getDashboardSummary } from '../../lib/api/resume'
import { useAuth } from '../../context/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-summary'], queryFn: getDashboardSummary })

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-text-primary">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-text-muted">Here's what the internet currently knows about you.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-48 animate-pulse">{null}</Card>
          ))}
        </div>
      ) : (
        <>
          {data && data.total_scans === 0 ? (
            <Card className="mb-6 flex flex-col items-center gap-4 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-signal-blue/20 to-signal-purple/20">
                <Upload className="h-6 w-6 text-signal-blue" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-text-primary">No scans yet</h3>
                <p className="mt-1 max-w-sm text-sm text-text-muted">
                  Run your first scan to see your risk scores here. The Resume Analyzer is the fastest place to start.
                </p>
              </div>
              <Link to="/resume">
                <Button>
                  Run Resume Analyzer <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
              <Card className="flex items-center justify-center">
                <RiskGauge value={data?.scores.overall ?? 0} label="Overall Risk" size={140} />
              </Card>
              <Card className="flex items-center justify-center">
                <RiskGauge value={data?.scores.privacy ?? 0} label="Privacy" size={140} />
              </Card>
              <Card className="flex items-center justify-center">
                <RiskGauge value={data?.scores.identity_theft ?? 0} label="Identity Theft" size={140} />
              </Card>
              <Card className="flex items-center justify-center">
                <RiskGauge value={data?.scores.social_engineering ?? 0} label="Social Engineering" size={140} />
              </Card>
              <Card className="flex items-center justify-center">
                <RiskGauge value={data?.scores.credential_exposure ?? 0} label="Credential Exposure" size={140} />
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Recent Reports"
                subtitle="Your latest scans across all sources"
                action={
                  <Link to="/resume">
                    <Button variant="secondary">
                      <FileText className="h-4 w-4" /> New Scan
                    </Button>
                  </Link>
                }
              />
              {data && data.recent_scans.length > 0 ? (
                <div className="flex flex-col divide-y divide-border-glass">
                  {data.recent_scans.map((scan) => (
                    <Link
                      key={scan.id}
                      to={`/resume/scan/${scan.id}`}
                      className="flex items-center justify-between py-3 text-sm hover:bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-signal-blue/10">
                          <FileText className="h-4 w-4 text-signal-blue" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{scan.input_reference}</p>
                          <p className="text-xs capitalize text-text-muted">{scan.scan_type} scan</p>
                        </div>
                      </div>
                      <span className="font-mono text-sm text-text-muted">{scan.scores.overall}/100</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-text-muted">No reports yet.</p>
              )}
            </Card>

            <Card>
              <CardHeader title="Privacy Checklist" subtitle="Quick wins to reduce your exposure" />
              <div className="flex flex-col gap-3">
                {data?.checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm">
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-risk-low" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-text-muted" />
                    )}
                    <span className={item.done ? 'text-text-muted line-through' : 'text-text-primary'}>{item.item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </DashboardShell>
  )
}
