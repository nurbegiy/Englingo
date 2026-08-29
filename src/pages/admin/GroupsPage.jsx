import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Power, PlayCircle } from 'lucide-react'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import {
  listAllGroups, listTeachers, listAllBranches,
  createGroup, renameGroup, toggleGroupStatus,
} from '../../lib/dataClient'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function GroupsPage() {
  const { t } = useI18n()
  const [groups, setGroups] = useState([])
  const [teachers, setTeachers] = useState([])
  const [branches, setBranches] = useState([])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', level: 'A1', teacherId: '', branchId: '' })

  const [confirmTarget, setConfirmTarget] = useState(null)
  const [toggling, setToggling] = useState(false)

  async function load() {
    setGroups(await listAllGroups())
    setTeachers(await listTeachers())
    setBranches(await listAllBranches())
  }
  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm({ name: '', level: 'A1', teacherId: teachers[0]?.id || '', branchId: branches[0]?.id || '' })
    setOpen(true)
  }

  function openEdit(g) {
    setEditing(g)
    setForm({ name: g.name, level: g.level || 'A1', teacherId: g.teacher_id, branchId: g.branch_id })
    setOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || saving) return
    setSaving(true)
    try {
      if (editing) {
        await renameGroup(editing.id, { name: form.name, level: form.level, teacher_id: form.teacherId, branch_id: form.branchId })
      } else {
        if (!form.teacherId || !form.branchId) return
        await createGroup({ teacherId: form.teacherId, branchId: form.branchId, name: form.name, level: form.level })
      }
      setOpen(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  function handleToggleClick(g) {
    if ((g.status || 'active') === 'active') setConfirmTarget(g)
    else doToggle(g)
  }

  async function doToggle(g) {
    setToggling(true)
    try {
      await toggleGroupStatus(g.id)
      setConfirmTarget(null)
      await load()
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus size={16} /> {t('admin.addGroup')}</Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {groups.map((g) => {
          const teacher = teachers.find((tc) => tc.id === g.teacher_id)
          const branch = branches.find((b) => b.id === g.branch_id)
          const inactive = (g.status || 'active') !== 'active'
          return (
            <Card key={g.id} className={`p-5 ${inactive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-1">
                <p className="font-display font-medium">{g.name}</p>
                <div className="flex gap-1 -mt-1 -mr-1">
                  <button onClick={() => openEdit(g)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-accent-soft text-muted hover:text-accent"><Pencil size={15} /></button>
                  <button onClick={() => handleToggleClick(g)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-danger/10 text-muted hover:text-danger" title={inactive ? t('admin.reactivate') : t('admin.deactivate')}>
                    {inactive ? <PlayCircle size={15} /> : <Power size={15} />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted mb-3">{branch?.name} · {teacher?.display_name || t('admin.unassigned')} · {g.level}</p>
              <span className="font-mono text-sm font-semibold tracking-widest text-accent">{g.code}</span>
            </Card>
          )
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? t('admin.editGroup') : t('admin.addGroupTitle')}>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted mb-1 block">{t('teacher.groupName')}</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="A2 — 14:00"
              className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted mb-1 block">{t('teacher.level')}</label>
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm">
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted mb-1 block">{t('admin.branches')}</label>
            <select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })} className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm">
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted mb-1 block">{t('admin.teachers')}</label>
            <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm">
              {teachers.map((tc) => <option key={tc.id} value={tc.id}>{tc.display_name}</option>)}
            </select>
          </div>
          <Button className="w-full" disabled={saving} onClick={handleSave}>{saving ? t('common.loading') : t('common.save')}</Button>
        </div>
      </Modal>

      <Modal open={!!confirmTarget} onClose={() => setConfirmTarget(null)} title={t('admin.deactivateGroupTitle')}>
        <p className="text-sm text-muted mb-5">{t('admin.deactivateGroupBody').replace('{name}', confirmTarget?.name || '')}</p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setConfirmTarget(null)}>{t('common.cancel')}</Button>
          <Button variant="danger" className="flex-1" disabled={toggling} onClick={() => doToggle(confirmTarget)}>
            {toggling ? t('common.loading') : t('admin.deactivate')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
