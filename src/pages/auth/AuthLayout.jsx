import React from 'react'
import { usePlatformSettings } from '../../hooks/usePlatformSettings.jsx'

export default function AuthLayout({ children, eyebrow }) {
  const { settings } = usePlatformSettings()
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-paper">
      <div className="hidden lg:flex w-1/2 bg-ink text-paper flex-col justify-between p-12 relative overflow-hidden">
        <div className="flex items-center gap-2">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt={settings.name} className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center font-display font-semibold">
              {settings.name?.[0] || 'L'}
            </div>
          )}
          <span className="font-display text-xl font-semibold truncate">{settings.name}</span>
        </div>
        <div>
          {eyebrow && <p className="text-accent text-sm font-semibold mb-3 tracking-wide uppercase">{eyebrow}</p>}
          <h2 className="font-display text-4xl leading-tight font-medium max-w-md">
            Practice a little every day. Watch your English climb.
          </h2>
          <p className="text-paper/60 mt-4 max-w-sm text-sm">
            Vocabulary, grammar, listening and reading — built for students at educational centers, level A1 to C2.
          </p>
        </div>
        <p className="text-paper/40 text-xs">© {new Date().getFullYear()} {settings.name}</p>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
