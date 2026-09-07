interface GroupProgressBarProps {
  label: string
  score: number
  target: number
  targetLabel: string
}

export default function GroupProgressBar({ label, score, target, targetLabel }: GroupProgressBarProps) {
  const rounded = Math.round(score)
  const fillPct = Math.max(0, Math.min(100, rounded))
  const targetPct = Math.max(0, Math.min(100, target))
  const met = rounded >= target

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="font-medium text-app-text">{label}</span>
        <span className={met ? 'text-app-accent' : 'text-app-muted'}>
          {rounded} <span className="text-app-muted">/ {target} {targetLabel}</span>
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-app-surface-2">
        <div className="h-full rounded-full bg-app-accent" style={{ width: `${fillPct}%` }} />
        <div className="absolute top-0 h-full w-px bg-app-text/50" style={{ left: `${targetPct}%` }} />
      </div>
    </div>
  )
}
