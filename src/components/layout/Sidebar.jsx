import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, BookOpen, Trophy, ShoppingBag, User, GraduationCap, ShieldCheck, LogOut } from 'lucide-react'
import { useI18n } from '../../hooks/useI18n.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { usePlatformSettings } from '../../hooks/usePlatformSettings.jsx'

const studentLinks = [
  { to: '/app/home', label: 'nav.home', icon: Home },
  { to: '/app/learn', label: 'nav.learn', icon: BookOpen },
  { to: '/app/leaderboard', label: 'nav.leaderboard', icon: Trophy },
  { to: '/app/shop', label: 'nav.shop', icon: ShoppingBag },
  { to: '/app/profile', label: 'nav.profile', icon: User },
]

export default function Sidebar() {
  const { t } = useI18n()
  const { profile, signOut } = useAuth()
  const { settings } = usePlatformSettings()

  const links = profile?.role === 'teacher'
    ? [
        { to: '/teacher/dashboard', label: 'nav.teacher', icon: GraduationCap, literal: 'Groups' },
        { to: '/teacher/profile', label: 'nav.profile', icon: User, literal: null },
      ]
    : profile?.role === 'admin'
      ? [{ to: '/admin/dashboard', label: 'nav.admin', icon: ShieldCheck }]
      : studentLinks

  return (
    <aside className="hidden md:flex w-60 shrink-0 h-full flex-col border-r border-line bg-surface px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        {settings.logo_url ? (
          <img src={settings.logo_url} alt={settings.name} className="h-8 w-8 rounded-lg object-cover" />
        ) : (
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-white font-display font-semibold">
            {settings.name?.[0] || 'L'}
          </div>
        )}
        <span className="font-display font-semibold text-lg truncate">{settings.name}</span>
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon, literal }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-accent-soft/50 hover:text-ink'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.9} />
            {literal || t(label)}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={signOut}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-danger/10 hover:text-danger transition"
      >
        <LogOut size={18} strokeWidth={1.9} />
        {t('nav.logout')}
      </button>
    </aside>
  )
}
