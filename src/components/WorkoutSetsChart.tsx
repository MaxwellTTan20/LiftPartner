import { toDisplayWeight } from '../lib/units'
import { useT } from '../contexts/I18nContext'
import type { WeightUnit, WorkoutSet } from '../types'

interface WorkoutSetsChartProps {
  sets: WorkoutSet[]
  weightUnit: WeightUnit
}

// Same visual language as LiftHistoryChart (weight band on top in accent
// color, reps band below in gray), just with "Set 1, Set 2, ..." as the
// x-axis instead of session dates - used anywhere a specific workout's raw
// set-by-set data needs to be shown as a chart instead of a text list.
const BAR_WIDTH = 30
const GAP = 14
const WEIGHT_BAND_H = 70
const REPS_BAND_H = 50
const TOP_PAD = 14
const AXIS_H = 16
const AXIS_LABEL_W = 24
const MIN_PLOT_W = 160
const CHART_H = TOP_PAD + WEIGHT_BAND_H + REPS_BAND_H + AXIS_H

function roundUpTo(value: number, step: number): number {
  return Math.max(step, Math.ceil(value / step) * step)
}

export default function WorkoutSetsChart({ sets, weightUnit }: WorkoutSetsChartProps) {
  const { t } = useT()

  if (sets.length === 0) return null

  const displayWeights = sets.map((s) => (s.weightLbs != null ? toDisplayWeight(s.weightLbs, weightUnit) : null))
  const reps = sets.map((s) => s.reps)

  const maxWeight = roundUpTo(Math.max(1, ...displayWeights.map((w) => w ?? 0)), 5)
  const maxReps = roundUpTo(Math.max(1, ...reps), 2)
  const plotWidth = Math.max(MIN_PLOT_W, sets.length * (BAR_WIDTH + GAP))

  const weightTopY = TOP_PAD
  const weightBaseY = TOP_PAD + WEIGHT_BAND_H
  const repsTopY = weightBaseY
  const repsBaseY = weightBaseY + REPS_BAND_H

  return (
    <div>
    <div className="overflow-x-auto">
      <svg width={AXIS_LABEL_W + plotWidth} height={CHART_H} className="block">
        <rect x={AXIS_LABEL_W} y={weightTopY} width={plotWidth} height={WEIGHT_BAND_H} fill="#e0473a" opacity={0.05} />
        <line x1={AXIS_LABEL_W} y1={weightBaseY} x2={AXIS_LABEL_W + plotWidth} y2={weightBaseY} stroke="#2a2a2f" strokeWidth={1} />
        <text x={AXIS_LABEL_W - 4} y={weightTopY + 3} textAnchor="end" fontSize="8" fill="#9a9aa0">{maxWeight}</text>
        {/* pulled up off the shared boundary line - it used to sit only 3px
            from the reps band's max label directly below, overlapping */}
        <text x={AXIS_LABEL_W - 4} y={weightBaseY - 4} textAnchor="end" fontSize="8" fill="#9a9aa0">0</text>

        <rect x={AXIS_LABEL_W} y={repsTopY} width={plotWidth} height={REPS_BAND_H} fill="#6b6b6d" opacity={0.06} />
        <line x1={AXIS_LABEL_W} y1={repsBaseY} x2={AXIS_LABEL_W + plotWidth} y2={repsBaseY} stroke="#2a2a2f" strokeWidth={1} />
        <text x={AXIS_LABEL_W - 4} y={repsTopY + 10} textAnchor="end" fontSize="8" fill="#9a9aa0">{maxReps}</text>
        <text x={AXIS_LABEL_W - 4} y={repsBaseY} textAnchor="end" fontSize="8" fill="#9a9aa0">0</text>

        {sets.map((set, i) => {
          const displayWeight = displayWeights[i]
          const x = AXIS_LABEL_W + i * (BAR_WIDTH + GAP)
          const weightH = displayWeight != null ? (displayWeight / maxWeight) * WEIGHT_BAND_H : 0
          const repsH = maxReps > 0 ? (set.reps / maxReps) * REPS_BAND_H : 0
          const weightTop = weightBaseY - weightH
          const repsTop = repsBaseY - Math.max(repsH, 2)
          // Reps value sits INSIDE its bar (white) rather than above it -
          // above-the-bar labels were colliding with the weight band's "0"
          // axis label whenever a bar got tall enough to reach that height.
          const repsLabelY = Math.min(repsTop + 11, repsBaseY - 4)
          return (
            <g key={i}>
              {displayWeight != null ? (
                <>
                  <text x={x + BAR_WIDTH / 2} y={weightTop - 3} textAnchor="middle" fontSize="9" fill="#e0473a">
                    {displayWeight}
                  </text>
                  <rect x={x} y={weightTop} width={BAR_WIDTH} height={Math.max(weightH, 2)} rx={3} fill="#e0473a" />
                </>
              ) : null}
              <rect x={x} y={repsTop} width={BAR_WIDTH} height={Math.max(repsH, 2)} rx={3} fill="#6b6b6d" />
              <text x={x + BAR_WIDTH / 2} y={repsLabelY} textAnchor="middle" fontSize="9" fill="#ffffff">
                {set.reps}
              </text>
              <text x={x + BAR_WIDTH / 2} y={repsBaseY + AXIS_H - 3} textAnchor="middle" fontSize="8" fill="#9a9aa0">
                {t('workoutDetail.set')} {i + 1}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-app-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm" style={{ background: '#e0473a' }} /> {t('chart.weight')} ({weightUnit})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm" style={{ background: '#6b6b6d' }} /> {t('chart.reps')}
        </span>
      </div>
    </div>
  )
}
