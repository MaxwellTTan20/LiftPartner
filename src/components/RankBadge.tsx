interface RankBadgeProps {
  rank: number
  className?: string
}

// Diamond / gold / silver / bronze for the top 4 spots - everything past
// that is just a plain numbered circle.
const TIER_STYLES: Record<number, { bg: string; fg: string }> = {
  1: { bg: '#b9f2ff', fg: '#0c4a6e' },
  2: { bg: '#ffd54f', fg: '#7a5b00' },
  3: { bg: '#d6d6d6', fg: '#4b4b4b' },
  4: { bg: '#cd7f32', fg: '#fff7ec' },
}

export default function RankBadge({ rank, className = '' }: RankBadgeProps) {
  const tier = TIER_STYLES[rank]

  if (!tier) {
    return (
      <span
        className={`flex items-center justify-center rounded-full bg-app-surface-2 font-bold text-app-muted ${className}`}
      >
        {rank}
      </span>
    )
  }

  return (
    <span
      className={`flex items-center justify-center gap-0.5 rounded-full font-bold ${className}`}
      style={{ background: tier.bg, color: tier.fg }}
      aria-label={`Rank ${rank}`}
    >
      <span aria-hidden="true">👑</span>
      {rank}
    </span>
  )
}
