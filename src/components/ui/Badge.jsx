import React from 'react'

export default function Badge({ children, tone = 'accent', className = '' }) {
  const tones = {
    accent: 'bg-accent-soft text-accent',
    gold: 'bg-gold-soft text-gold',
    muted: 'bg-line/60 text-muted',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}
