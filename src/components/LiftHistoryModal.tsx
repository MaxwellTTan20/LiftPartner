import { useEffect, useMemo, useState } from 'react'
import ExerciseBrowser from './ExerciseBrowser'
import LiftHistoryChart from './LiftHistoryChart'
import { EXERCISE_BY_ID } from '../data/exercises'
import { getExerciseSessionAverages } from '../lib/progress'
import { useAuth } from '../contexts/AuthContext'
import { useT } from '../contexts/I18nContext'
import type { Workout } from '../types'

interface LiftHistoryModalProps {
  open: boolean
  onClose: () => void
  workouts: Workout[]
  /** if given, opens straight to that lift's chart instead of the browse list */
  initialExerciseId?: string | null
}

export default function LiftHistoryModal({ open, onClose, workouts, initialExerciseId = null }: LiftHistoryModalProps) {
  const { profile } = useAuth()
  const { t } = useT()
  const [exerciseId, setExerciseId] = useState<string | null>(initialExerciseId)

  useEffect(() => {
    if (open) setExerciseId(initialExerciseId)
  }, [open, initialExerciseId])

  const sessions = useMemo(
    () => (exerciseId ? getExerciseSessionAverages(workouts, exerciseId) : []),
    [workouts, exerciseId],
  )

  if (!open) return null

  if (!exerciseId) {
    return <ExerciseBrowser onSelect={setExerciseId} onCancel={onClose} />
  }

  const exercise = EXERCISE_BY_ID[exerciseId]

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-app-bg">
      <div
        className="flex items-center gap-2 border-b border-app-border px-4 pb-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
      >
        <button type="button" onClick={() => setExerciseId(null)} aria-label={t('liftHistory.backToList')} className="text-lg text-app-muted">
          &larr;
        </button>
        <h2 className="flex-1 truncate text-sm font-medium">{exercise?.name ?? t('liftHistory.title')}</h2>
        <button type="button" onClick={onClose} className="text-sm text-app-muted">
          {t('common.close')}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <LiftHistoryChart sessions={sessions} weightUnit={profile?.weightUnit ?? 'lbs'} />
      </div>
    </div>
  )
}
