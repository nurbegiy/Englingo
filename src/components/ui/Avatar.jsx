import React from 'react'

// Deterministic gradient avatar from a seed string (no external image calls),
// or a real uploaded photo when imageUrl is provided.
export default function Avatar({ seed = 'x', name = '', size = 40, frame = null, imageUrl = null }) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  const hue1 = Math.abs(hash) % 360
  const hue2 = (hue1 + 40) % 360
  const initials = (name || seed).trim().split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join('')

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name || seed}
        className={`inline-block rounded-full object-cover select-none ${frame ? 'ring-2 ring-offset-2 ring-offset-paper' : ''}`}
        style={{
          width: size, height: size,
          ...(frame === 'gold' ? { boxShadow: '0 0 0 2px rgb(var(--gold))' } : {}),
          ...(frame === 'silver' ? { boxShadow: '0 0 0 2px rgb(var(--muted))' } : {}),
        }}
      />
    )
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full font-semibold text-white select-none ${frame ? 'ring-2 ring-offset-2 ring-offset-paper' : ''}`}
      style={{
        width: size, height: size, fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${hue1} 55% 45%), hsl(${hue2} 55% 38%))`,
        ...(frame === 'gold' ? { boxShadow: '0 0 0 2px rgb(var(--gold))' } : {}),
        ...(frame === 'silver' ? { boxShadow: '0 0 0 2px rgb(var(--muted))' } : {}),
      }}
    >
      {initials || '?'}
    </div>
  )
}
