import React from 'react'

export default function Card({ className = '', children, ...props }) {
  return (
    <div className={`bg-surface border border-line rounded-card shadow-soft ${className}`} {...props}>
      {children}
    </div>
  )
}
