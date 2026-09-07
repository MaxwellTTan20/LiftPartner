import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { translate, type Language } from '../lib/i18n'

interface I18nContextValue {
  language: Language
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const language: Language = profile?.language ?? 'en'

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      t: (key, vars) => translate(language, key, vars),
    }),
    [language],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useT(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useT must be used within I18nProvider')
  return ctx
}
