interface RiskGaugeProps {
  value: number // 0-100
  label: string
  size?: number
}

function getRiskColor(value: number): string {
  if (value >= 70) return '#f43f5e' // critical
  if (value >= 45) return '#f97316' // high
  if (value >= 20) return '#eab308' // medium
  return '#22c55e' // low
}

function getRiskLabel(value: number): string {
  if (value >= 70) return 'Critical'
  if (value >= 45) return 'High'
  if (value >= 20) return 'Moderate'
  return 'Low'
}

export function RiskGauge({ value, label, size = 160 }: RiskGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = size / 2 - 12
  const circumference = radius * Math.PI * 1.5 // 270-degree arc
  const offset = circumference - (clamped / 100) * circumference
  const color = getRiskColor(clamped)
  const center = size / 2

  return (
    <div className="flex flex-col items-center gap-2" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[225deg]">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(148,163,219,0.12)"
            strokeWidth={10}
            strokeDasharray={`${circumference} ${circumference * 10}`}
            strokeLinecap="round"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeDasharray={`${circumference} ${circumference * 10}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-semibold" style={{ color }}>
            {clamped}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-text-muted">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="font-mono text-[11px] uppercase tracking-wider" style={{ color }}>
          {getRiskLabel(clamped)}
        </p>
      </div>
    </div>
  )
}
