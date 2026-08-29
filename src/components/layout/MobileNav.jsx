import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, BookOpen, Trophy, ShoppingBag, User, GraduationCap, ShieldCheck } from 'lucide-react'
import { useI18n } from '../../hooks/useI18n.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'

const studentLinks = [
  { to: '/app/home', label: 'nav.home', icon: Home },
  { to: '/app/learn', label: 'nav.learn', icon: BookOpen },
  { to: '/app/leaderboard', label: 'nav.leaderboard', icon: Trophy },
  { to: '/app/shop', label: 'nav.shop', icon: ShoppingBag },
  { to: '/app/profile', label: 'nav.profile', icon: User },
]

export default function MobileNav() {
  const { t } = useI18n()
  const { profile } = useAuth()

  if (profile?.role === 'teacher') {
    return (
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-line flex justify-around py-2 pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
        <NavLink to="/teacher/dashboard" className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1.5 ${isActive ? 'text-accent' : 'text-muted'}`}>
          <GraduationCap size={20} /><span className="text-[10px]">{t('nav.teacher')}</span>
        </NavLink>
        <NavLink to="/teacher/profile" className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1.5 ${isActive ? 'text-accent' : 'text-muted'}`}>
          <User size={20} /><span className="text-[10px]">{t('nav.profile')}</span>
        </NavLink>
      </nav>
    )
  }
  if (profile?.role === 'admin') {
    return (
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-line flex justify-around py-2 pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
        <NavLink to="/admin/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted">
          <ShieldCheck size={20} /><span className="text-[10px]">{t('nav.admin')}</span>
        </NavLink>
      </nav>
    )
  }

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-line flex justify-around py-2 pb-[calc(env(safe-area-inset-bottom)+0.25rem)]">
      {studentLinks.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg ${isActive ? 'text-accent' : 'text-muted'}`}
        >
          <Icon size={20} strokeWidth={1.9} />
          <span className="text-[10px] font-medium">{t(label)}</span>
        </NavLink>
      ))}
    </nav>
  )
}
