import React, { useEffect, useMemo, useState } from 'react'
import { Search, Ban, CheckCircle2 } from 'lucide-react'
import Card from '../../components/ui/Card.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { listStudents, toggleUserStatus } from '../../lib/dataClient'

export default function StudentsPage() {
  const { t } = useI18n()
  const [students, setStudents] = useState([])
  const [q, setQ] = useState('')

  async function load() { setStudents(await listStudents()) }
  useEffect(() => { load() }, [])

  const filtered = useMemo(
    () => students.filter((s) => s.display_name.toLowerCase().includes(q.toLowerCase()) || s.username.toLowerCase().includes(q.toLowerCase())),
    [students, q],
  )

  async function toggle(id) {
    await toggleUserStatus(id)
    load()
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('admin.searchStudents')}
          className="w-full rounded-xl border border-line pl-9 pr-3 py-2.5 text-sm" />
      </div>
      <Card className="divide-y divide-line overflow-hidden">
        {filtered.map((s) => (
          <div key={s.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar seed={s.avatar_seed || s.username} name={s.display_name} imageUrl={s.avatar_url} size={34} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.display_name} <span className="text-muted font-normal">· {s.level || '—'}</span></p>
              <p className="text-xs text-muted">@{s.username} · {s.xp} XP · 🔥{s.streak_current || 0}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.status === 'active' ? 'bg-accent-soft text-accent' : 'bg-danger/10 text-danger'}`}>{s.status}</span>
            <button onClick={() => toggle(s.id)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-accent-soft text-muted hover:text-accent">
              {s.status === 'active' ? <Ban size={15} /> : <CheckCircle2 size={15} />}
            </button>
          </div>
        ))}
      </Card>
    </div>
  )
}
