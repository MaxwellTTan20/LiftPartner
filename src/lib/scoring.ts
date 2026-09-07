import { EXERCISE_BY_ID } from '../data/exercises'
import { ALL_MUSCLE_IDS, MUSCLE_IDS_BY_GROUP, REGION_ORDER } from '../data/muscles'
import type { Goal, GymFrequency, MuscleGroup, ScoreMap, Workout } from '../types'

// How much a single set "counts" toward hypertrophy volume, based on rep
// range. Straight sets-count is the standard way lifters track weekly
// volume per muscle group, but we nudge it a bit by rep range so a 3-rep
// strength set doesn't count the same as an 10-rep hypertrophy set.
function repEquivalent(reps: number): number {
  if (reps <= 0) return 0
  return Math.min(1.6, Math.max(0.35, reps / 10))
}

/** muscleId -> total weighted "equivalent sets" across the given workouts */
export function computeMuscleVolumes(workouts: Workout[]): Record<string, number> {
  const volumes: Record<string, number> = Object.fromEntries(ALL_MUSCLE_IDS.map((id) => [id, 0]))
  for (const workout of workouts) {
    for (const entry of workout.exercises) {
      const exercise = EXERCISE_BY_ID[entry.exerciseId]
      if (!exercise) continue
      for (const set of entry.sets) {
        const setValue = repEquivalent(set.reps)
        for (const [muscleId, weight] of Object.entries(exercise.muscles)) {
          if (volumes[muscleId] === undefined) continue
          volumes[muscleId] += setValue * weight
        }
      }
    }
  }
  return volumes
}

function volumesToScores(volumes: Record<string, number>, target: number): ScoreMap {
  const scores: ScoreMap = {}
  for (const id of ALL_MUSCLE_IDS) {
    const v = volumes[id] ?? 0
    scores[id] = Math.max(0, Math.min(100, Math.round((v / target) * 100)))
  }
  return scores
}

/** Target equivalent-sets for a score of 100 across a rolling month (~10 sets/week). */
export const MONTHLY_TARGET_VOLUME = 40
/** Target equivalent-sets for a score of 100 from a single workout. */
export const WORKOUT_TARGET_VOLUME = 8

export function computeScores(workouts: Workout[], target: number): ScoreMap {
  return volumesToScores(computeMuscleVolumes(workouts), target)
}

export function computeMonthlyScores(workouts: Workout[]): ScoreMap {
  return computeScores(workouts, MONTHLY_TARGET_VOLUME)
}

export function computeWorkoutScores(workout: Workout): ScoreMap {
  return computeScores([workout], WORKOUT_TARGET_VOLUME)
}

/** Workouts whose `date` (YYYY-MM-DD) falls in the given calendar month. */
export function workoutsInMonth(workouts: Workout[], year: number, month: number): Workout[] {
  return workouts.filter((w) => {
    const d = new Date(w.date + 'T00:00:00')
    return d.getFullYear() === year && d.getMonth() === month
  })
}

function avgScore(scores: ScoreMap, ids: string[]): number {
  const vals = ids.map((id) => scores[id] ?? 0)
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

/** Average score per body region (Chest/Shoulders/Back/Arms/Core/Legs), for the Home page progress bars. */
export function computeGroupScores(scores: ScoreMap): Record<MuscleGroup, number> {
  return REGION_ORDER.reduce(
    (acc, group) => {
      acc[group] = avgScore(scores, MUSCLE_IDS_BY_GROUP[group])
      return acc
    },
    {} as Record<MuscleGroup, number>,
  )
}

/**
 * "Target" score per body region for each goal, on the same 0-100 scale as
 * the scores themselves - not a hard ceiling, just where that goal expects
 * this region to sit relative to the others. Aesthetics leans on
 * shoulders/back/chest for the V-taper; strength leans on the squat/bench/
 * deadlift chain (legs/chest/back); general fitness treats everything the
 * same.
 */
export const GOAL_GROUP_TARGETS: Record<Goal, Record<MuscleGroup, number>> = {
  aesthetics: { Chest: 80, Shoulders: 90, Back: 90, Arms: 70, Core: 60, Legs: 60 },
  strength: { Chest: 85, Shoulders: 55, Back: 85, Arms: 50, Core: 55, Legs: 90 },
  general: { Chest: 70, Shoulders: 70, Back: 70, Arms: 70, Core: 70, Legs: 70 },
}

/**
 * Scales a base target down for lifters training fewer days/week - someone
 * going once a week can't rack up the same monthly volume as someone going
 * daily, so it isn't fair to hold them to the same target. Linear from
 * frequency=1 (4/7 of the base target, e.g. 70 -> 40) up to frequency=7
 * (the full base target, unscaled).
 */
export function scaleTargetByFrequency(baseTarget: number, frequency: GymFrequency | null | undefined): number {
  if (!frequency) return baseTarget
  return Math.round(baseTarget * ((7 + frequency) / 14))
}

export function getGroupTarget(goal: Goal | null, group: MuscleGroup, frequency?: GymFrequency | null): number {
  const base = GOAL_GROUP_TARGETS[goal ?? 'general'][group]
  return scaleTargetByFrequency(base, frequency)
}

export interface GoalFeedback {
  headline: string
  tips: string[]
}

type TFunction = (key: string, vars?: Record<string, string | number>) => string

/**
 * Goal-aware feedback on this month's score distribution. Not medical or
 * training advice - just directional pointers based on which muscle groups
 * are lagging relative to the user's stated goal. `t` is the i18n translate
 * function so the headline/tips come back in the user's chosen language.
 */
export function getGoalFeedback(goal: Goal | null, scores: ScoreMap, t: TFunction): GoalFeedback {
  if (goal === 'aesthetics') {
    const shoulders = avgScore(scores, ['lateral_delt', 'anterior_delt', 'posterior_delt'])
    const back = avgScore(scores, ['lat', 'teres_major', 'mid_lower_traps'])
    const waist = avgScore(scores, ['obliques', 'rectus_abd_upper', 'rectus_abd_lower'])
    const chest = avgScore(scores, ['pec_major'])
    const arms = avgScore(scores, ['biceps', 'triceps'])
    const tips: string[] = []
    const vTaperScore = (shoulders + back) / 2 - waist * 0.3
    if (shoulders < 40) tips.push(t('feedback.aesthetics.shouldersLow'))
    if (back < 40) tips.push(t('feedback.aesthetics.backLow'))
    if (chest < 40) tips.push(t('feedback.aesthetics.chestLow'))
    if (arms < 30) tips.push(t('feedback.aesthetics.armsLow'))
    if (tips.length === 0) tips.push(t('feedback.aesthetics.goodSpread'))
    return {
      headline: t(vTaperScore > 45 ? 'feedback.aesthetics.vtaperStrong' : 'feedback.aesthetics.vtaperBuilding'),
      tips,
    }
  }

  if (goal === 'strength') {
    const squatChain = avgScore(scores, ['quad_rectus', 'quad_lateral', 'quad_medial', 'glute_max'])
    const benchChain = avgScore(scores, ['pec_major', 'triceps', 'anterior_delt'])
    const deadliftChain = avgScore(scores, ['erector_spinae', 'hamstrings', 'lat', 'glute_max'])
    const tips: string[] = []
    if (squatChain < 40) tips.push(t('feedback.strength.squatLow'))
    if (benchChain < 40) tips.push(t('feedback.strength.benchLow'))
    if (deadliftChain < 40) tips.push(t('feedback.strength.deadliftLow'))
    if (tips.length === 0) tips.push(t('feedback.strength.allGood'))
    return {
      headline: t('feedback.strength.title'),
      tips,
    }
  }

  // general fitness: flag any of the 6 broad regions that are clearly behind
  const regionScores = REGION_ORDER.map((region) => [region, avgScore(scores, MUSCLE_IDS_BY_GROUP[region])] as const)
  const behind = regionScores.filter(([, s]) => s < 25).map(([r]) => r)
  const tips = behind.length
    ? behind.map((r) => t('feedback.general.regionLight', { region: t(`group.${r}`) }))
    : [t('feedback.general.allGood')]
  return {
    headline: t(behind.length ? 'feedback.general.someBehind' : 'feedback.general.wellRounded'),
    tips,
  }
}
