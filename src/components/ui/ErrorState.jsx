import React from 'react'
import { AlertTriangle } from 'lucide-react'
import Button from './Button'

export default function ErrorState({ message, onRetry, retryLabel = 'Retry' }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="mb-4 h-14 w-14 rounded-full bg-danger/10 flex items-center justify-center">
        <AlertTriangle size={22} className="text-danger" strokeWidth={1.75} />
      </div>
      <p className="text-sm text-muted max-w-xs mb-5">{message}</p>
      {onRetry && <Button variant="ghost" onClick={onRetry}>{retryLabel}</Button>}
    </div>
  )
}
