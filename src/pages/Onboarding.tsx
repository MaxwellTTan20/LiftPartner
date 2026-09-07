import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useT } from '../contexts/I18nContext'
import { uploadSelfie } from '../lib/firestore'
import { withTimeout } from '../lib/utils'
import { LANGUAGES, LANGUAGE_LABELS, type Language } from '../lib/i18n'
import SelfieCamera from '../components/SelfieCamera'
import type { Goal, GymFrequency, WeightUnit } from '../types'

type Step = 'language' | 'selfie' | 'goal' | 'frequency' | 'saving'

const GOALS: Goal[] = ['aesthetics', 'strength', 'general']
const FREQUENCIES: GymFrequency[] = [1, 2, 3, 4, 5, 6, 7]

export default function Onboarding() {
  const { user, signInWithGoogle, updateProfile } = useAuth()
  const { t } = useT()
  const [step, setStep] = useState<Step>('language')
  const [language, setLanguage] = useState<Language>('en')
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs')
  const [frequency, setFrequency] = useState<GymFrequency | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <div>
          <h1 className="text-2xl font-medium">LiftPartner</h1>
          <p className="mt-2 text-sm text-app-muted">{t('onboarding.tagline')}</p>
        </div>
        <button
          type="button"
          onClick={() => signInWithGoogle().catch(() => setError(t('onboarding.signInFailed')))}
          className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black"
        >
          {t('onboarding.signInGoogle')}
        </button>
        {error ? <p className="text-xs text-app-accent">{error}</p> : null}
      </div>
    )
  }

  async function chooseLanguage(lang: Language) {
    setLanguage(lang)
    await updateProfile({ language: lang })
    setStep('selfie')
  }

  async function finish(finalGoal: Goal, finalFrequency: GymFrequency) {
    setStep('saving')
    setError(null)

    // The selfie upload gets its own timeout and its own failure handling -
    // a broken/not-yet-enabled Storage bucket shouldn't be able to strand
    // the user on this screen forever. Worst case, they finish onboarding
    // without a photo and can add one later from Account.
    let selfieURL: string | null = null
    if (selfieBlob && user) {
      try {
        selfieURL = await withTimeout(uploadSelfie(user.uid, selfieBlob), 15000, 'Selfie upload')
      } catch (err) {
        console.error('Selfie upload failed, continuing without it:', err)
        selfieURL = null
      }
    }

    try {
      await updateProfile({
        language,
        weightUnit,
        goal: finalGoal,
        frequency: finalFrequency,
        selfieURL,
        onboardingComplete: true,
      })
    } catch (err) {
      setError(err instanceof Error ? `${t('onboarding.saveErrorPrefix')} ${err.message}` : t('onboarding.saveError'))
      setStep('frequency')
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
      {step === 'language' ? (
        <div className="flex flex-col gap-4 text-center">
          <div>
            <h1 className="text-xl font-medium">{t('onboarding.language.title')}</h1>
            <p className="mt-1 text-sm text-app-muted">{t('onboarding.language.subtitle')}</p>
          </div>
          <div className="flex flex-col gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => chooseLanguage(lang)}
                className={`rounded-xl border p-4 text-left hover:border-app-accent ${
                  language === lang ? 'border-app-accent bg-app-accent/15 text-app-accent' : 'border-app-border bg-app-surface'
                }`}
              >
                <p className="font-medium">{LANGUAGE_LABELS[lang]}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === 'selfie' ? (
        <div className="flex flex-col items-center gap-5 text-center">
          <div>
            <h1 className="text-xl font-medium">{t('onboarding.selfie.title')}</h1>
            <p className="mt-1 text-sm text-app-muted">{t('onboarding.selfie.subtitle')}</p>
          </div>
          {selfiePreview ? (
            <div className="flex flex-col items-center gap-4">
              <img src={selfiePreview} alt="" className="h-64 w-64 rounded-full border-2 border-app-border object-cover" />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelfieBlob(null)
                    setSelfiePreview(null)
                  }}
                  className="rounded-full border border-app-border px-5 py-2 text-sm text-app-muted"
                >
                  {t('onboarding.selfie.retake')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('goal')}
                  className="rounded-full bg-app-accent px-6 py-2 text-sm font-medium text-white"
                >
                  {t('onboarding.selfie.looksGood')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <SelfieCamera
                onCapture={(blob, preview) => {
                  setSelfieBlob(blob)
                  setSelfiePreview(preview)
                }}
              />
              <button type="button" onClick={() => setStep('goal')} className="text-xs text-app-muted underline">
                {t('onboarding.selfie.skip')}
              </button>
            </>
          )}
        </div>
      ) : null}

      {step === 'goal' ? (
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-medium">{t('onboarding.goal.title')}</h1>
            <p className="mt-1 text-sm text-app-muted">{t('onboarding.goal.subtitle')}</p>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-app-muted">{t('onboarding.goal.weightUnit')}</p>
            <div className="grid grid-cols-2 gap-2">
              {(['lbs', 'kg'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setWeightUnit(u)}
                  className={`rounded-lg border py-2.5 text-sm font-medium ${
                    weightUnit === u ? 'border-app-accent bg-app-accent/15 text-app-accent' : 'border-app-border text-app-text'
                  }`}
                >
                  {t(`account.unit.${u}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {GOALS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGoal(g)
                  setStep('frequency')
                }}
                className="rounded-xl border border-app-border bg-app-surface p-4 text-left hover:border-app-accent"
              >
                <p className="font-medium">{t(`goal.${g}.label`)}</p>
                <p className="mt-1 text-xs text-app-muted">{t(`goal.${g}.blurb`)}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === 'frequency' ? (
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-medium">{t('onboarding.frequency.title')}</h1>
            <p className="mt-1 text-sm text-app-muted">{t('onboarding.frequency.subtitle')}</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={`rounded-lg border py-3 text-sm font-medium ${
                  frequency === f ? 'border-app-accent bg-app-accent/15 text-app-accent' : 'border-app-border text-app-text'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!goal || !frequency}
            onClick={() => goal && frequency && finish(goal, frequency)}
            className="mt-2 rounded-full bg-app-accent px-6 py-3 text-sm font-medium text-white disabled:opacity-40"
          >
            {t('onboarding.finish')}
          </button>
          {error ? <p className="text-xs text-app-accent">{error}</p> : null}
        </div>
      ) : null}

      {step === 'saving' ? <p className="text-center text-sm text-app-muted">{t('onboarding.saving')}</p> : null}
    </div>
  )
}
