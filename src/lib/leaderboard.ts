import { ALL_MUSCLE_IDS } from '../data/muscles'
import { getAllUserProfiles } from './firestore'
import { computeMonthlyScores, workoutsInMonth } from './scoring'
import type { ScoreMap, UserProfile, Workout } from '../types'

export function currentMonthKey(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/** Single 0-100 "body score" for a month - the average across every tracked
 * muscle - used to rank the leaderboard and as this month's "points". */
export function totalMonthlyPoints(scores: ScoreMap | null | undefined): number {
  if (!scores) return 0
  const vals = ALL_MUSCLE_IDS.map((id) => scores[id] ?? 0)
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

/**
 * Keeps a user's publicly-readable "this month's score" in sync with their
 * real (privately stored) workouts. Recomputes from their own already-loaded
 * workout list and writes it back to their own profile doc whenever it's
 * stale - new month, or scores changed since the last sync. Other users can
 * only ever read this rolled-up 0-100-per-muscle snapshot, never the
 * underlying workouts/exercises/sets/weights/comments it was computed from.
 */
export async function syncCurrentMonthScores(
  profile: UserProfile,
  workouts: Workout[],
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>,
): Promise<void> {
  const now = new Date()
  const monthKey = currentMonthKey(now)
  const scores = computeMonthlyScores(workoutsInMonth(workouts, now.getFullYear(), now.getMonth()))
  const unchanged =
    profile.currentMonthKey === monthKey &&
    JSON.stringify(profile.currentMonthScores ?? {}) === JSON.stringify(scores)
  if (unchanged) return
  await updateProfile({ currentMonthKey: monthKey, currentMonthScores: scores })
}

export interface LeaderboardEntry {
  profile: UserProfile
  points: number
}

/**
 * Every onboarded user ranked by this month's body score, highest first. A
 * profile whose stored currentMonthKey isn't this month counts as 0 points -
 * they just haven't opened the app yet this month, so nothing to rank yet.
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const profiles = await getAllUserProfiles()
  const monthKey = currentMonthKey()
  return profiles
    .filter((p) => p.onboardingComplete)
    .map((profile) => ({
      profile,
      points: profile.currentMonthKey === monthKey ? totalMonthlyPoints(profile.currentMonthScores) : 0,
    }))
    .sort((a, b) => b.points - a.points)
}
