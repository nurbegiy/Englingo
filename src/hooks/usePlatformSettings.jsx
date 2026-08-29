import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getPlatformSettings } from '../lib/dataClient'

const PlatformSettingsContext = createContext(null)

const DEFAULTS = { name: 'Lingua Track', logo_url: null, accent_color: 'emerald', default_language: 'uz' }

export function PlatformSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const s = await getPlatformSettings()
      setSettings({ ...DEFAULTS, ...s })
    } catch {
      setSettings(DEFAULTS)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return (
    <PlatformSettingsContext.Provider value={{ settings, loaded, refresh }}>
      {children}
    </PlatformSettingsContext.Provider>
  )
}

export function usePlatformSettings() {
  const ctx = useContext(PlatformSettingsContext)
  if (!ctx) throw new Error('usePlatformSettings must be used within PlatformSettingsProvider')
  return ctx
}
