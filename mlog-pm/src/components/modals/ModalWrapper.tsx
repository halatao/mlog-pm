import React from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  className?: string
  maxWidth?: string
  children?: React.ReactNode
}

export default function ModalWrapper({ open, onClose, title, className, maxWidth = 'max-w-md', children }: Props) {
  if (!open) return null
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />

      <div className={`relative tp-text rounded shadow w-full ${maxWidth} p-4 bg-[var(--tp-modal-bg)] z-10 ${className ?? ''}`}>
        {title ? (
          <div className="flex items-start justify-between mb-3">
            <div className="text-lg font-semibold">{title}</div>
            <button aria-label="Zavřít" onClick={onClose} className="tp-muted hover:text-white text-2xl px-2">×</button>
          </div>
        ) : null}

        <div>
          {children}
        </div>
      </div>
    </div>
  )
}
