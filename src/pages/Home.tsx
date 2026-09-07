import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useT } from '../contexts/I18nContext'
import { useWorkouts } from '../hooks/useWorkouts'
import { computeGroupScores, computeMonthlyScores, getGoalFeedback, getGroupTarget, workoutsInMonth } from '../lib/scoring'
import { syncCurrentMonthScores } from '../lib/leaderboard'
import { REGION_ORDER } from '../data/muscles'
import BodyModel from '../components/BodyModel'
import MuscleInfoPanel from '../components/MuscleInfoPanel'
import GroupProgressBar from '../components/GroupProgressBar'
import Leaderboard from '../components/Leaderboard'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTH_NAMES_ZH = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
]

export default function Home() {
  const { profile, updateProfile } = useAuth()
  const { t, language } = useT()
  const { workouts, loading } = useWorkouts()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const now = new Date()
  const monthWorkouts = useMemo(
    () => workoutsInMonth(workouts, now.getFullYear(), now.getMonth()),
    [workouts, now],
  )
  const scores = useMemo(() => computeMonthlyScores(monthWorkouts), [monthWorkouts])
  const feedback = useMemo(() => getGoalFeedback(profile?.goal ?? null, scores, t), [profile?.goal, scores, t])
  const groupScores = useMemo(() => computeGroupScores(scores), [scores])
  const monthLabel = language === 'zh-CN' ? MONTH_NAMES_ZH[now.getMonth()] : MONTH_NAMES[now.getMonth()]

  // Keep the publicly-readable "this month's score" (used by the
  // leaderboard) in sync with what was just computed from this user's own
  // private workouts. Fire-and-forget - not blocking, and harmless if it
  // fires more than once since syncCurrentMonthScores no-ops when unchanged.
  useEffect(() => {
    if (!profile || loading) return
    syncCurrentMonthScores(profile, workouts, updateProfile).catch((err) => {
      console.error('Failed to sync leaderboard score:', err)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, loading, workouts])

  return (
    <div className="mx-auto flex max-w-md flex-col pb-24">
      <header className="px-4 pt-6 pb-2">
        <p className="text-xs uppercase tracking-wide text-app-muted">{monthLabel} {now.getFullYear()}</p>
        <h1 className="text-xl font-medium">{t('home.header')}</h1>
        {profile?.goal ? (
          <p className="mt-0.5 text-xs text-app-muted">
            {t('home.goalPrefix')} {t(`goal.${profile.goal}.label`)}
          </p>
        ) : null}
      </header>

      <div className="relative mx-4 h-[420px] overflow-hidden rounded-2xl border border-app-border">
        <BodyModel
          scores={scores}
          selectedId={selectedId}
          onSelect={setSelectedId}
          selfieURL={profile?.selfieURL ?? null}
          className="h-full w-full"
        />
        <MuscleInfoPanel muscleId={selectedId} score={scores[selectedId ?? ''] ?? 0} onClose={() => setSelectedId(null)} />
      </div>

      <section className="mx-4 mt-4 rounded-2xl border border-app-border bg-app-surface p-4">
        <h2 className="mb-3 text-sm font-medium text-app-muted">
          {t('home.progressTitle')} {profile?.goal ? <span>({t(`goal.${profile.goal}.label`)})</span> : null}
        </h2>
        <div className="flex flex-col gap-3">
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
      </section>

      <section className="mx-4 mt-4 rounded-2xl border border-app-border bg-app-surface p-4">
        <h2 className="text-sm font-medium text-app-accent">{feedback.headline}</h2>
        <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-app-muted">
          {feedback.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <p className="mx-4 mt-4 text-center text-xs text-app-muted">
        {loading ? t('common.loading') : monthWorkouts.length === 0 ? t('home.footerEmpty') : t('home.footerNote')}
      </p>

      <Leaderboard />
    </div>
  )
}
