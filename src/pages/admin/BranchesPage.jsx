import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Power, PlayCircle } from 'lucide-react'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { listAllBranches, createBranch, renameBranch, toggleBranchStatus } from '../../lib/dataClient'

export default function BranchesPage() {
  const { t } = useI18n()
  const [branches, setBranches] = useState([])
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null) // branch pending deactivate confirmation
  const [toggling, setToggling] = useState(false)

  async function load() { setBranches(await listAllBranches()) }
  useEffect(() => { load() }, [])

  async function handleSave() {
    if (!name.trim() || saving) return
    setSaving(true)
    try {
      if (editing) await renameBranch(editing.id, name)
      else await createBranch(name)
      setOpen(false); setName(''); setEditing(null)
      await load()
    } finally {
      setSaving(false)
    }
  }

  function handleToggleClick(b) {
    // Deactivating hides the branch everywhere else in the app, so ask
    // first instead of doing it instantly on a single click. Reactivating
    // is harmless and safe to do immediately.
    if (b.status === 'active') setConfirmTarget(b)
    else doToggle(b)
  }

  async function doToggle(b) {
    setToggling(true)
    try {
      await toggleBranchStatus(b.id)
      setConfirmTarget(null)
      await load()
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setName(''); setOpen(true) }}><Plus size={16} /> {t('admin.addBranch')}</Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {branches.map((b) => (
          <Card key={b.id} className={`p-5 flex items-center justify-between ${b.status !== 'active' ? 'opacity-60' : ''}`}>
            <div>
              <p className="font-display font-medium">{b.name}</p>
              <p className="text-xs text-muted">{b.status}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditing(b); setName(b.name); setOpen(true) }} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-accent-soft text-muted hover:text-accent"><Pencil size={15} /></button>
              <button onClick={() => handleToggleClick(b)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-danger/10 text-muted hover:text-danger" title={b.status === 'active' ? t('admin.deactivate') : t('admin.reactivate')}>
                {b.status === 'active' ? <Power size={15} /> : <PlayCircle size={15} />}
              </button>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? t('admin.renameBranch') : t('admin.addBranchTitle')}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('admin.branchName')}
          className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm mb-5" />
        <Button className="w-full" disabled={saving} onClick={handleSave}>{saving ? t('common.loading') : t('common.save')}</Button>
      </Modal>
      <Modal open={!!confirmTarget} onClose={() => setConfirmTarget(null)} title={t('admin.deactivateBranchTitle')}>
        <p className="text-sm text-muted mb-5">{t('admin.deactivateBranchBody').replace('{name}', confirmTarget?.name || '')}</p>
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
