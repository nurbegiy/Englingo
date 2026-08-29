import React, { useEffect, useState } from 'react'
import Card from '../../components/ui/Card.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { listStudents } from '../../lib/dataClient'

export default function StatisticsPage() {
  const { t } = useI18n()
  const [students, setStudents] = useState([])
  useEffect(() => { listStudents().then(setStudents) }, [])

  const avgXp = students.length ? Math.round(students.reduce((s, x) => s + x.xp, 0) / students.length) : 0
  const activeStreaks = students.filter((s) => s.streak_current > 0).length
  const byLevel = students.reduce((acc, s) => { acc[s.level] = (acc[s.level] || 0) + 1; return acc }, {})

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-5"><p className="font-display text-2xl font-semibold">{students.length}</p><p className="text-xs text-muted mt-1">{t('admin.totalStudents')}</p></Card>
        <Card className="p-5"><p className="font-display text-2xl font-semibold">{avgXp}</p><p className="text-xs text-muted mt-1">{t('admin.averageXp')}</p></Card>
        <Card className="p-5"><p className="font-display text-2xl font-semibold">{activeStreaks}</p><p className="text-xs text-muted mt-1">{t('admin.activeStreaks')}</p></Card>
        <Card className="p-5"><p className="font-display text-2xl font-semibold">{Object.keys(byLevel).length}</p><p className="text-xs text-muted mt-1">{t('admin.levelsInUse')}</p></Card>
      </div>
      <Card className="p-5">
        <p className="font-display font-medium mb-4">{t('admin.studentsByLevel')}</p>
        <div className="space-y-2">
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lv) => {
            const count = byLevel[lv] || 0
            const pct = students.length ? (count / students.length) * 100 : 0
            return (
              <div key={lv} className="flex items-center gap-3 text-sm">
                <span className="w-8 text-muted">{lv}</span>
                <div className="flex-1 h-2 rounded-full bg-line overflow-hidden"><div className="h-full bg-accent" style={{ width: `${pct}%` }} /></div>
                <span className="w-6 text-right font-medium">{count}</span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
