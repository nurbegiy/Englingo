import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import Loader from '../../components/ui/Loader.jsx'
import LevelMedallion from '../../components/ui/LevelMedallion.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { getProfileByUsername, getFollowCounts, isFollowing, toggleFollow } from '../../lib/dataClient'

export default function UserProfilePage() {
  const { username } = useParams()
  const { profile: me } = useAuth()
  const { t } = useI18n()
  const [user, setUser] = useState(null)
  const [counts, setCounts] = useState({ followers: 0, following: 0 })
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    getProfileByUsername(username).then(async (u) => {
      setUser(u)
      if (u) {
        setCounts(await getFollowCounts(u.id))
        setFollowing(await isFollowing(me.id, u.id))
      }
    })
  }, [username]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFollow() {
    const now = await toggleFollow(me.id, user.id)
    setFollowing(now)
    setCounts((c) => ({ ...c, followers: c.followers + (now ? 1 : -1) }))
  }

  if (!user) return <AppShell title={t('nav.profile')}><Loader /></AppShell>

  return (
    <AppShell title={user.display_name}>
      <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto space-y-5">
        <Card className="p-6 flex items-center gap-4">
          <Avatar seed={user.avatar_seed || user.username} name={user.display_name} imageUrl={user.avatar_url} size={64} />
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg font-medium truncate">{user.display_name}</p>
            <p className="text-sm text-muted">@{user.username}</p>
          </div>
          <LevelMedallion level={user.level} xp={user.xp} size={56} />
        </Card>

        {user.id !== me.id && (
          <Button variant={following ? 'ghost' : 'primary'} className="w-full" onClick={handleFollow}>
            {following ? 'Following' : 'Follow'}
          </Button>
        )}

        <Card className="p-5 flex items-center justify-around text-center">
          <div><p className="font-display text-xl font-semibold">{counts.followers}</p><p className="text-xs text-muted">{t('profile.followers')}</p></div>
          <div className="h-8 w-px bg-line" />
          <div><p className="font-display text-xl font-semibold">{counts.following}</p><p className="text-xs text-muted">{t('profile.following')}</p></div>
          <div className="h-8 w-px bg-line" />
          <div><p className="font-display text-xl font-semibold">{user.streak_current ?? 0}</p><p className="text-xs text-muted">{t('home.streak')}</p></div>
        </Card>

        <Card className="p-5">
          <p className="font-display font-medium mb-3">{t('profile.badges')}</p>
          <div className="flex flex-wrap gap-2">
            {(user.badges || []).length === 0 && <p className="text-sm text-muted">No badges yet.</p>}
            {(user.badges || []).map((b) => (
              <span key={b} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gold-soft text-gold">{b.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
