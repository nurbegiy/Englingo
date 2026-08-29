import React from 'react'
import { LEVELS } from '../../mock/data'

// Signature element: a medallion showing CEFR level as an arc position
// (A1 -> C2 sweep), used across Home, Profile, and Leaderboard rows.
export default function LevelMedallion({ level = 'A1', size = 56, xp = null }) {
  const idx = Math.max(0, LEVELS.indexOf(level))
  const progress = LEVELS.length > 1 ? idx / (LEVELS.length - 1) : 0
  const r = size / 2 - 4
  const c = 2 * Math.PI * r
  const offset = c * (1 - progress)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line))" strokeWidth="3" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgb(var(--accent))" strokeWidth="3" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-semibold" style={{ fontSize: size * 0.32 }}>{level || '—'}</span>
        {xp !== null && <span className="text-[9px] text-muted -mt-0.5">{xp} XP</span>}
      </div>
    </div>
  )
}
