import { useEffect, useState } from 'react'
import { useT } from '../contexts/I18nContext'
import { getLeaderboard, type LeaderboardEntry } from '../lib/leaderboard'
import BodyModel from './BodyModel'
import LeaderboardModal from './LeaderboardModal'
import RankBadge from './RankBadge'

function displayName(entry: LeaderboardEntry): string {
  return entry.profile.displayName || entry.profile.email || '?'
}

/** Bottom-of-Home teaser: top 3 users this month, ranked by body score. Tap
 * to open the full ranked list (LeaderboardModal), which is also where you
 * drill into any one user's model + progress bars. */
export default function Leaderboard() {
  const { t } = useT()
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    getLeaderboard()
      .then((data) => {
        if (!cancelled) setEntries(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) return null
  if (entries != null && entries.length === 0) return null

  const top3 = entries?.slice(0, 3) ?? []

  return (
    <section className="mx-4 mt-4 rounded-2xl border border-app-border bg-app-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-app-muted">{t('leaderboard.title')}</h2>
        <button type="button" onClick={() => setModalOpen(true)} className="text-xs font-medium text-app-accent">
          {t('leaderboard.viewFull')}
        </button>
      </div>

      {entries == null ? (
        <p className="text-xs text-app-muted">{t('common.loading')}</p>
      ) : (
        <button type="button" onClick={() => setModalOpen(true)} className="grid w-full grid-cols-3 gap-2">
          {top3.map((entry, i) => (
            <div key={entry.profile.uid} className="flex flex-col items-center gap-1.5">
              <div className="relative h-24 w-full overflow-hidden rounded-xl border border-app-border bg-app-bg">
                <RankBadge rank={i + 1} className="absolute left-1 top-1 z-10 h-5 px-1 text-[9px]" />
                <BodyModel scores={entry.profile.currentMonthScores ?? {}} selfieURL={entry.profile.selfieURL ?? null} className="h-full w-full" />
              </div>
              <p className="w-full truncate text-center text-[11px] text-app-text">{displayName(entry)}</p>
            </div>
          ))}
        </button>
      )}

      <LeaderboardModal open={modalOpen} onClose={() => setModalOpen(false)} entries={entries ?? []} />
    </section>
  )
}
