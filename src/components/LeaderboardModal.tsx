import { useState } from 'react'
import { useT } from '../contexts/I18nContext'
import { computeGroupScores, getGroupTarget } from '../lib/scoring'
import { REGION_ORDER } from '../data/muscles'
import type { LeaderboardEntry } from '../lib/leaderboard'
import BodyModel from './BodyModel'
import GroupProgressBar from './GroupProgressBar'
import RankBadge from './RankBadge'

interface LeaderboardModalProps {
  open: boolean
  onClose: () => void
  entries: LeaderboardEntry[]
}

function displayName(entry: LeaderboardEntry): string {
  return entry.profile.displayName || entry.profile.email || '?'
}

export default function LeaderboardModal({ open, onClose, entries }: LeaderboardModalProps) {
  const { t } = useT()
  const [selectedUid, setSelectedUid] = useState<string | null>(null)

  if (!open) return null

  const selected = selectedUid ? entries.find((e) => e.profile.uid === selectedUid) : null

  function close() {
    setSelectedUid(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-app-bg">
      <div
        className="flex items-center gap-2 border-b border-app-border px-4 pb-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
      >
        {selected ? (
          <button type="button" onClick={() => setSelectedUid(null)} aria-label={t('common.back')} className="text-lg text-app-muted">
            &larr;
          </button>
        ) : null}
        <h2 className="flex-1 truncate text-sm font-medium">
          {selected ? displayName(selected) : t('leaderboard.fullTitle')}
        </h2>
        <button type="button" onClick={close} className="text-sm text-app-muted">
          {t('common.close')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {selected ? (
          <div className="flex flex-col gap-4">
            <div className="relative mx-auto h-[320px] w-full max-w-md overflow-hidden rounded-2xl border border-app-border">
              <BodyModel scores={selected.profile.currentMonthScores ?? {}} selfieURL={selected.profile.selfieURL ?? null} className="h-full w-full" />
            </div>
            <div className="rounded-2xl border border-app-border bg-app-surface p-4">
              <h3 className="mb-3 text-sm font-medium text-app-muted">{t('home.progressTitle')}</h3>
              <div className="flex flex-col gap-3">
                {REGION_ORDER.map((group) => (
                  <GroupProgressBar
                    key={group}
                    label={t(`group.${group}`)}
                    score={computeGroupScores(selected.profile.currentMonthScores ?? {})[group]}
                    target={getGroupTarget(selected.profile.goal ?? null, group, selected.profile.frequency)}
                    targetLabel={t('home.target')}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-app-muted">{t('leaderboard.empty')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((entry, i) => (
              <li key={entry.profile.uid}>
                <button
                  type="button"
                  onClick={() => setSelectedUid(entry.profile.uid)}
                  className="flex w-full items-center gap-3 rounded-xl border border-app-border bg-app-surface p-2.5 text-left hover:border-app-accent"
                >
                  <RankBadge rank={i + 1} className="h-6 min-w-6 shrink-0 px-1 text-xs" />
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-app-border bg-app-bg">
                    <BodyModel scores={entry.profile.currentMonthScores ?? {}} selfieURL={entry.profile.selfieURL ?? null} className="h-full w-full" />
                  </div>
                  <span className="truncate text-sm">{displayName(entry)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
