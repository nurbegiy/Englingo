import React, { useEffect, useRef, useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { useTheme } from '../../hooks/useTheme.jsx'
import { useI18n } from '../../hooks/useI18n.jsx'
import { usePlatformSettings } from '../../hooks/usePlatformSettings.jsx'
import { updatePlatformSettings, uploadLogo } from '../../lib/dataClient'

export default function SettingsPage() {
  const { t } = useI18n()
  const { accentName, setAccentName, accents } = useTheme()
  const { settings, refresh } = usePlatformSettings()
  const [name, setName] = useState(settings.name)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => { setName(settings.name) }, [settings.name])

  async function handleSave() {
    setSaving(true)
    try {
      await updatePlatformSettings({ name, accent_color: accentName })
      await refresh()
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    } finally {
      setSaving(false)
    }
  }

  async function handleLogoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      await uploadLogo(file)
      await refresh()
    } finally {
      setUploadingLogo(false)
      e.target.value = ''
    }
  }

  return (
    <div className="max-w-lg space-y-5">
      <Card className="p-5 space-y-5">
        <div>
          <label className="text-xs font-medium text-muted mb-2 block">{t('admin.logo')}</label>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-accent-soft flex items-center justify-center overflow-hidden shrink-0">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon size={20} className="text-accent" />
              )}
            </div>
            <Button variant="secondary" type="button" disabled={uploadingLogo} onClick={() => fileInputRef.current?.click()}>
              {settings.logo_url ? t('admin.changeLogo') : t('admin.uploadLogo')}
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted mb-1 block">{t('admin.platformName')}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm" />
        </div>

        <div>
          <label className="text-xs font-medium text-muted mb-1 block">{t('admin.accentColor')}</label>
          <div className="flex gap-2">
            {accents.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAccentName(a)}
                className={`h-9 w-9 rounded-full border-2 ${accentName === a ? 'border-ink' : 'border-transparent'}`}
                style={{ background: a === 'emerald' ? '#1D7A5F' : a === 'indigo' ? '#3D4ABF' : '#B25C3A' }}
              />
            ))}
          </div>
        </div>

        <Button disabled={saving} onClick={handleSave}>{t('admin.saveSettings')}</Button>
        {saved && <p className="text-sm text-accent">{t('admin.saved')}</p>}
      </Card>
    </div>
  )
}
