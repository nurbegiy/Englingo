import React, { useEffect, useState } from 'react'
import { Plus, Pencil, Power, PlayCircle } from 'lucide-react'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { listAdminShopItems, upsertShopItem, toggleShopItemStatus } from '../../lib/dataClient'

const EMPTY_FORM = { name: '', price: 100, description: '', category: 'cosmetic' }

export default function ShopAdminPage() {
  const { t } = useI18n()
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const [confirmTarget, setConfirmTarget] = useState(null)
  const [toggling, setToggling] = useState(false)

  async function load() { setItems(await listAdminShopItems()) }
  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  function openEdit(item) {
    setEditing(item)
    setForm({ name: item.name, price: item.price, description: item.description || '', category: item.category || 'cosmetic' })
    setOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || saving) return
    setSaving(true)
    try {
      await upsertShopItem(editing ? { ...form, id: editing.id } : form)
      setOpen(false)
      setForm(EMPTY_FORM)
      setEditing(null)
      await load()
    } finally {
      setSaving(false)
    }
  }

  function handleToggleClick(item) {
    // Deactivating removes it from the student shop, so confirm first.
    if (item.active !== false) setConfirmTarget(item)
    else doToggle(item)
  }

  async function doToggle(item) {
    setToggling(true)
    try {
      await toggleShopItemStatus(item.id)
      setConfirmTarget(null)
      await load()
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus size={16} /> {t('admin.addReward')}</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((i) => {
          const inactive = i.active === false
          return (
            <Card key={i.id} className={`p-5 ${inactive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-1">
                <p className="font-display font-medium">{i.name}</p>
                <div className="flex gap-1 -mt-1 -mr-1 shrink-0">
                  <button onClick={() => openEdit(i)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-accent-soft text-muted hover:text-accent"><Pencil size={15} /></button>
                  <button onClick={() => handleToggleClick(i)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-danger/10 text-muted hover:text-danger" title={inactive ? t('admin.reactivate') : t('admin.deactivate')}>
                    {inactive ? <PlayCircle size={15} /> : <Power size={15} />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted mb-3">{i.description}</p>
              <span className="text-sm font-semibold text-gold">{i.price} XP</span>
            </Card>
          )
        })}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? t('admin.editReward') : t('admin.addReward')}>
        <div className="space-y-3">
          <input placeholder={t('admin.rewardName')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm" />
          <input placeholder={t('admin.rewardDesc')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm" />
          <input type="number" placeholder={t('admin.rewardPrice')} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm" />
          <Button className="w-full" disabled={saving} onClick={handleSave}>{saving ? t('common.loading') : t('common.save')}</Button>
        </div>
      </Modal>
      <Modal open={!!confirmTarget} onClose={() => setConfirmTarget(null)} title={t('admin.deactivateRewardTitle')}>
        <p className="text-sm text-muted mb-5">{t('admin.deactivateRewardBody').replace('{name}', confirmTarget?.name || '')}</p>
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
