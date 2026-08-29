import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'

const TABS = [
  { to: '/admin/dashboard', label: 'admin.dashboard' },
  { to: '/admin/branches', label: 'admin.branches' },
  { to: '/admin/students', label: 'admin.students' },
  { to: '/admin/teachers', label: 'admin.teachers' },
  { to: '/admin/groups', label: 'admin.groups' },
  { to: '/admin/shop', label: 'admin.shop' },
  { to: '/admin/statistics', label: 'admin.statistics' },
  { to: '/admin/settings', label: 'admin.settings' },
]

export default function AdminLayout() {
  const { t } = useI18n()
  return (
    <AppShell title={t('admin.panel')}>
      <div className="px-4 md:px-8 pt-4">
        <div className="flex gap-1 overflow-x-auto pb-3 border-b border-line -mx-1 px-1">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
                  isActive ? 'bg-accent text-white' : 'text-muted hover:bg-accent-soft'
                }`
              }
            >
              {t(tab.label)}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        <Outlet />
      </div>
    </AppShell>
  )
}
