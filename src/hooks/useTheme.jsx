import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
const ACCENT_KEY = 'lt_accent'
const MODE_KEY = 'lt_theme_mode'

const ACCENT_PRESETS = {
  emerald: { accent: '29 122 95', accentSoft: '228 243 236', accentDark: '74 189 154', accentSoftDark: '21 41 36' },
  indigo: { accent: '61 74 191', accentSoft: '228 231 250', accentDark: '129 141 235', accentSoftDark: '24 26 47' },
  clay: { accent: '178 92 58', accentSoft: '247 231 222', accentDark: '224 145 111', accentSoftDark: '43 27 19' },
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem(MODE_KEY) || 'system')
  const [accentName, setAccentName] = useState(() => localStorage.getItem(ACCENT_KEY) || 'emerald')

  useEffect(() => {
    const root = document.documentElement
    const applyDark = (dark) => root.classList.toggle('dark', dark)
    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      applyDark(mq.matches)
      const listener = (e) => applyDark(e.matches)
      mq.addEventListener('change', listener)
      return () => mq.removeEventListener('change', listener)
    }
    applyDark(mode === 'dark')
  }, [mode])

  useEffect(() => {
    const preset = ACCENT_PRESETS[accentName] || ACCENT_PRESETS.emerald
    const root = document.documentElement
    const isDark = root.classList.contains('dark')
    root.style.setProperty('--accent', isDark ? preset.accentDark : preset.accent)
    root.style.setProperty('--accent-soft', isDark ? preset.accentSoftDark : preset.accentSoft)
  }, [accentName, mode])

  useEffect(() => { localStorage.setItem(MODE_KEY, mode) }, [mode])
  useEffect(() => { localStorage.setItem(ACCENT_KEY, accentName) }, [accentName])

  return (
    <ThemeContext.Provider value={{ mode, setMode, accentName, setAccentName, accents: Object.keys(ACCENT_PRESETS) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
