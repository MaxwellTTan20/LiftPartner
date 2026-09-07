import { EXERCISES } from '../data/exercises'
import { getLastPerformance } from './progress'
import type { DayType, Exercise, Goal, PlanExerciseTarget, PlanWorkout, ScoreMap, Workout } from '../types'

// Which muscles belong to each day type, for both "which exercises are
// relevant" filtering and "which of this day's muscles are lagging" scoring.
// Core (abs/obliques) doesn't map cleanly onto push/pull, so it's folded
// into leg/lower days and full body, which is a common way lifting splits
// handle it.
export const DAY_TYPE_MUSCLES: Record<DayType, string[]> = {
  push: ['pec_major', 'serratus', 'anterior_delt', 'lateral_delt', 'triceps'],
  pull: [
    'upper_traps', 'mid_lower_traps', 'rhomboids', 'lat', 'teres_major',
    'erector_spinae', 'posterior_delt', 'biceps', 'forearm_flexors', 'forearm_extensors',
  ],
  legs: [
    'glute_max', 'glute_med', 'quad_rectus', 'quad_lateral', 'quad_medial',
    'adductors', 'hamstrings', 'gastrocnemius', 'soleus', 'tibialis_anterior',
    'hip_flexors', 'rectus_abd_upper', 'rectus_abd_lower', 'obliques',
  ],
  full_body: [],
  upper: [],
  lower: [],
}
// full_body / upper / lower are composed from the above rather than repeated
DAY_TYPE_MUSCLES.upper = [...DAY_TYPE_MUSCLES.push, ...DAY_TYPE_MUSCLES.pull]
DAY_TYPE_MUSCLES.lower = [...DAY_TYPE_MUSCLES.legs]
DAY_TYPE_MUSCLES.full_body = [...DAY_TYPE_MUSCLES.push, ...DAY_TYPE_MUSCLES.pull, ...DAY_TYPE_MUSCLES.legs]

export const PLAN_LIFTS_PER_DAY = 5

/** How many sets per lift to recommend, based on training goal. */
export const SETS_BY_GOAL: Record<Goal, number> = {
  aesthetics: 4,
  strength: 5,
  general: 3,
}

/**
 * Greedily picks exercises that best hit this day type's most lagging
 * muscles. After each pick, the "need" for the muscles it covers decays, so
 * the next pick favors covering *different* lagging muscles instead of
 * piling five exercises onto the same one.
 */
export function pickPlanExercises(dayMuscles: string[], scores: ScoreMap, count: number): Exercise[] {
  const need: Record<string, number> = {}
  dayMuscles.forEach((m) => {
    need[m] = 100 - (scores[m] ?? 0)
  })

  const candidates = EXERCISES.filter((e) => dayMuscles.some((m) => (e.muscles[m] ?? 0) >= 0.4))
  const picked: Exercise[] = []
  const used = new Set<string>()

  for (let i = 0; i < count && used.size < candidates.length; i++) {
    let best: Exercise | null = null
    let bestScore = -Infinity
    for (const ex of candidates) {
      if (used.has(ex.id)) continue
      let score = 0
      for (const m of dayMuscles) {
        const w = ex.muscles[m] ?? 0
        if (w > 0) score += w * need[m]
      }
      if (score > bestScore) {
        bestScore = score
        best = ex
      }
    }
    if (!best) break
    picked.push(best)
    used.add(best.id)
    for (const m of dayMuscles) {
      const w = best.muscles[m] ?? 0
      if (w > 0) need[m] = Math.max(0, need[m] - w * 40)
    }
  }
  return picked
}

function buildTarget(exercise: Exercise, sets: number, workouts: Workout[]): PlanExerciseTarget {
  const last = getLastPerformance(workouts, exercise.id)
  if (!last) {
    return { exerciseId: exercise.id, sets, targetReps: null, targetWeightLbs: null }
  }
  return {
    exerciseId: exercise.id,
    sets,
    targetReps: last.reps + 1,
    targetWeightLbs: last.weightLbs != null ? last.weightLbs + 5 : null,
  }
}

/** Builds a recommended plan for the given day type, goal, and current monthly scores/history. */
export function generatePlan(dayType: DayType, goal: Goal | null, scores: ScoreMap, workouts: Workout[]): PlanWorkout {
  const dayMuscles = DAY_TYPE_MUSCLES[dayType]
  const sets = SETS_BY_GOAL[goal ?? 'general']
  const exercises = pickPlanExercises(dayMuscles, scores, PLAN_LIFTS_PER_DAY)
  return {
    dayType,
    createdAt: Date.now(),
    exercises: exercises.map((ex) => buildTarget(ex, sets, workouts)),
  }
}
