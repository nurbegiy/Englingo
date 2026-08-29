import React, { useEffect, useState } from 'react'
import { Gem, Check } from 'lucide-react'
import AppShell from '../../components/layout/AppShell.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Loader from '../../components/ui/Loader.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { listShopItems, listPurchases, purchaseItem } from '../../lib/dataClient'

export default function ShopPage() {
  const { profile, refreshProfile } = useAuth()
  const { t } = useI18n()
  const [items, setItems] = useState(null)
  const [owned, setOwned] = useState([])
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState('')

  async function load() {
    const [i, o] = await Promise.all([listShopItems(), listPurchases(profile.id)])
    setItems(i)
    setOwned(o)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function buy(item) {
    setBusyId(item.id)
    setNotice('')
    const res = await purchaseItem(profile.id, item.id)
    if (res.ok === false) setNotice(res.reason === 'insufficient_xp' ? t('shop.notEnough') : 'Already owned')
    else {
      setOwned((o) => [...o, item.id])
      await refreshProfile()
    }
    setBusyId(null)
  }

  if (!items) return <AppShell title={t('shop.title')}><Loader /></AppShell>

  return (
    <AppShell title={t('shop.title')}>
      <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted">Spend XP on cosmetics — doesn't affect your level.</p>
          <div className="flex items-center gap-1.5 font-semibold text-gold">
            <Gem size={16} /> {profile.xp} {t('xp')}
          </div>
        </div>
        {notice && <p className="text-sm text-danger mb-4">{notice}</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const isOwned = owned.includes(item.id)
            return (
              <Card key={item.id} className="p-5 flex flex-col">
                <div className="h-24 rounded-xl bg-accent-soft mb-4 flex items-center justify-center">
                  <Gem size={28} className="text-accent" />
                </div>
                <p className="font-display font-medium mb-1">{item.name}</p>
                <p className="text-xs text-muted mb-4 flex-1">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gold">{item.price} XP</span>
                  {isOwned ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-accent"><Check size={14} /> {t('shop.owned')}</span>
                  ) : (
                    <Button variant="secondary" disabled={busyId === item.id} onClick={() => buy(item)}>{t('shop.buy')}</Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
