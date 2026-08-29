import React, { useEffect, useState } from 'react'
import Card from '../../components/ui/Card.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { getAdminStats } from '../../lib/dataClient'

export default function DashboardPage() {
  const { t } = useI18n()
  const [stats, setStats] = useState(null)
  useEffect(() => { getAdminStats().then(setStats) }, [])
  if (!stats) return null

  const cards = [
    { label: t('admin.totalStudents'), value: stats.totalStudents },
    { label: t('admin.totalTeachers'), value: stats.totalTeachers },
    { label: t('admin.totalBranches'), value: stats.totalBranches },
    { label: t('admin.totalGroups'), value: stats.totalGroups },
    { label: t('admin.totalXp'), value: stats.totalXp ?? '—' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="p-5">
          <p className="font-display text-2xl font-semibold">{c.value}</p>
          <p className="text-xs text-muted mt-1">{c.label}</p>
        </Card>
      ))}
    </div>
  )
}
