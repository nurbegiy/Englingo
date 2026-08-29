import React, { createContext, useContext, useMemo, useState } from 'react'
import uz from '../locales/uz/common.json'
import ru from '../locales/ru/common.json'
import en from '../locales/en/common.json'

const DICTS = { uz, ru, en }
const LANG_KEY = 'lt_lang'
const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'uz')

  const t = useMemo(() => {
    const dict = DICTS[lang] || DICTS.uz
    return (key, fallback) => dict[key] || DICTS.uz[key] || fallback || key
  }, [lang])

  const changeLang = (l) => {
    setLang(l)
    localStorage.setItem(LANG_KEY, l)
  }

  return (
    <I18nContext.Provider value={{ lang, setLang: changeLang, t, languages: Object.keys(DICTS) }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
