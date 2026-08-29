import React, { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import AppShell from '../../components/layout/AppShell.jsx'
import Card from '../../components/ui/Card.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { uploadAvatar } from '../../lib/dataClient'

export default function TeacherProfilePage() {
  const { profile, refreshProfile } = useAuth()
  const { t } = useI18n()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

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
      <div className="px-4 md:px-8 py-6 max-w-md mx-auto">
        <Card className="p-6 flex items-center gap-4">
          <div className="relative shrink-0">
            <Avatar seed={profile.username} name={profile.display_name} imageUrl={profile.avatar_url} size={64} />
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
        </Card>
      </div>
    </AppShell>
  )
}
