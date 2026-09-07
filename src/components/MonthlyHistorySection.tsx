import { useMemo } from 'react'
import { useT } from '../contexts/I18nContext'
import { computeGroupScores, computeMonthlyScores, getGroupTarget, workoutsInMonth } from '../lib/scoring'
import { REGION_ORDER } from '../data/muscles'
import { formatMonthLabel, monthKeyOf } from '../lib/dates'
import type { UserProfile, Workout } from '../types'
import BodyModel from './BodyModel'
import GroupProgressBar from './GroupProgressBar'

interface MonthlyHistorySectionProps {
  workouts: Workout[]
  profile: UserProfile | null
}

/** Every past calendar month (not the current one - that's live on Home)
 * that has at least one logged workout, each rendered as its own frozen
 * model + progress-bar snapshot for that month. */
export default function MonthlyHistorySection({ workouts, profile }: MonthlyHistorySectionProps) {
  const { t, language } = useT()

  const now = new Date()
  const thisMonthKey = monthKeyOf(now.getFullYear(), now.getMonth())

  const monthKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const w of workouts) {
      const d = new Date(w.date + 'T00:00:00')
      keys.add(monthKeyOf(d.getFullYear(), d.getMonth()))
    }
    keys.delete(thisMonthKey)
    return Array.from(keys).sort((a, b) => b.localeCompare(a))
  }, [workouts, thisMonthKey])

  return (
    <div className="mx-4 mt-6 flex flex-col gap-4">
      <h2 className="text-sm font-medium text-app-muted">{t('history.pastMonths')}</h2>
      {monthKeys.length === 0 ? (
        <div className="rounded-2xl border border-app-border bg-app-surface p-4 text-center">
          <p className="text-sm text-app-muted">{t('history.noPastMonths')}</p>
        </div>
      ) : null}
      {monthKeys.map((monthKey) => {
        const [year, month] = monthKey.split('-').map(Number)
        const scores = computeMonthlyScores(workoutsInMonth(workouts, year, month - 1))
        const groupScores = computeGroupScores(scores)
        return (
          <div key={monthKey} className="rounded-2xl border border-app-border bg-app-surface p-4">
            <p className="mb-2 text-xs uppercase tracking-wide text-app-muted">{formatMonthLabel(monthKey, language)}</p>
            <div className="relative h-[220px] overflow-hidden rounded-xl border border-app-border">
              <BodyModel scores={scores} selfieURL={profile?.selfieURL ?? null} className="h-full w-full" />
            </div>
            <div className="mt-3 flex flex-col gap-2.5">
              {REGION_ORDER.map((group) => (
                <GroupProgressBar
                  key={group}
                  label={t(`group.${group}`)}
                  score={groupScores[group]}
                  target={getGroupTarget(profile?.goal ?? null, group, profile?.frequency)}
                  targetLabel={t('home.target')}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
