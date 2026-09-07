import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useT } from '../contexts/I18nContext'
import { useWorkouts } from '../hooks/useWorkouts'
import { EXERCISE_BY_ID } from '../data/exercises'
import { addWorkout } from '../lib/firestore'
import { computeWorkoutScores } from '../lib/scoring'
import { toDisplayWeight, toStoredLbs } from '../lib/units'
import BodyModel from '../components/BodyModel'
import MuscleInfoPanel from '../components/MuscleInfoPanel'
import ExercisePickerModal from '../components/ExercisePickerModal'
import LiftHistoryModal from '../components/LiftHistoryModal'
import type { PlanWorkout, Workout, WorkoutExerciseEntry } from '../types'

// NOTE: deliberately NOT `new Date().toISOString().slice(0, 10)` - that
// returns the UTC calendar date, which silently drifts a day off from the
// user's actual local date for a big chunk of the day in any timezone
// behind UTC (e.g. in US timezones, anything logged after ~mid-afternoon
// local time was getting stamped as tomorrow). Build the date from local
// components instead, matching how the History calendar keys days.
function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Local editing model: reps/weight start out empty (null) rather than a
// real number so a plan's predicted target can show as placeholder "ghost"
// text - the user still has to type their own actual reps/weight, the plan
// just gives them something to aim for. Weight is always stored in lbs here
// too (converted to/from the user's preferred display unit only at the
// input boundary) so it matches how workouts get saved.
interface DraftSet {
  reps: number | null
  weightLbs: number | null
}
interface DraftExercise {
  exerciseId: string
  sets: DraftSet[]
  targetReps: number | null
  targetWeightLbs: number | null
}

function draftFromPlan(plan: PlanWorkout): DraftExercise[] {
  return plan.exercises.map((t) => ({
    exerciseId: t.exerciseId,
    targetReps: t.targetReps,
    targetWeightLbs: t.targetWeightLbs,
    sets: Array.from({ length: t.sets }, () => ({ reps: null, weightLbs: null })),
  }))
}

// The in-progress workout is persisted to localStorage as you build it, so
// navigating to another tab (accidentally or not) - or even closing the
// browser - doesn't wipe out unsaved logging. It's cleared once the workout
// is actually saved.
interface StoredDraft {
  date: string
  entries: DraftExercise[]
  comment?: string
}

function draftKey(uid: string): string {
  return `liftpartner:draft:${uid}`
}

function loadDraft(uid: string): StoredDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(uid))
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredDraft
    return parsed && Array.isArray(parsed.entries) ? parsed : null
  } catch {
    return null
  }
}

function saveDraft(uid: string, draft: StoredDraft) {
  try {
    localStorage.setItem(draftKey(uid), JSON.stringify(draft))
  } catch {
    // storage unavailable/full - not critical, logging still works without persistence
  }
}

function clearDraft(uid: string) {
  try {
    localStorage.removeItem(draftKey(uid))
  } catch {
    // ignore
  }
}

export default function LogWorkout() {
  const { user, profile, updateProfile } = useAuth()
  const { t } = useT()
  const { workouts, refresh } = useWorkouts()
  const weightUnit = profile?.weightUnit ?? 'lbs'

  const [date, setDate] = useState(() => (user ? loadDraft(user.uid)?.date : null) ?? todayISO())
  const [pickerOpen, setPickerOpen] = useState(false)
  const [liftHistoryId, setLiftHistoryId] = useState<string | null>(null)
  const [entries, setEntries] = useState<DraftExercise[]>(() => {
    const stored = user ? loadDraft(user.uid) : null
    if (stored && stored.entries.length > 0) return stored.entries
    return profile?.activePlan ? draftFromPlan(profile.activePlan) : []
  })
  const [comment, setComment] = useState(() => (user ? loadDraft(user.uid)?.comment : null) ?? '')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Keep the draft mirrored to localStorage as it changes.
  useEffect(() => {
    if (!user) return
    if (entries.length === 0) {
      clearDraft(user.uid)
    } else {
      saveDraft(user.uid, { date, entries, comment })
    }
  }, [user, date, entries, comment])

  const workoutExercises: WorkoutExerciseEntry[] = useMemo(
    () =>
      entries.map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets
          .filter((s) => s.reps != null)
          .map((s) => {
            // Firestore rejects literal `undefined` field values (addDoc throws),
            // so the weightLbs key must be omitted entirely - not set to undefined -
            // when the user leaves weight blank (e.g. bodyweight exercises like crunches).
            const set: { reps: number; weightLbs?: number } = { reps: s.reps as number }
            if (s.weightLbs != null) set.weightLbs = s.weightLbs
            return set
          }),
      })),
    [entries],
  )
  const draftWorkout: Workout = useMemo(
    () => ({ id: 'draft', date, createdAt: Date.now(), exercises: workoutExercises }),
    [date, workoutExercises],
  )
  const scores = useMemo(() => computeWorkoutScores(draftWorkout), [draftWorkout])
  const hasLoggedSets = workoutExercises.some((e) => e.sets.length > 0)

  function addExercise(exerciseId: string) {
    setEntries((prev) => {
      if (prev.some((e) => e.exerciseId === exerciseId)) return prev
      return [...prev, { exerciseId, targetReps: null, targetWeightLbs: null, sets: [{ reps: 8, weightLbs: null }] }]
    })
  }

  function removeExercise(exerciseId: string) {
    setEntries((prev) => prev.filter((e) => e.exerciseId !== exerciseId))
  }

  function addSet(exerciseId: string) {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.exerciseId !== exerciseId) return e
        const last = e.sets[e.sets.length - 1]
        const nextSet: DraftSet = { reps: last?.reps ?? null, weightLbs: last?.weightLbs ?? null }
        return { ...e, sets: [...e.sets, nextSet] }
      }),
    )
  }

  function updateSet(exerciseId: string, index: number, patch: Partial<DraftSet>) {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.exerciseId !== exerciseId) return e
        const sets = e.sets.map((s, i) => (i === index ? { ...s, ...patch } : s))
        return { ...e, sets }
      }),
    )
  }

  function removeSet(exerciseId: string, index: number) {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.exerciseId !== exerciseId) return e
        return { ...e, sets: e.sets.filter((_, i) => i !== index) }
      }),
    )
  }

  async function clearPlan() {
    await updateProfile({ activePlan: null })
    setEntries([])
    setComment('')
  }

  function startOver() {
    if (entries.length > 0 && !window.confirm(t('log.discardConfirm'))) return
    setEntries([])
    setComment('')
    setDate(todayISO())
  }

  async function saveWorkout() {
    if (!user || !hasLoggedSets) return
    setSaving(true)
    setSaveError(null)
    try {
      const exercisesToSave = workoutExercises.filter((e) => e.sets.length > 0)
      const trimmedComment = comment.trim()
      // Same rule as weightLbs: Firestore rejects a literal `undefined` field
      // value, so only attach `notes` at all when there's actually something
      // to save, rather than always setting notes: comment || undefined.
      const workoutToSave = trimmedComment
        ? { date, createdAt: Date.now(), exercises: exercisesToSave, notes: trimmedComment }
        : { date, createdAt: Date.now(), exercises: exercisesToSave }
      await addWorkout(user.uid, workoutToSave)
      await updateProfile({ activePlan: null })
      await refresh()
      setEntries([])
      setComment('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col pb-24">
      <header className="flex items-center justify-between px-4 pt-6 pb-2">
        <h1 className="text-xl font-medium">{t('log.header')}</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-app-border bg-app-surface px-2 py-1 text-sm text-app-text"
        />
      </header>

      {profile?.activePlan ? (
        <div className="mx-4 mb-2 flex items-center justify-between rounded-lg border border-app-border bg-app-surface px-3 py-2">
          <p className="text-xs text-app-muted">{t('log.followingPlan', { day: t(`daytype.${profile.activePlan.dayType}`) })}</p>
          <button type="button" onClick={clearPlan} className="text-xs text-app-muted underline">
            {t('log.clearPlan')}
          </button>
        </div>
      ) : null}

      {entries.length > 0 ? (
        <div className="mx-4 mb-2 flex items-center justify-between">
          <p className="text-[11px] text-app-muted">{t('log.autoSaved')}</p>
          <button type="button" onClick={startOver} className="text-xs text-app-muted underline">
            {t('log.startOver')}
          </button>
        </div>
      ) : null}

      <div className="relative mx-4 h-[300px] overflow-hidden rounded-2xl border border-app-border">
        <BodyModel
          scores={scores}
          selectedId={selectedId}
          onSelect={setSelectedId}
          selfieURL={profile?.selfieURL ?? null}
          className="h-full w-full"
        />
        <MuscleInfoPanel muscleId={selectedId} score={scores[selectedId ?? ''] ?? 0} onClose={() => setSelectedId(null)} />
      </div>
      <p className="mx-4 mt-2 text-center text-xs text-app-muted">{t('log.previewNote')}</p>

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="mx-4 mt-4 flex items-center gap-2 rounded-lg border border-app-border bg-app-surface px-3 py-2.5 text-sm text-app-muted"
      >
        <span aria-hidden="true">+</span> {t('log.addLift')}
      </button>

      <ExercisePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addExercise}
        excludeIds={entries.map((e) => e.exerciseId)}
      />

      <div className={`mx-4 mt-4 flex flex-1 flex-col gap-3 ${entries.length === 0 ? 'items-center justify-center text-center' : ''}`}>
        {entries.length === 0 ? <p className="text-sm text-app-muted">{t('log.emptyState')}</p> : null}
        {entries.map((entry) => {
          const exercise = EXERCISE_BY_ID[entry.exerciseId]
          if (!exercise) return null
          const targetWeightDisplay =
            entry.targetWeightLbs != null ? toDisplayWeight(entry.targetWeightLbs, weightUnit) : null
          return (
            <div key={entry.exerciseId} className="rounded-xl border border-app-border bg-app-surface p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">{exercise.name}</h3>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setLiftHistoryId(entry.exerciseId)}
                    className="text-xs text-app-muted underline hover:text-app-accent"
                  >
                    {t('log.viewLiftHistory')}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeExercise(entry.exerciseId)}
                    className="text-xs text-app-muted hover:text-app-accent"
                  >
                    {t('common.remove')}
                  </button>
                </div>
              </div>
              {entry.targetReps != null ? (
                <p className="mb-1.5 text-[11px] text-app-muted">
                  {t('log.target')} {entry.targetReps} {t('common.reps')}
                  {targetWeightDisplay != null ? ` @ ${targetWeightDisplay} ${weightUnit}` : ''}
                </p>
              ) : null}
              <div className="flex flex-col gap-1.5">
                {entry.sets.map((set, i) => {
                  const weightDisplay = set.weightLbs != null ? toDisplayWeight(set.weightLbs, weightUnit) : null
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-4 text-app-muted">{i + 1}</span>
                      <input
                        type="number"
                        min={0}
                        value={set.reps ?? ''}
                        placeholder={entry.targetReps != null ? String(entry.targetReps) : undefined}
                        onChange={(e) =>
                          updateSet(entry.exerciseId, i, { reps: e.target.value === '' ? null : Number(e.target.value) })
                        }
                        className="w-16 rounded-md border border-app-border bg-app-surface-2 px-2 py-1 placeholder:text-app-muted"
                      />
                      <span className="text-xs text-app-muted">{t('common.reps')}</span>
                      <input
                        type="number"
                        min={0}
                        placeholder={targetWeightDisplay != null ? String(targetWeightDisplay) : weightUnit}
                        value={weightDisplay ?? ''}
                        onChange={(e) =>
                          updateSet(entry.exerciseId, i, {
                            weightLbs: e.target.value === '' ? null : toStoredLbs(Number(e.target.value), weightUnit),
                          })
                        }
                        className="w-16 rounded-md border border-app-border bg-app-surface-2 px-2 py-1 placeholder:text-app-muted"
                      />
                      <span className="text-xs text-app-muted">{weightUnit}</span>
                      <button
                        type="button"
                        onClick={() => removeSet(entry.exerciseId, i)}
                        className="ml-auto text-app-muted hover:text-app-accent"
                        aria-label={t('common.remove')}
                      >
                        &times;
                      </button>
                    </div>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => addSet(entry.exerciseId)}
                className="mt-2 text-xs font-medium text-app-accent"
              >
                {t('log.addSet')}
              </button>
            </div>
          )
        })}
      </div>

      <div className="mx-4 mt-5 flex flex-col gap-1.5">
        <label htmlFor="workout-comment" className="text-xs font-medium text-app-muted">
          {t('log.comment')}
        </label>
        <textarea
          id="workout-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('log.commentPlaceholder')}
          rows={2}
          className="w-full resize-none rounded-lg border border-app-border bg-app-surface-2 px-3 py-2 text-sm text-app-text placeholder:text-app-muted"
        />
      </div>

      <div className="mx-4 mt-3">
        <button
          type="button"
          disabled={!hasLoggedSets || saving}
          onClick={saveWorkout}
          className="w-full rounded-full bg-app-accent py-3 text-sm font-medium text-white disabled:opacity-40"
        >
          {saving ? t('log.saving') : t('log.saveWorkout')}
        </button>
        {saved ? <p className="mt-2 text-center text-xs text-app-muted">{t('log.workoutSaved')}</p> : null}
        {saveError ? <p className="mt-2 text-center text-xs text-red-500">{saveError}</p> : null}
      </div>

      <LiftHistoryModal
        open={liftHistoryId !== null}
        onClose={() => setLiftHistoryId(null)}
        workouts={workouts}
        initialExerciseId={liftHistoryId}
      />
    </div>
  )
}
