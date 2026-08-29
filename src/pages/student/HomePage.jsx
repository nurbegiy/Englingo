import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import LevelMedallion from '../../components/ui/LevelMedallion.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { xpForLevel, getGroupMembers, getLeaderboard } from '../../lib/dataClient'
import { Users, Flame, ChevronRight } from 'lucide-react'

const CATEGORIES = ['vocabulary', 'grammar', 'listening', 'reading']

export default function HomePage() {
  const { profile } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [rank, setRank] = useState(null)

  const baseXp = xpForLevel(profile?.level)

  useEffect(() => {
    if (!profile) return
    if (profile.group_id) {
      getGroupMembers(profile.group_id).then(setGroup)
    }
    getLeaderboard('branch', { branchId: profile.branch_id }).then((rows) => {
      const idx = rows.findIndex((r) => r.id === profile.id)
      setRank(idx >= 0 ? idx + 1 : null)
    })
  }, [profile])

  if (!profile) return null

  return (
    <AppShell title={`${t('home.greeting')}, ${profile.display_name.split(' ')[0]}`}>
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <StatCard label={t('level')} value={profile.level} />
          <StatCard label={t('xp')} value={profile.xp} />
          <StatCard label={t('home.streak')} value={profile.streak_current} icon={<Flame size={14} className="text-gold" />} />
        </div>

        <Card className="p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-medium">{t('home.daily')}</h2>
            <LevelMedallion level={profile.level} size={44} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => navigate(`/app/learn/${cat}`)}
                className="flex flex-col items-start gap-2 rounded-2xl border border-line p-4 hover:border-accent hover:bg-accent-soft/40 transition text-left"
              >
                <span className="text-sm font-semibold">{t(`learn.${cat}`)}</span>
                <span className="text-xs text-gold font-medium">+{baseXp} XP</span>
              </button>
            ))}
          </div>
          <Button className="w-full mt-5" onClick={() => navigate('/app/learn')}>
            {t('home.continue')} <ChevronRight size={16} />
          </Button>
        </Card>

        <Card className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-accent" />
            <h2 className="font-display text-lg font-medium">{t('home.group')}</h2>
          </div>
          {!profile.group_id ? (
            <EmptyState
              title={t('home.noGroup')}
              description={t('home.noGroupDesc')}
              action={<Button variant="secondary" onClick={() => navigate('/app/profile')}>{t('home.joinGroup')}</Button>}
            />
          ) : (
            <div className="space-y-2">
              {(group || []).slice(0, 5).map((m, i) => (
                <div key={m.id} className={`flex items-center justify-between px-3 py-2 rounded-xl ${m.id === profile.id ? 'bg-accent-soft' : ''}`}>
                  <span className="text-sm font-medium">{i + 1}. {m.display_name}</span>
                  <span className="text-sm font-semibold text-gold">{m.xp} XP</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {rank && (
          <p className="text-sm text-muted text-center">
            {profile.display_name.split(' ')[0]}, {t('leaderboard.branch').toLowerCase()}: <span className="font-semibold text-ink">#{rank}</span>
          </p>
        )}
      </div>
    </AppShell>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <Card className="p-4 flex flex-col items-center justify-center gap-1 text-center">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="font-display text-2xl font-semibold">{value ?? '—'}</span>
      </div>
      <span className="text-xs text-muted">{label}</span>
    </Card>
  )
}
