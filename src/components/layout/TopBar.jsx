import React, { useState } from 'react'
import { Sun, Moon, Monitor, Globe, Flame } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import Avatar from '../ui/Avatar.jsx'

const MODE_ICONS = { light: Sun, dark: Moon, system: Monitor }

export default function TopBar({ title }) {
  const { mode, setMode } = useTheme()
  const { lang, setLang, languages } = useI18n()
  const { profile, isDemoMode } = useAuth()
  const [langOpen, setLangOpen] = useState(false)
  const ModeIcon = MODE_ICONS[mode]

  const cycleMode = () => {
    const order = ['light', 'dark', 'system']
    setMode(order[(order.indexOf(mode) + 1) % order.length])
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-paper/90 backdrop-blur px-4 md:px-8 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="font-display text-lg md:text-xl font-medium truncate">{title}</h1>
        {isDemoMode && (
          <span className="hidden sm:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gold-soft text-gold">DEMO</span>
        )}
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        {profile?.role === 'student' && (
          <div className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gold">
            <Flame size={16} className="fill-gold/20" />
            {profile.streak_current || 0}
          </div>
        )}
        <div className="relative">
          <button onClick={() => setLangOpen((v) => !v)} className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-accent-soft text-muted hover:text-accent transition">
            <Globe size={18} />
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 w-28 bg-surface border border-line rounded-xl shadow-soft py-1 z-40">
              {languages.map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setLangOpen(false) }}
                  className={`w-full text-left px-3 py-1.5 text-sm hover:bg-accent-soft ${lang === l ? 'text-accent font-semibold' : ''}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={cycleMode} className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-accent-soft text-muted hover:text-accent transition">
          <ModeIcon size={18} />
        </button>
        {profile && <Avatar seed={profile.avatar_seed || profile.username} name={profile.display_name} imageUrl={profile.avatar_url} size={34} />}
      </div>
    </header>
  )
}
