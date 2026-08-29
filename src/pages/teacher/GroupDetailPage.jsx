import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Target, Plus } from 'lucide-react'
import AppShell from '../../components/layout/AppShell.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import Modal from '../../components/ui/Modal.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { getGroupMembers, listGroupChallenges, createChallenge } from '../../lib/dataClient'

export default function GroupDetailPage() {
  const { id } = useParams()
  const { profile } = useAuth()
  const { t } = useI18n()
  const [members, setMembers] = useState([])
  const [challenges, setChallenges] = useState([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState(3)

  async function load() {
    setMembers(await getGroupMembers(id))
    setChallenges(await listGroupChallenges(id))
  }
  useEffect(() => { load() }, [id]) // eslint-disable-line

  async function handleCreate() {
    if (!title.trim()) return
    await createChallenge({ groupId: id, teacherId: profile.id, title, target, type: 'practices' })
    setOpen(false)
    setTitle('')
    await load()
  }

  return (
    <AppShell title={t('admin.groups')}>
      <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto space-y-5">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-accent" />
              <h2 className="font-display font-medium">{t('teacher.challenges')}</h2>
            </div>
            <Button variant="secondary" onClick={() => setOpen(true)}><Plus size={15} /> {t('teacher.add')}</Button>
          </div>
          {challenges.length === 0 ? (
            <p className="text-sm text-muted">{t('teacher.noChallenge')}</p>
          ) : (
            <div className="space-y-2">
              {challenges.map((c) => (
                <div key={c.id} className="px-3 py-2.5 rounded-xl bg-accent-soft/50 text-sm font-medium">{c.title}</div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-medium mb-4">{t('teacher.members')}</h2>
          {members.length === 0 ? (
            <EmptyState title={t('teacher.noStudents')} description={t('teacher.noStudentsDesc')} />
          ) : (
            <div className="divide-y divide-line -mx-5">
              {members.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="w-5 text-sm text-muted font-medium">{i + 1}</span>
                  <Avatar seed={m.avatar_seed || m.username} name={m.display_name} imageUrl={m.avatar_url} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.display_name}</p>
                    <p className="text-xs text-muted">{m.level}</p>
                  </div>
                  <span className="text-sm font-semibold text-gold">{m.xp} XP</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t('teacher.newChallenge')}>
        <label className="text-xs font-medium text-muted mb-1 block">{t('teacher.challengeTitle')}</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Complete 3 practices today"
          className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm mb-3" />
        <label className="text-xs font-medium text-muted mb-1 block">{t('teacher.target')}</label>
        <input type="number" min={1} value={target} onChange={(e) => setTarget(Number(e.target.value))}
          className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm mb-5" />
        <Button className="w-full" onClick={handleCreate}>{t('teacher.create')}</Button>
      </Modal>
    </AppShell>
  )
}
