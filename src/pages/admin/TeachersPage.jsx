import React, { useEffect, useState } from 'react'
import { Ban, CheckCircle2 } from 'lucide-react'
import Card from '../../components/ui/Card.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { listTeachers, listAllGroups, toggleUserStatus } from '../../lib/dataClient'

export default function TeachersPage() {
  const { t } = useI18n()
  const [teachers, setTeachers] = useState([])
  const [groups, setGroups] = useState([])

  async function load() {
    setTeachers(await listTeachers())
    setGroups(await listAllGroups())
  }
  useEffect(() => { load() }, [])

  return (
    <Card className="divide-y divide-line overflow-hidden">
      {teachers.map((tch) => {
        const count = groups.filter((g) => g.teacher_id === tch.id).length
        return (
          <div key={tch.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar seed={tch.username} name={tch.display_name} imageUrl={tch.avatar_url} size={34} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tch.display_name}</p>
              <p className="text-xs text-muted">@{tch.username} · {count} {t('admin.groups').toLowerCase()}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tch.status === 'active' ? 'bg-accent-soft text-accent' : 'bg-danger/10 text-danger'}`}>{tch.status}</span>
            <button onClick={async () => { await toggleUserStatus(tch.id); load() }} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-accent-soft text-muted hover:text-accent">
              {tch.status === 'active' ? <Ban size={15} /> : <CheckCircle2 size={15} />}
            </button>
          </div>
        )
      })}
    </Card>
  )
}
