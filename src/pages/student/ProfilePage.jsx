import React, { useEffect, useRef, useState } from 'react'
import { Users2, Award, Search as SearchIcon, Camera } from 'lucide-react'
import AppShell from '../../components/layout/AppShell.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import LevelMedallion from '../../components/ui/LevelMedallion.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { getFollowCounts, joinGroupByCode, searchProfiles, uploadAvatar } from '../../lib/dataClient'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [counts, setCounts] = useState({ followers: 0, following: 0 })
  const [joinOpen, setJoinOpen] = useState(false)
  const [code, setCode] = useState('')
  const [joinMsg, setJoinMsg] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => { getFollowCounts(profile.id).then(setCounts) }, [profile.id])

  async function handleJoin() {
    const res = await joinGroupByCode(profile.id, code)
    if (res.ok) {
      setJoinMsg('')
      setJoinOpen(false)
      setCode('')
      await refreshProfile()
    } else {
      setJoinMsg('Group not found')
    }
  }

  async function handleSearch(v) {
    setQuery(v)
    if (v.trim().length < 2) return setResults([])
    setResults(await searchProfiles(v))
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadAvatar(profile.id, file)
      await refreshProfile()
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <AppShell title={t('nav.profile')}>
      <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto space-y-5">
        <Card className="p-6 flex items-center gap-4">
          <div className="relative shrink-0">
            <Avatar seed={profile.avatar_seed || profile.username} name={profile.display_name} imageUrl={profile.avatar_url} size={64} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title={t('profile.changePhoto')}
              className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-accent text-white flex items-center justify-center border-2 border-surface hover:brightness-95 disabled:opacity-60"
            >
              <Camera size={12} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg font-medium truncate">{profile.display_name}</p>
            <p className="text-sm text-muted">@{profile.username}</p>
          </div>
          <LevelMedallion level={profile.level} xp={profile.xp} size={56} />
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <MiniStat value={profile.xp} label={t('xp')} />
          <MiniStat value={profile.streak_current} label={t('home.streak')} />
          <MiniStat value={profile.streak_best} label={t('home.bestStreak')} />
        </div>

        <Card className="p-5 flex items-center justify-around text-center">
          <div>
            <p className="font-display text-xl font-semibold">{counts.followers}</p>
            <p className="text-xs text-muted">{t('profile.followers')}</p>
          </div>
          <div className="h-8 w-px bg-line" />
          <div>
            <p className="font-display text-xl font-semibold">{counts.following}</p>
            <p className="text-xs text-muted">{t('profile.following')}</p>
          </div>
          <div className="h-8 w-px bg-line" />
          <button onClick={() => setSearchOpen(true)} className="flex flex-col items-center gap-1 text-muted hover:text-accent">
            <SearchIcon size={18} />
            <p className="text-xs">{t('common.search')}</p>
          </button>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Award size={16} className="text-accent" />
            <p className="font-display font-medium">{t('profile.badges')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(profile.badges || []).length === 0 && <p className="text-sm text-muted">No badges yet.</p>}
            {(profile.badges || []).map((b) => (
              <span key={b} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gold-soft text-gold">{b.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users2 size={16} className="text-accent" />
            <p className="font-display font-medium">{t('home.group')}</p>
          </div>
          {profile.group_id ? (
            <span className="text-sm text-muted">Joined</span>
          ) : (
            <Button variant="secondary" onClick={() => setJoinOpen(true)}>{t('home.joinGroup')}</Button>
          )}
        </Card>
      </div>

      <Modal open={joinOpen} onClose={() => setJoinOpen(false)} title={t('home.joinGroup')}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. A2X72K"
          className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm mb-3 uppercase tracking-widest font-mono"
        />
        {joinMsg && <p className="text-sm text-danger mb-3">{joinMsg}</p>}
        <Button className="w-full" onClick={handleJoin}>{t('common.save')}</Button>
      </Modal>

      <Modal open={searchOpen} onClose={() => setSearchOpen(false)} title={t('common.search')}>
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search students..."
          className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm mb-3"
        />
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => { setSearchOpen(false); navigate(`/app/users/${r.username}`) }}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-accent-soft/40 text-left"
            >
              <Avatar seed={r.avatar_seed || r.username} name={r.display_name} imageUrl={r.avatar_url} size={32} />
              <span className="text-sm font-medium">{r.display_name}</span>
            </button>
          ))}
        </div>
      </Modal>
    </AppShell>
  )
}

function MiniStat({ value, label }) {
  return (
    <Card className="p-4 text-center">
      <p className="font-display text-xl font-semibold">{value ?? 0}</p>
      <p className="text-xs text-muted">{label}</p>
    </Card>
  )
}
