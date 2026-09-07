import type { WeightUnit } from '../types'

const LBS_PER_KG = 2.20462

/**
 * All weights are stored in lbs internally (WorkoutSet.weightLbs,
 * PlanExerciseTarget.targetWeightLbs) regardless of the user's display
 * preference - only the UI layer converts, so scoring/plan/history logic
 * never has to think about units.
 */
export function lbsToKg(lbs: number): number {
  return lbs / LBS_PER_KG
}

export function kgToLbs(kg: number): number {
  return kg * LBS_PER_KG
}

/** Convert a stored lbs value to the user's preferred display unit, rounded to 1 decimal. */
export function toDisplayWeight(lbs: number, unit: WeightUnit): number {
  const val = unit === 'kg' ? lbsToKg(lbs) : lbs
  return Math.round(val * 10) / 10
}

/** Convert a value the user typed in their preferred unit back to lbs for storage. */
export function toStoredLbs(value: number, unit: WeightUnit): number {
  const lbs = unit === 'kg' ? kgToLbs(value) : value
  return Math.round(lbs * 10) / 10
}
