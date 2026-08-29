import React from 'react'
import { Loader2 } from 'lucide-react'

export default function Loader({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
      <Loader2 className="animate-spin text-accent" size={26} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
}
