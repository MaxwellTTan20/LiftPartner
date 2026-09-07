import { MUSCLE_BY_ID } from '../data/muscles'
import { getTopExercisesForMuscle } from '../data/exercises'
import { useT } from '../contexts/I18nContext'

interface MuscleInfoPanelProps {
  muscleId: string | null
  score: number
  onClose: () => void
}

export default function MuscleInfoPanel({ muscleId, score, onClose }: MuscleInfoPanelProps) {
  const { t } = useT()
  if (!muscleId) return null
  const muscle = MUSCLE_BY_ID[muscleId]
  if (!muscle) return null
  const topExercises = getTopExercisesForMuscle(muscleId, 3)

  return (
    <div className="absolute left-3 top-3 max-w-[240px] rounded-xl border border-app-border bg-app-surface/95 p-3.5 backdrop-blur">
      <button
        type="button"
        onClick={onClose}
        aria-label={t('common.close')}
        className="absolute right-2.5 top-2 text-app-muted hover:text-app-text"
      >
        &times;
      </button>
      <h3 className="pr-4 text-[15px] font-medium text-app-accent">{muscle.name}</h3>
      <p className="mb-2 text-xs text-app-muted">{t(`group.${muscle.group}`)}</p>
      <div className="mb-2.5 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-app-surface-2">
          <div className="h-full rounded-full bg-app-accent" style={{ width: `${Math.min(100, score)}%` }} />
        </div>
        <span className="text-xs font-medium tabular-nums text-app-text">{Math.round(score)}</span>
      </div>
      {topExercises.length > 0 ? (
        <ul className="space-y-0.5 text-xs leading-relaxed text-app-muted">
          {topExercises.map((ex) => (
            <li key={ex.id}>{ex.name}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
