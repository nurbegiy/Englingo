import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown } from 'lucide-react'
import AppShell from '../../components/layout/AppShell.jsx'
import Card from '../../components/ui/Card.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import Loader from '../../components/ui/Loader.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { useLeaderboard } from '../../hooks/useLeaderboard.js'

const MEDALS = ['text-gold', 'text-muted', 'text-[#b5651d]']

export default function LeaderboardPage() {
  const { profile } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [scope, setScope] = useState('group')

  const { rows, loading } = useLeaderboard(scope, { branchId: profile?.branch_id, groupId: profile?.group_id })

  const tabs = [
    { key: 'group', label: t('leaderboard.group') },
    { key: 'branch', label: t('leaderboard.branch') },
    { key: 'all', label: t('leaderboard.all') },
  ]

  return (
    <AppShell title={t('leaderboard.title')}>
      <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto space-y-5">
        <div className="flex bg-accent-soft/60 rounded-full p-1">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setScope(tb.key)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${scope === tb.key ? 'bg-surface shadow-soft text-accent' : 'text-muted'}`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader />
        ) : scope === 'group' && !profile.group_id ? (
          <EmptyState title={t('home.noGroup')} description={t('home.noGroupDesc')} />
        ) : rows.length === 0 ? (
          <EmptyState title="No students yet" />
        ) : (
          <Card className="divide-y divide-line overflow-hidden">
            {rows.map((r, i) => (
              <button
                key={r.id}
                onClick={() => navigate(`/app/users/${r.username}`)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent-soft/30 transition ${r.id === profile.id ? 'bg-accent-soft/50' : ''}`}
              >
                <span className={`w-6 text-sm font-semibold ${i < 3 ? MEDALS[i] : 'text-muted'}`}>
                  {i < 3 ? <Crown size={16} className="fill-current" /> : i + 1}
                </span>
                <Avatar seed={r.avatar_seed || r.username} name={r.display_name} imageUrl={r.avatar_url} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.display_name}</p>
                  <p className="text-xs text-muted">{r.level}</p>
                </div>
                <span className="text-sm font-semibold text-gold shrink-0">{r.xp} XP</span>
              </button>
            ))}
          </Card>
        )}
      </div>
    </AppShell>
  )
}
