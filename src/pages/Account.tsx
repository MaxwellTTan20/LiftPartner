import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useT } from '../contexts/I18nContext'
import { uploadSelfie } from '../lib/firestore'
import { withTimeout } from '../lib/utils'
import { LANGUAGES, LANGUAGE_LABELS, type Language } from '../lib/i18n'
import SelfieCamera from '../components/SelfieCamera'
import type { Goal, GymFrequency, WeightUnit } from '../types'

const GOALS: Goal[] = ['aesthetics', 'strength', 'general']
const FREQUENCIES: GymFrequency[] = [1, 2, 3, 4, 5, 6, 7]

export default function Account() {
  const { user, profile, updateProfile, signOutUser } = useAuth()
  const { t } = useT()
  const [retaking, setRetaking] = useState(false)
  const [savingSelfie, setSavingSelfie] = useState(false)
  const [selfieError, setSelfieError] = useState<string | null>(null)

  if (!user || !profile) return null

  async function handleCapture(blob: Blob) {
    setSavingSelfie(true)
    setSelfieError(null)
    try {
      const selfieURL = await withTimeout(uploadSelfie(user!.uid, blob), 15000, 'Selfie upload')
      await withTimeout(updateProfile({ selfieURL }), 15000, 'Saving your profile')
      setRetaking(false)
    } catch (err) {
      setSelfieError(err instanceof Error ? `${t('account.selfieErrorPrefix')} ${err.message}` : t('account.selfieErrorGeneric'))
    } finally {
      setSavingSelfie(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pb-24 pt-6">
      <header className="flex items-center gap-3">
        {profile.selfieURL || profile.googlePhotoURL ? (
          <img
            src={profile.selfieURL ?? profile.googlePhotoURL ?? undefined}
            alt=""
            className="h-14 w-14 rounded-full border border-app-border object-cover"
          />
        ) : (
          <div className="h-14 w-14 rounded-full border border-app-border bg-app-surface" />
        )}
        <div>
          <p className="font-medium">{profile.displayName ?? t('account.defaultName')}</p>
          <p className="text-xs text-app-muted">{profile.email}</p>
        </div>
      </header>

      <section>
        <h2 className="mb-2 text-sm font-medium text-app-muted">{t('account.modelSelfie')}</h2>
        {retaking ? (
          <div className="flex flex-col items-center gap-3">
            <SelfieCamera onCapture={(blob) => handleCapture(blob)} />
            {savingSelfie ? <p className="text-xs text-app-muted">{t('account.saving')}</p> : null}
            {selfieError ? <p className="max-w-xs text-center text-xs text-app-accent">{selfieError}</p> : null}
            <button type="button" onClick={() => setRetaking(false)} className="text-xs text-app-muted underline">
              {t('common.cancel')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRetaking(true)}
            className="rounded-lg border border-app-border bg-app-surface px-4 py-2.5 text-sm"
          >
            {t('account.retakeSelfie')}
          </button>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-app-muted">{t('account.language')}</h2>
        <select
          value={profile.language ?? 'en'}
          onChange={(e) => updateProfile({ language: e.target.value as Language })}
          className="w-full rounded-lg border border-app-border bg-app-surface px-4 py-2.5 text-sm text-app-text"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {LANGUAGE_LABELS[lang]}
            </option>
          ))}
        </select>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-app-muted">{t('account.weightUnit')}</h2>
        <div className="grid grid-cols-2 gap-2">
          {(['lbs', 'kg'] as WeightUnit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => updateProfile({ weightUnit: u })}
              className={`rounded-lg border py-2.5 text-sm font-medium ${
                (profile.weightUnit ?? 'lbs') === u ? 'border-app-accent bg-app-accent/15 text-app-accent' : 'border-app-border bg-app-surface'
              }`}
            >
              {t(`account.unit.${u}`)}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-app-muted">{t('account.goal')}</h2>
        <div className="flex flex-col gap-2">
          {GOALS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => updateProfile({ goal: g })}
              className={`rounded-lg border px-4 py-2.5 text-left text-sm ${
                profile.goal === g ? 'border-app-accent bg-app-accent/15 text-app-accent' : 'border-app-border bg-app-surface'
              }`}
            >
              {t(`goal.${g}.label`)}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-app-muted">{t('account.frequency')}</h2>
        <div className="grid grid-cols-4 gap-2">
          {FREQUENCIES.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => updateProfile({ frequency: f })}
              className={`rounded-lg border py-2.5 text-sm font-medium ${
                profile.frequency === f ? 'border-app-accent bg-app-accent/15 text-app-accent' : 'border-app-border bg-app-surface'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={() => signOutUser()}
        className="mt-2 rounded-full border border-app-border px-4 py-2.5 text-sm text-app-muted"
      >
        {t('account.signOut')}
      </button>
    </div>
  )
}
