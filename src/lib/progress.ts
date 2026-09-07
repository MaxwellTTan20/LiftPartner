import type { Workout, WorkoutSet } from '../types'

export interface ExerciseProgressPoint {
  date: string
  bestWeightLbs: number | null
  totalReps: number
  estVolume: number
}

/** Chronological progress for one exercise across all workouts that include it. */
export function getExerciseProgress(workouts: Workout[], exerciseId: string): ExerciseProgressPoint[] {
  return workouts
    .filter((w) => w.exercises.some((e) => e.exerciseId === exerciseId))
    .map((w) => {
      const entry = w.exercises.find((e) => e.exerciseId === exerciseId)
      const sets = entry?.sets ?? []
      let bestWeightLbs: number | null = null
      let totalReps = 0
      let estVolume = 0
      for (const s of sets) {
        totalReps += s.reps
        estVolume += s.reps * (s.weightLbs ?? 1)
        if (s.weightLbs != null && (bestWeightLbs === null || s.weightLbs > bestWeightLbs)) {
          bestWeightLbs = s.weightLbs
        }
      }
      return { date: w.date, bestWeightLbs, totalReps, estVolume }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

export interface ExerciseSessionAverage {
  date: string
  avgReps: number
  avgWeightLbs: number | null
  /** the specific workout this session's bar represents - lets the chart
   * show that workout's actual per-set data (and any comment) on tap. */
  workoutId: string
  sets: WorkoutSet[]
  notes?: string
}

/**
 * Per-session average reps and average weight for one exercise - used by
 * the lift-history bar chart. Averages (not best-set) since a session
 * usually has a mix of warm-up/working sets and this is meant to show the
 * overall trend session to session.
 */
export function getExerciseSessionAverages(workouts: Workout[], exerciseId: string): ExerciseSessionAverage[] {
  return workouts
    .filter((w) => w.exercises.some((e) => e.exerciseId === exerciseId))
    .map((w) => {
      const entry = w.exercises.find((e) => e.exerciseId === exerciseId)
      const sets = entry?.sets ?? []
      const reps = sets.map((s) => s.reps)
      const weights = sets.filter((s) => s.weightLbs != null).map((s) => s.weightLbs as number)
      const avgReps = reps.length ? reps.reduce((a, b) => a + b, 0) / reps.length : 0
      const avgWeightLbs = weights.length ? weights.reduce((a, b) => a + b, 0) / weights.length : null
      return {
        date: w.date,
        avgReps: Math.round(avgReps * 10) / 10,
        avgWeightLbs: avgWeightLbs != null ? Math.round(avgWeightLbs * 10) / 10 : null,
        workoutId: w.id,
        sets,
        notes: w.notes,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Most recent performance for an exercise, used by the Plan generator to
 * predict a target (previous + progression) for the next session.
 */
export function getLastPerformance(workouts: Workout[], exerciseId: string): { reps: number; weightLbs?: number } | null {
  const sorted = [...workouts]
    .filter((w) => w.exercises.some((e) => e.exerciseId === exerciseId))
    .sort((a, b) => b.createdAt - a.createdAt)
  const mostRecent = sorted[0]
  if (!mostRecent) return null
  const entry = mostRecent.exercises.find((e) => e.exerciseId === exerciseId)
  const lastSet = entry?.sets[entry.sets.length - 1]
  if (!lastSet) return null
  return { reps: lastSet.reps, weightLbs: lastSet.weightLbs }
}
