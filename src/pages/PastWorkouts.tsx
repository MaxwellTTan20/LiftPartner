import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useT } from '../contexts/I18nContext'
import { useWorkouts } from '../hooks/useWorkouts'
import { deleteWorkout } from '../lib/firestore'
import { EXERCISE_BY_ID } from '../data/exercises'
import LiftHistoryModal from '../components/LiftHistoryModal'
import MonthlyHistorySection from '../components/MonthlyHistorySection'
import type { Workout } from '../types'

const WEEKDAY_LABELS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKDAY_LABELS_ZH = ['日', '一', '二', '三', '四', '五', '六']

function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfWeek(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  copy.setDate(copy.getDate() - copy.getDay())
  return copy
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + n)
  return copy
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6)
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth()
  const startStr = weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const endStr = weekEnd.toLocaleDateString(undefined, {
    month: sameMonth ? undefined : 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${startStr} - ${endStr}`
}

export default function PastWorkouts() {
  const { user, profile } = useAuth()
  const { t, language } = useT()
  const { workouts, loading, refresh } = useWorkouts()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [selectedIndex, setSelectedIndex] = useState(() => new Date().getDay())
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [liftHistoryOpen, setLiftHistoryOpen] = useState(false)
  const weekdayLabels = language === 'zh-CN' ? WEEKDAY_LABELS_ZH : WEEKDAY_LABELS_EN

  const byDate = useMemo(() => {
    const map = new Map<string, Workout[]>()
    for (const w of workouts) {
      const list = map.get(w.date) ?? []
      list.push(w)
      map.set(w.date, list)
    }
    return map
  }, [workouts])

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const todayKey = toDateKey(new Date())
  const isCurrentWeek = toDateKey(weekStart) === toDateKey(startOfWeek(new Date()))

  const selectedDate = days[selectedIndex]
  const selectedDateKey = toDateKey(selectedDate)
  const selectedWorkouts = byDate.get(selectedDateKey) ?? []

  function goToWeek(next: Date) {
    setWeekStart(next)
  }

  async function handleDelete(workoutId: string, date: string) {
    if (!user) return
    if (!window.confirm(t('history.deleteConfirm', { date: formatDate(date) }))) return
    setDeletingId(workoutId)
    try {
      await deleteWorkout(user.uid, workoutId)
      await refresh()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col pb-56">
      <header className="px-4 pt-6 pb-2">
        <h1 className="text-xl font-medium">{t('history.header')}</h1>
        <p className="mt-0.5 text-xs text-app-muted">{t('history.loggedCount', { n: workouts.length })}</p>
      </header>

      <button
        type="button"
        onClick={() => setLiftHistoryOpen(true)}
        className="mx-4 mt-2 flex items-center justify-between gap-3 rounded-xl border border-app-accent/40 bg-app-accent/10 p-4 text-left hover:border-app-accent"
      >
        <div>
          <p className="text-sm font-medium text-app-accent">{t('history.specificLiftTitle')}</p>
          <p className="mt-0.5 text-xs text-app-muted">{t('history.specificLiftBlurb')}</p>
        </div>
        <span aria-hidden="true" className="text-lg text-app-accent">
          &rarr;
        </span>
      </button>

      <div className="mx-4 mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goToWeek(addDays(weekStart, -7))}
          aria-label={t('history.prevWeek')}
          className="rounded-lg border border-app-border px-2.5 py-1.5 text-sm text-app-muted"
        >
          &larr;
        </button>
        <div className="text-center">
          <p className="text-sm font-medium">{formatWeekRange(weekStart)}</p>
          {!isCurrentWeek ? (
            <button
              type="button"
              onClick={() => goToWeek(startOfWeek(new Date()))}
              className="text-[11px] text-app-accent underline"
            >
              {t('history.backToThisWeek')}
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => goToWeek(addDays(weekStart, 7))}
          aria-label={t('history.nextWeek')}
          className="rounded-lg border border-app-border px-2.5 py-1.5 text-sm text-app-muted"
        >
          &rarr;
        </button>
      </div>

      {loading ? <p className="mt-3 px-4 text-sm text-app-muted">{t('common.loading')}</p> : null}

      <div className="mx-4 mt-3 grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const dateKey = toDateKey(day)
          const dayWorkouts = byDate.get(dateKey) ?? []
          const isToday = dateKey === todayKey
          const isSelected = i === selectedIndex
          const hasWorkout = dayWorkouts.length > 0

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-lg border py-1.5 text-xs ${
                isSelected ? 'border-app-accent bg-app-accent/15' : hasWorkout ? 'border-app-border bg-app-surface-2' : 'border-app-border bg-app-surface'
              }`}
            >
              <span className="text-[10px] text-app-muted">{weekdayLabels[i]}</span>
              <span className={isToday ? 'font-medium text-app-accent' : 'text-app-text'}>{day.getDate()}</span>
              {dayWorkouts.length > 1 ? (
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-app-accent text-[9px] text-white">
                  {dayWorkouts.length}
                </span>
              ) : (
                <span className={`h-1.5 w-1.5 rounded-full ${hasWorkout ? 'bg-app-accent' : ''}`} />
              )}
            </button>
          )
        })}
      </div>

      <div className="mx-4 mt-4 flex flex-col gap-2">
        <h2 className="text-sm font-medium">
          {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </h2>

        {selectedWorkouts.length === 0 ? (
          <div className="rounded-xl border border-app-border bg-app-surface p-4 text-center">
            <p className="text-sm text-app-muted">{t('history.noWorkoutsThisDay')}</p>
            <div className="mt-3 flex justify-center gap-3">
              <Link
                to="/plan"
                className="rounded-full border border-app-border px-4 py-2 text-sm text-app-text hover:border-app-accent"
              >
                {t('history.planWorkout')}
              </Link>
              <Link to="/log" className="rounded-full bg-app-accent px-4 py-2 text-sm font-medium text-white">
                {t('history.logWorkout')}
              </Link>
            </div>
          </div>
        ) : (
          selectedWorkouts.map((w) => {
            const names = w.exercises.map((e) => EXERCISE_BY_ID[e.exerciseId]?.name).filter(Boolean)
            const setCount = w.exercises.reduce((sum, e) => sum + e.sets.length, 0)
            return (
              <div key={w.id} className="relative rounded-xl border border-app-border bg-app-surface p-3.5 hover:border-app-accent">
                <Link to={`/history/${w.id}`} className="block pr-6">
                  <p className="text-xs text-app-muted">{t('history.liftsAndSets', { lifts: w.exercises.length, sets: setCount })}</p>
                  <p className="mt-1 truncate pr-2 text-xs text-app-muted">{names.join(', ') || t('history.noLiftsLogged')}</p>
                </Link>
                <Link
                  to={`/history/${w.id}`}
                  className="mt-2.5 flex items-center gap-1 text-xs font-medium text-app-accent"
                >
                  {t('history.viewDetails')} <span aria-hidden="true">&rarr;</span>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(w.id, w.date)}
                  disabled={deletingId === w.id}
                  aria-label={t('common.delete')}
                  className="absolute right-3 top-3 text-app-muted hover:text-app-accent disabled:opacity-40"
                >
                  {deletingId === w.id ? '...' : '×'}
                </button>
              </div>
            )
          })
        )}
      </div>

      <MonthlyHistorySection workouts={workouts} profile={profile} />

      <LiftHistoryModal open={liftHistoryOpen} onClose={() => setLiftHistoryOpen(false)} workouts={workouts} />
    </div>
  )
}
