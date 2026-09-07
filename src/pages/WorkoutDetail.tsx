import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useT } from '../contexts/I18nContext'
import { useWorkouts } from '../hooks/useWorkouts'
import { deleteWorkout } from '../lib/firestore'
import { EXERCISE_BY_ID } from '../data/exercises'
import { computeWorkoutScores } from '../lib/scoring'
import { getExerciseProgress } from '../lib/progress'
import { toDisplayWeight } from '../lib/units'
import BodyModel from '../components/BodyModel'
import MuscleInfoPanel from '../components/MuscleInfoPanel'
import Sparkline from '../components/Sparkline'
import WorkoutSetsChart from '../components/WorkoutSetsChart'

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const { t } = useT()
  const { workouts, loading, refresh } = useWorkouts()
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const weightUnit = profile?.weightUnit ?? 'lbs'

  const workout = useMemo(() => workouts.find((w) => w.id === id) ?? null, [workouts, id])
  const scores = useMemo(() => (workout ? computeWorkoutScores(workout) : {}), [workout])

  async function handleDelete() {
    if (!user || !workout) return
    if (!window.confirm(t('workoutDetail.deleteConfirm'))) return
    setDeleting(true)
    try {
      await deleteWorkout(user.uid, workout.id)
      await refresh()
      navigate('/history')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <p className="px-4 pt-6 text-sm text-app-muted">{t('common.loading')}</p>
  }

  if (!workout) {
    return (
      <div className="px-4 pt-6">
        <p className="text-sm text-app-muted">{t('workoutDetail.notFound')}</p>
        <Link to="/history" className="mt-2 inline-block text-sm text-app-accent">
          {t('workoutDetail.backToHistory')}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-md flex-col pb-24">
      <header className="flex items-start justify-between px-4 pt-6 pb-2">
        <div>
          <Link to="/history" className="text-xs text-app-muted">
            &larr; {t('workoutDetail.allWorkouts')}
          </Link>
          <h1 className="mt-1 text-xl font-medium">{formatDate(workout.date)}</h1>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="mt-1 text-xs text-app-muted underline hover:text-app-accent disabled:opacity-40"
        >
          {deleting ? t('common.deleting') : t('common.delete')}
        </button>
      </header>

      <div className="relative mx-4 h-[320px] overflow-hidden rounded-2xl border border-app-border">
        <BodyModel
          scores={scores}
          selectedId={selectedId}
          onSelect={setSelectedId}
          selfieURL={profile?.selfieURL ?? null}
          className="h-full w-full"
        />
        <MuscleInfoPanel muscleId={selectedId} score={scores[selectedId ?? ''] ?? 0} onClose={() => setSelectedId(null)} />
      </div>

      {workout.notes ? (
        <div className="mx-4 mt-4 rounded-xl border border-app-border bg-app-surface p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-app-muted">{t('common.notes')}</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-app-text">{workout.notes}</p>
        </div>
      ) : null}

      <div className="mx-4 mt-4 flex flex-col gap-3">
        {workout.exercises.map((entry) => {
          const exercise = EXERCISE_BY_ID[entry.exerciseId]
          if (!exercise) return null
          const progress = getExerciseProgress(workouts, entry.exerciseId)
          const hasWeights = progress.some((p) => p.bestWeightLbs != null)
          const series = hasWeights
            ? progress.map((p) => (p.bestWeightLbs != null ? toDisplayWeight(p.bestWeightLbs, weightUnit) : 0))
            : progress.map((p) => p.totalReps)

          return (
            <div key={entry.exerciseId} className="rounded-xl border border-app-border bg-app-surface p-3.5">
              <h3 className="mb-1.5 text-sm font-medium">{exercise.name}</h3>
              <WorkoutSetsChart sets={entry.sets} weightUnit={weightUnit} />
              {progress.length > 1 ? (
                <div className="mt-2 border-t border-app-border pt-2">
                  <p className="mb-1 text-[11px] text-app-muted">
                    {hasWeights ? t('workoutDetail.bestWeightOverTime') : t('workoutDetail.totalRepsOverTime')}
                  </p>
                  <Sparkline values={series} />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
