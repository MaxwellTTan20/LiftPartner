interface SparklineProps {
  values: number[]
  width?: number
  height?: number
}

export default function Sparkline({ values, width = 240, height = 48 }: SparklineProps) {
  if (values.length === 0) return null
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const stepX = values.length > 1 ? width / (values.length - 1) : 0
  const points = values.map((v, i) => {
    const x = values.length > 1 ? i * stepX : width / 2
    const y = height - ((v - min) / range) * (height - 6) - 3
    return `${x},${y}`
  })

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline points={points.join(' ')} fill="none" stroke="#e0473a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => {
        const [x, y] = points[i].split(',').map(Number)
        return <circle key={`${v}-${i}`} cx={x} cy={y} r={2.5} fill="#e0473a" />
      })}
    </svg>
  )
}
