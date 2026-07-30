'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { messages, type Locale } from '@/i18n/messages'

interface LanguageContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  /** Çeviri: t('anahtar', 'varsayılan'). Çevrilmemişse TR'ye, o da yoksa varsayılana düşer. */
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'tr',
  setLocale: () => {},
  t: (_k, fallback) => fallback ?? _k,
})

const STORAGE_KEY = 'pureolentia_locale'

function interpolate(str: string, vars?: Record<string, string | number>) {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`))
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Varsayılan TR — sunucu ve ilk render TR; İngilizce seçilince client'ta güncellenir.
  const [locale, setLocaleState] = useState<Locale>('tr')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'tr' || saved === 'en') setLocaleState(saved)
    } catch {}
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
      // Cookie — ileride sunucu tarafı okuma için (Faz 2)
      document.cookie = `${STORAGE_KEY}=${l}; path=/; max-age=31536000; samesite=lax`
    } catch {}
  }, [])

  const t = useCallback(
    (key: string, fallback?: string, vars?: Record<string, string | number>) => {
      const dict = messages[locale] || messages.tr
      const raw = dict[key] ?? messages.tr[key] ?? fallback ?? key
      return interpolate(raw, vars)
    },
    [locale],
  )

  return <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>
}

export function useTranslation() {
  return useContext(LanguageContext)
}
