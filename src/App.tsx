import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { I18nProvider, useT } from './contexts/I18nContext'
import BottomNav from './components/BottomNav'
import Onboarding from './pages/Onboarding'

// Lazy-loaded: these pages pull in the three.js / react-three-fiber body
// model, which is the heaviest chunk in the app. Splitting them out keeps
// the sign-in / onboarding screen fast on mobile.
const Home = lazy(() => import('./pages/Home'))
const Plan = lazy(() => import('./pages/Plan'))
const LogWorkout = lazy(() => import('./pages/LogWorkout'))
const PastWorkouts = lazy(() => import('./pages/PastWorkouts'))
const WorkoutDetail = lazy(() => import('./pages/WorkoutDetail'))
const Account = lazy(() => import('./pages/Account'))

function PageFallback() {
  const { t } = useT()
  return <p className="px-4 pt-6 text-sm text-app-muted">{t('common.loading')}</p>
}

function AppShell() {
  const { user, profile, loading, profileError } = useAuth()
  const { t } = useT()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-app-muted">{t('app.loading')}</p>
      </div>
    )
  }

  if (user && profileError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-app-text">{t('app.profileErrorTitle')}</p>
        <p className="text-xs text-app-muted">{profileError}</p>
        <p className="text-xs text-app-muted">{t('app.profileErrorHint')}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 rounded-full border border-app-border px-5 py-2 text-sm"
        >
          {t('app.reload')}
        </button>
      </div>
    )
  }

  if (!user || !profile?.onboardingComplete) {
    return <Onboarding />
  }

  return (
    <>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/log" element={<LogWorkout />} />
          <Route path="/history" element={<PastWorkouts />} />
          <Route path="/history/:id" element={<WorkoutDetail />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </Suspense>
      <BottomNav />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <I18nProvider>
          <AppShell />
        </I18nProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
