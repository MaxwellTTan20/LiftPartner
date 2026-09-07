import { useMemo, useState } from 'react'
import {
  getExercisesByGroupAndEquipment,
  LOWER_BODY_GROUPS,
  searchExercises,
  UPPER_BODY_GROUPS,
} from '../data/exercises'
import { useT } from '../contexts/I18nContext'
import type { Equipment, Exercise, MuscleGroup } from '../types'
import { EQUIPMENT_TYPES } from '../types'

interface ExerciseBrowserProps {
  onSelect: (exerciseId: string) => void
  onCancel: () => void
  /** exercise ids hidden from the browse/search results */
  excludeIds?: string[]
  cancelLabel?: string
}

type Half = 'upper' | 'lower' | null

function ExerciseList({
  exercises,
  onSelect,
  emptyLabel,
}: {
  exercises: Exercise[]
  onSelect: (id: string) => void
  emptyLabel: string
}) {
  const { t } = useT()
  if (exercises.length === 0) {
    return <p className="px-1 text-sm text-app-muted">{emptyLabel}</p>
  }
  return (
    <ul className="flex flex-col gap-2">
      {exercises.map((ex) => (
        <li key={ex.id}>
          <button
            type="button"
            onClick={() => onSelect(ex.id)}
            className="flex w-full items-center justify-between rounded-lg border border-app-border bg-app-surface px-3 py-2.5 text-left text-sm hover:border-app-accent"
          >
            <span>{ex.name}</span>
            <span className="text-xs text-app-muted">{t(`equipment.${ex.equipment}`)}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

/**
 * Full-screen "pick a lift" browser: search bar always up top, or drill down
 * Upper/Lower Body -> body part -> equipment type -> lift list (e.g. Upper ->
 * Chest -> Bodyweight -> Push-Ups). Used both for adding a lift to a workout
 * (ExercisePickerModal) and for choosing which lift's history to view
 * (LiftHistoryModal) - the two differ only in what `onSelect` does with the
 * chosen id.
 */
export default function ExerciseBrowser({ onSelect, onCancel, excludeIds = [], cancelLabel }: ExerciseBrowserProps) {
  const { t } = useT()
  const [query, setQuery] = useState('')
  const [half, setHalf] = useState<Half>(null)
  const [part, setPart] = useState<MuscleGroup | null>(null)
  const [equipment, setEquipment] = useState<Equipment | null>(null)

  const searching = query.trim().length > 0

  const searchResults = useMemo(
    () => (searching ? searchExercises(query).filter((e) => !excludeIds.includes(e.id)).slice(0, 25) : []),
    [query, searching, excludeIds],
  )
  const equipmentExercises = useMemo(
    () =>
      part && equipment
        ? getExercisesByGroupAndEquipment(part, equipment).filter((e) => !excludeIds.includes(e.id))
        : [],
    [part, equipment, excludeIds],
  )

  function goBack() {
    if (equipment) setEquipment(null)
    else if (part) setPart(null)
    else setHalf(null)
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-app-bg">
      <div
        className="flex items-center gap-2 border-b border-app-border px-4 pb-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
      >
        {(half || part || equipment) && !searching ? (
          <button type="button" onClick={goBack} aria-label={t('common.back')} className="text-lg text-app-muted">
            &larr;
          </button>
        ) : null}
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('browser.searchPlaceholder')}
          className="flex-1 rounded-lg border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text placeholder:text-app-muted"
        />
        <button type="button" onClick={onCancel} className="text-sm text-app-muted">
          {cancelLabel ?? t('common.cancel')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {searching ? (
          <ExerciseList exercises={searchResults} onSelect={onSelect} emptyLabel={t('browser.noMatchingLifts')} />
        ) : !half ? (
          <div className="flex flex-col gap-3">
            <p className="px-1 text-xs uppercase tracking-wide text-app-muted">{t('browser.browseByBodyPart')}</p>
            <button
              type="button"
              onClick={() => setHalf('upper')}
              className="rounded-xl border border-app-border bg-app-surface p-4 text-left hover:border-app-accent"
            >
              <p className="font-medium">{t('browser.upperBody')}</p>
              <p className="mt-1 text-xs text-app-muted">{t('browser.upperBodyBlurb')}</p>
            </button>
            <button
              type="button"
              onClick={() => setHalf('lower')}
              className="rounded-xl border border-app-border bg-app-surface p-4 text-left hover:border-app-accent"
            >
              <p className="font-medium">{t('browser.lowerBody')}</p>
              <p className="mt-1 text-xs text-app-muted">{t('browser.lowerBodyBlurb')}</p>
            </button>
          </div>
        ) : !part ? (
          <div className="flex flex-col gap-3">
            {(half === 'upper' ? UPPER_BODY_GROUPS : LOWER_BODY_GROUPS).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setPart(g)}
                className="rounded-xl border border-app-border bg-app-surface p-4 text-left hover:border-app-accent"
              >
                <p className="font-medium">{t(`group.${g}`)}</p>
              </button>
            ))}
          </div>
        ) : !equipment ? (
          <div className="flex flex-col gap-3">
            <p className="px-1 text-xs uppercase tracking-wide text-app-muted">
              {t('browser.pickEquipment', { part: t(`group.${part}`) })}
            </p>
            {EQUIPMENT_TYPES.map((eq) => (
              <button
                key={eq}
                type="button"
                onClick={() => setEquipment(eq)}
                className="rounded-xl border border-app-border bg-app-surface p-4 text-left hover:border-app-accent"
              >
                <p className="font-medium">{t(`equipment.${eq}`)}</p>
                <p className="mt-1 text-xs text-app-muted">{t(`equipment.${eq}.blurb`)}</p>
              </button>
            ))}
          </div>
        ) : (
          <ExerciseList exercises={equipmentExercises} onSelect={onSelect} emptyLabel={t('browser.noLiftsInCategory')} />
        )}
      </div>
    </div>
  )
}
