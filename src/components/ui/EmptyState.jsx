import React from 'react'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="mb-4 h-14 w-14 rounded-full bg-accent-soft flex items-center justify-center">
          <Icon size={24} className="text-accent" strokeWidth={1.75} />
        </div>
      )}
      <h3 className="font-display text-lg font-medium text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-muted max-w-xs mb-5">{description}</p>}
      {action}
    </div>
  )
}
