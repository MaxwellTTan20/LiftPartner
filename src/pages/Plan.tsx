import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useT } from '../contexts/I18nContext'
import { useWorkouts } from '../hooks/useWorkouts'
import { computeMonthlyScores, workoutsInMonth } from '../lib/scoring'
import { generatePlan } from '../lib/plan'
import { toDisplayWeight } from '../lib/units'
import { EXERCISE_BY_ID } from '../data/exercises'
import type { DayType, PlanWorkout } from '../types'

type Step = 'choose' | 'choose_ppl' | 'choose_ul' | 'preview'

export default function Plan() {
  const { profile, updateProfile } = useAuth()
  const { t } = useT()
  const { workouts } = useWorkouts()
  const navigate = useNavigate()
  const weightUnit = profile?.weightUnit ?? 'lbs'

  const [step, setStep] = useState<Step>('choose')
  const [preview, setPreview] = useState<PlanWorkout | null>(null)
  const [savedManual, setSavedManual] = useState(false)

  const now = new Date()
  const monthlyScores = useMemo(
    () => computeMonthlyScores(workoutsInMonth(workouts, now.getFullYear(), now.getMonth())),
    [workouts, now],
  )

  function build(dayType: DayType) {
    const plan = generatePlan(dayType, profile?.goal ?? null, monthlyScores, workouts)
    setPreview(plan)
    setStep('preview')
  }

  async function goManual() {
    await updateProfile({ activePlan: null })
    setSavedManual(true)
    setStep('choose')
  }

  async function usePlan() {
    if (!preview) return
    await updateProfile({ activePlan: preview })
    navigate('/log')
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-4 pb-56 pt-6">
      <header>
        <h1 className="text-xl font-medium">{t('plan.header')}</h1>
        <p className="mt-0.5 text-xs text-app-muted">
          {profile?.activePlan
            ? t('plan.currentlyLoaded', { day: t(`daytype.${profile.activePlan.dayType}`) })
            : t('plan.noPlan')}
        </p>
      </header>

      {step === 'choose' ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={goManual}
            className="rounded-xl border border-app-border bg-app-surface p-4 text-left hover:border-app-accent"
          >
            <p className="font-medium">{t('plan.manualTitle')}</p>
            <p className="mt-1 text-xs text-app-muted">{t('plan.manualBlurb')}</p>
          </button>
          <button
            type="button"
            onClick={() => setStep('choose_ppl')}
            className="rounded-xl border border-app-border bg-app-surface p-4 text-left hover:border-app-accent"
          >
            <p className="font-medium">{t('plan.pplTitle')}</p>
            <p className="mt-1 text-xs text-app-muted">{t('plan.pplBlurb')}</p>
          </button>
          <button
            type="button"
            onClick={() => build('full_body')}
            className="rounded-xl border border-app-border bg-app-surface p-4 text-left hover:border-app-accent"
          >
            <p className="font-medium">{t('plan.fullBodyTitle')}</p>
            <p className="mt-1 text-xs text-app-muted">{t('plan.fullBodyBlurb')}</p>
          </button>
          <button
            type="button"
            onClick={() => setStep('choose_ul')}
            className="rounded-xl border border-app-border bg-app-surface p-4 text-left hover:border-app-accent"
          >
            <p className="font-medium">{t('plan.ulTitle')}</p>
            <p className="mt-1 text-xs text-app-muted">{t('plan.ulBlurb')}</p>
          </button>
          {savedManual ? <p className="text-center text-xs text-app-muted">{t('plan.switchedManual')}</p> : null}
        </div>
      ) : null}

      {step === 'choose_ppl' ? (
        <div className="flex flex-col gap-3">
          {(['push', 'pull', 'legs'] as const).map((dt) => (
            <button
              key={dt}
              type="button"
              onClick={() => build(dt)}
              className="rounded-xl border border-app-border bg-app-surface p-4 text-left hover:border-app-accent"
            >
              <p className="font-medium">{t(`daytype.${dt}`)}</p>
            </button>
          ))}
          <button type="button" onClick={() => setStep('choose')} className="text-xs text-app-muted underline">
            {t('common.back')}
          </button>
        </div>
      ) : null}

      {step === 'choose_ul' ? (
        <div className="flex flex-col gap-3">
          {(['upper', 'lower'] as const).map((dt) => (
            <button
              key={dt}
              type="button"
              onClick={() => build(dt)}
              className="rounded-xl border border-app-border bg-app-surface p-4 text-left hover:border-app-accent"
            >
              <p className="font-medium">{t(`daytype.${dt}`)}</p>
            </button>
          ))}
          <button type="button" onClick={() => setStep('choose')} className="text-xs text-app-muted underline">
            {t('common.back')}
          </button>
        </div>
      ) : null}

      {step === 'preview' && preview ? (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-medium text-app-accent">{t('plan.dayTitle', { day: t(`daytype.${preview.dayType}`) })}</h2>
            <p className="mt-0.5 text-xs text-app-muted">{t('plan.dayBlurb', { n: preview.exercises.length })}</p>
          </div>
          <div className="flex flex-col gap-2">
            {preview.exercises.map((tgt) => {
              const exercise = EXERCISE_BY_ID[tgt.exerciseId]
              if (!exercise) return null
              const target =
                tgt.targetReps != null
                  ? `${tgt.targetReps} ${t('common.reps')}${
                      tgt.targetWeightLbs != null ? ` @ ${toDisplayWeight(tgt.targetWeightLbs, weightUnit)} ${weightUnit}` : ''
                    }`
                  : t('plan.targetNA')
              return (
                <div key={tgt.exerciseId} className="rounded-xl border border-app-border bg-app-surface p-3.5">
                  <p className="text-sm font-medium">{exercise.name}</p>
                  <p className="mt-1 text-xs text-app-muted">{t('plan.setsAndTarget', { sets: tgt.sets, target })}</p>
                </div>
              )
            })}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('choose')}
              className="flex-1 rounded-full border border-app-border px-4 py-2.5 text-sm text-app-muted"
            >
              {t('plan.chooseDifferent')}
            </button>
            <button
              type="button"
              onClick={usePlan}
              className="flex-1 rounded-full bg-app-accent px-4 py-2.5 text-sm font-medium text-white"
            >
              {t('plan.usePlan')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
