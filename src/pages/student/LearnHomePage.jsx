import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BookMarked, Puzzle, Headphones, BookOpenText } from 'lucide-react'
import AppShell from '../../components/layout/AppShell.jsx'
import Card from '../../components/ui/Card.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { xpForLevel } from '../../lib/dataClient'

const CATS = [
  { key: 'vocabulary', icon: BookMarked },
  { key: 'grammar', icon: Puzzle },
  { key: 'listening', icon: Headphones },
  { key: 'reading', icon: BookOpenText },
]

export default function LearnHomePage() {
  const { profile } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const baseXp = xpForLevel(profile?.level)

  return (
    <AppShell title={t('nav.learn')}>
      <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto space-y-6">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted mb-0.5">{t('learn.level')}</p>
            <p className="font-display text-2xl font-semibold">{profile?.level}</p>
          </div>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4">
          {CATS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => navigate(`/app/learn/${key}`)}
              className="text-left"
            >
              <Card className="p-5 h-full hover:border-accent transition group">
                <div className="h-11 w-11 rounded-xl bg-accent-soft flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition">
                  <Icon size={20} className="text-accent group-hover:text-white" />
                </div>
                <p className="font-display text-lg font-medium mb-1">{t(`learn.${key}`)}</p>
                <p className="text-xs text-gold font-semibold">+{baseXp} XP</p>
              </Card>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
