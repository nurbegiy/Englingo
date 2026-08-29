import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus } from 'lucide-react'
import AppShell from '../../components/layout/AppShell.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { getTeacherGroups, createGroup } from '../../lib/dataClient'

export default function TeacherDashboardPage() {
  const { profile } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [groups, setGroups] = useState(null)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [level, setLevel] = useState('A1')
  const [saving, setSaving] = useState(false)

  async function load() {
    setGroups(await getTeacherGroups(profile.id))
  }
  useEffect(() => { load() }, []) // eslint-disable-line

  async function handleCreate() {
    // Guard against double-submit: without this, a slow tap (or an
    // impatient double-click while the request is in flight) fired
    // createGroup twice and produced two identical groups.
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      await createGroup({ teacherId: profile.id, branchId: profile.branch_id, name, level })
      setOpen(false)
      setName('')
      await load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell title={`${t('home.greeting')}, ${profile.display_name.split(' ')[0]}`}>
      <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium">{t('teacher.yourGroups')}</h2>
          <Button onClick={() => setOpen(true)}><Plus size={16} /> {t('teacher.newGroup')}</Button>
        </div>

        {groups === null ? null : groups.length === 0 ? (
          <EmptyState icon={Users} title={t('teacher.noGroups')} description={t('teacher.noGroupsDesc')} />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {groups.map((g) => (
              <button key={g.id} onClick={() => navigate(`/teacher/groups/${g.id}`)} className="text-left">
                <Card className="p-5 hover:border-accent transition">
                  <p className="font-display text-lg font-medium mb-1">{g.name}</p>
                  <p className="text-xs text-muted mb-3">{t('teacher.level')} {g.level}</p>
                  <span className="font-mono text-sm font-semibold tracking-widest text-accent">{g.code}</span>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t('teacher.createGroup')}>
        <label className="text-xs font-medium text-muted mb-1 block">{t('teacher.groupName')}</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="A2 — 14:00"
          className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm mb-3" />
        <label className="text-xs font-medium text-muted mb-1 block">{t('teacher.level')}</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm mb-5">
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => <option key={l}>{l}</option>)}
        </select>
        <Button className="w-full" disabled={saving} onClick={handleCreate}>{saving ? t('common.loading') : t('teacher.create')}</Button>
      </Modal>
    </AppShell>
  )
}
