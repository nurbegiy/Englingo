import React from 'react'

const variants = {
  primary: 'bg-accent text-white hover:brightness-95 active:brightness-90',
  secondary: 'bg-accent-soft text-accent hover:brightness-95',
  ghost: 'bg-transparent text-ink hover:bg-accent-soft/60 border border-line',
  danger: 'bg-danger text-white hover:brightness-95',
}

export default function Button({ variant = 'primary', className = '', children, disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition
        disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
