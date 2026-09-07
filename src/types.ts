export type MuscleGroup = 'Chest' | 'Shoulders' | 'Back' | 'Arms' | 'Core' | 'Legs'
export type MuscleShape = 'ellipsoid' | 'dome'
export type MuscleSide = 'both' | 'center'

export interface MuscleDef {
  id: string
  name: string
  group: MuscleGroup
  side: MuscleSide
  shape: MuscleShape
  /** local body-space position, right-side / center values (mirrored automatically for side:'both') */
  pos: [number, number, number]
  scale: [number, number, number]
  /** Euler rotation in degrees, used for ellipsoid muscles */
  rot?: [number, number, number]
  /** outward-facing direction the dome apex should point toward, used for dome muscles */
  normal?: [number, number, number]
}

export type Goal = 'aesthetics' | 'strength' | 'general'

export const GOAL_LABELS: Record<Goal, string> = {
  aesthetics: 'Aesthetics (Hypertrophy)',
  strength: 'Strength (Powerlifting)',
  general: 'General Fitness',
}

export type Equipment = 'Barbell' | 'Dumbbell' | 'Cable' | 'Machine' | 'Bodyweight'

export const EQUIPMENT_TYPES: Equipment[] = ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight']

export const EQUIPMENT_BLURB: Record<Equipment, string> = {
  Barbell: 'Heaviest loading, great for bilateral strength.',
  Dumbbell: 'Independent arm/leg movement, freer range of motion.',
  Cable: 'Continuous, smooth tension throughout the movement.',
  Machine: 'Fixed path of motion - stable and easy to isolate safely.',
  Bodyweight: 'Your own weight against gravity - highly functional.',
}

export interface Exercise {
  id: string
  name: string
  equipment: Equipment
  /** how this exercise is best logged */
  logType: 'reps_weight' | 'reps_bodyweight' | 'reps_only'
  /** muscleId -> relative emphasis, roughly 0..1, 1 = the prime mover */
  muscles: Record<string, number>
}

export interface WorkoutSet {
  reps: number
  weightLbs?: number
}

export interface WorkoutExerciseEntry {
  exerciseId: string
  sets: WorkoutSet[]
}

export interface Workout {
  id: string
  /** ISO date string, e.g. 2026-07-01 */
  date: string
  createdAt: number
  exercises: WorkoutExerciseEntry[]
  notes?: string
}

export type GymFrequency = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type DayType = 'push' | 'pull' | 'legs' | 'full_body' | 'upper' | 'lower'

export const DAY_TYPE_LABELS: Record<DayType, string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  full_body: 'Full Body',
  upper: 'Upper',
  lower: 'Lower',
}

export interface PlanExerciseTarget {
  exerciseId: string
  sets: number
  /** predicted target (previous best + progression), or null if no history for this lift yet */
  targetReps: number | null
  targetWeightLbs: number | null
}

export interface PlanWorkout {
  dayType: DayType
  createdAt: number
  exercises: PlanExerciseTarget[]
}

export type Language = 'en' | 'zh-CN'
export type WeightUnit = 'lbs' | 'kg'

export interface UserProfile {
  uid: string
  displayName: string | null
  email: string | null
  googlePhotoURL: string | null
  selfieURL: string | null
  goal: Goal | null
  frequency: GymFrequency | null
  onboardingComplete: boolean
  createdAt: number
  activePlan?: PlanWorkout | null
  language?: Language | null
  weightUnit?: WeightUnit | null
  /** "YYYY-MM" the fields below were computed for - lets readers tell a
   * fresh score apart from a stale one left over from a month the owner
   * hasn't opened the app in yet. This + currentMonthScores is the ONLY
   * cross-user-readable summary of someone's workouts - the actual
   * exercises/sets/weights/comments never leave their own account. */
  currentMonthKey?: string | null
  currentMonthScores?: ScoreMap | null
}

/** muscleId -> score 0..100 */
export type ScoreMap = Record<string, number>
