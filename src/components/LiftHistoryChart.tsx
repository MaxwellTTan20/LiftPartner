import { useEffect, useState } from 'react'
import type { ExerciseSessionAverage } from '../lib/progress'
import { toDisplayWeight } from '../lib/units'
import { useT } from '../contexts/I18nContext'
import type { WeightUnit } from '../types'
import WorkoutSetsChart from './WorkoutSetsChart'

interface LiftHistoryChartProps {
  sessions: ExerciseSessionAverage[]
  weightUnit: WeightUnit
}

const BAR_WIDTH = 34
const GAP = 16
const WEIGHT_BAND_H = 84
const REPS_BAND_H = 60
const TOP_PAD = 14
const AXIS_H = 18
const AXIS_LABEL_W = 26
const MIN_PLOT_W = 210
const CHART_H = TOP_PAD + WEIGHT_BAND_H + REPS_BAND_H + AXIS_H

function formatShortDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
}

function formatFullDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

function roundUpTo(value: number, step: number): number {
  return Math.max(step, Math.ceil(value / step) * step)
}

interface Growth {
  weightFirst: number | null
  weightLast: number | null
  weightDeltaPct: number | null
  repsFirst: number
  repsLast: number
  repsDeltaPct: number | null
}

function computeGrowth(displayWeights: (number | null)[], reps: number[]): Growth | null {
  if (displayWeights.length < 2) return null
  const weightFirst = displayWeights[0]
  const weightLast = displayWeights[displayWeights.length - 1]
  const repsFirst = reps[0]
  const repsLast = reps[reps.length - 1]
  const weightDeltaPct =
    weightFirst != null && weightLast != null && weightFirst > 0 ? ((weightLast - weightFirst) / weightFirst) * 100 : null
  const repsDeltaPct = repsFirst > 0 ? ((repsLast - repsFirst) / repsFirst) * 100 : null
  return { weightFirst, weightLast, weightDeltaPct, repsFirst, repsLast, repsDeltaPct }
}

function DeltaTag({ pct }: { pct: number | null }) {
  if (pct == null) return <span className="text-app-muted">--</span>
  const rounded = Math.round(pct)
  const arrow = rounded > 0 ? '↑' : rounded < 0 ? '↓' : '→'
  // Was always styled with the (red) accent color regardless of direction -
  // an increase should read as a positive/green change, a decrease as
  // negative/red, flat as neutral gray.
  const color = rounded > 0 ? '#3ecf6b' : rounded < 0 ? '#e0473a' : '#9a9aa0'
  return (
    <span className="font-medium" style={{ color }}>
      {arrow} {rounded > 0 ? '+' : ''}
      {rounded}%
    </span>
  )
}

export default function LiftHistoryChart({ sessions, weightUnit }: LiftHistoryChartProps) {
  const { t } = useT()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Sessions are sorted oldest -> newest, so the most recent one is the last
  // entry. Auto-select it whenever the session list changes (i.e. whenever
  // a different lift is opened) so the detail chart is already showing
  // something useful instead of requiring a tap first - the user can still
  // tap any other column to switch.
  useEffect(() => {
    setSelectedIndex(sessions.length > 0 ? sessions.length - 1 : null)
  }, [sessions])

  if (sessions.length === 0) {
    return <p className="text-sm text-app-muted">{t('chart.noHistory')}</p>
  }

  const displayWeights = sessions.map((s) => (s.avgWeightLbs != null ? toDisplayWeight(s.avgWeightLbs, weightUnit) : null))
  const reps = sessions.map((s) => s.avgReps)

  const maxWeight = roundUpTo(Math.max(1, ...displayWeights.map((w) => w ?? 0)), 5)
  const maxReps = roundUpTo(Math.max(1, ...reps), 2)
  const plotWidth = Math.max(MIN_PLOT_W, sessions.length * (BAR_WIDTH + GAP))
  const growth = computeGrowth(displayWeights, reps)

  const weightTopY = TOP_PAD
  const weightBaseY = TOP_PAD + WEIGHT_BAND_H
  const repsTopY = weightBaseY
  const repsBaseY = weightBaseY + REPS_BAND_H

  return (
    <div className="rounded-xl border border-app-border bg-app-surface p-4">
      {growth ? (
        <div className="mb-4 flex flex-col gap-2 border-b border-app-border pb-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-app-muted">{t('chart.growthTitle')}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-app-muted">{t('chart.weight')}</span>
            <span className="text-app-text">
              {growth.weightFirst ?? '-'} &rarr; {growth.weightLast ?? '-'} {weightUnit} &nbsp;
              <DeltaTag pct={growth.weightDeltaPct} />
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-app-muted">{t('chart.reps')}</span>
            <span className="text-app-text">
              {growth.repsFirst} &rarr; {growth.repsLast} {t('chart.avg')} &nbsp;
              <DeltaTag pct={growth.repsDeltaPct} />
            </span>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <svg width={AXIS_LABEL_W + plotWidth} height={CHART_H} className="block">
          <rect x={AXIS_LABEL_W} y={weightTopY} width={plotWidth} height={WEIGHT_BAND_H} fill="#e0473a" opacity={0.05} />
          <line x1={AXIS_LABEL_W} y1={weightTopY + WEIGHT_BAND_H / 2} x2={AXIS_LABEL_W + plotWidth} y2={weightTopY + WEIGHT_BAND_H / 2} stroke="#2a2a2f" strokeWidth={1} strokeDasharray="2,3" />
          <line x1={AXIS_LABEL_W} y1={weightBaseY} x2={AXIS_LABEL_W + plotWidth} y2={weightBaseY} stroke="#2a2a2f" strokeWidth={1} />
          <text x={AXIS_LABEL_W - 4} y={weightTopY + 3} textAnchor="end" fontSize="8" fill="#9a9aa0">{maxWeight}</text>
          {/* pulled up off the shared boundary line - it used to sit only
              3px from the reps band's max label directly below, overlapping */}
          <text x={AXIS_LABEL_W - 4} y={weightBaseY - 4} textAnchor="end" fontSize="8" fill="#9a9aa0">0</text>

          <rect x={AXIS_LABEL_W} y={repsTopY} width={plotWidth} height={REPS_BAND_H} fill="#6b6b6d" opacity={0.06} />
          <line x1={AXIS_LABEL_W} y1={repsTopY + REPS_BAND_H / 2} x2={AXIS_LABEL_W + plotWidth} y2={repsTopY + REPS_BAND_H / 2} stroke="#2a2a2f" strokeWidth={1} strokeDasharray="2,3" />
          <line x1={AXIS_LABEL_W} y1={repsBaseY} x2={AXIS_LABEL_W + plotWidth} y2={repsBaseY} stroke="#2a2a2f" strokeWidth={1} />
          <text x={AXIS_LABEL_W - 4} y={repsTopY + 10} textAnchor="end" fontSize="8" fill="#9a9aa0">{maxReps}</text>
          <text x={AXIS_LABEL_W - 4} y={repsBaseY} textAnchor="end" fontSize="8" fill="#9a9aa0">0</text>

          {sessions.map((s, i) => {
            const displayWeight = displayWeights[i]
            const x = AXIS_LABEL_W + i * (BAR_WIDTH + GAP)
            const weightH = displayWeight != null ? (displayWeight / maxWeight) * WEIGHT_BAND_H : 0
            const repsH = maxReps > 0 ? (s.avgReps / maxReps) * REPS_BAND_H : 0
            const weightTop = weightBaseY - weightH
            const repsTop = repsBaseY - Math.max(repsH, 2)
            // Reps value sits INSIDE its bar (white) instead of above it -
            // above-the-bar labels used to collide with the weight band's
            // "0" axis label whenever a bar got tall enough to reach it.
            const repsLabelY = Math.min(repsTop + 11, repsBaseY - 4)
            const isSelected = selectedIndex === i
            return (
              <g
                key={`${s.date}-${i}`}
                onClick={() => setSelectedIndex(isSelected ? null : i)}
                style={{ cursor: 'pointer' }}
              >
                {isSelected ? (
                  <rect
                    x={x - GAP / 2}
                    y={weightTopY}
                    width={BAR_WIDTH + GAP}
                    height={WEIGHT_BAND_H + REPS_BAND_H}
                    fill="#e9e9ea"
                    opacity={0.08}
                  />
                ) : null}
                {/* transparent full-height hit target so taps anywhere in the
                    column (not just directly on a bar) select the session */}
                <rect x={x - GAP / 2} y={weightTopY} width={BAR_WIDTH + GAP} height={WEIGHT_BAND_H + REPS_BAND_H} fill="transparent" />
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
                  {s.avgReps}
                </text>
                <text
                  x={x + BAR_WIDTH / 2}
                  y={repsBaseY + AXIS_H - 4}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isSelected ? '#e0473a' : '#9a9aa0'}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {formatShortDate(s.date)}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-app-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm" style={{ background: '#e0473a' }} /> {t('chart.avgWeight')} ({weightUnit})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm" style={{ background: '#6b6b6d' }} /> {t('chart.avgReps')}
        </span>
      </div>
      <p className="mt-2 text-center text-[11px] text-app-muted">{t('chart.tapHint')}</p>

      {selectedIndex != null ? (
        <div className="mt-3 rounded-xl border border-app-accent/40 bg-app-accent/5 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-app-accent">{t('chart.viewAllInfo')} - {formatFullDate(sessions[selectedIndex].date)}</p>
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              aria-label={t('common.close')}
              className="text-app-muted hover:text-app-accent"
            >
              &times;
            </button>
          </div>
          <div className="mt-2">
            <WorkoutSetsChart sets={sessions[selectedIndex].sets} weightUnit={weightUnit} />
          </div>
          {sessions[selectedIndex].notes ? (
            <div className="mt-2 border-t border-app-border pt-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-app-muted">{t('common.notes')}</p>
              <p className="mt-1 whitespace-pre-wrap text-xs text-app-text">{sessions[selectedIndex].notes}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
