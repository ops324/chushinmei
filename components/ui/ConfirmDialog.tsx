'use client'

import { useEffect, useRef } from 'react'

type Props = {
  open: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ open, message, onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) cancelRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        className="bg-bg-card border border-border rounded-lg shadow-[0_8px_32px_var(--shadow-lg)] max-w-sm w-full mx-4 p-6"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <p className="text-sm text-ink leading-[1.9] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-5 py-2 text-sm text-ink-light border border-border rounded hover:border-border-strong hover:text-ink transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 text-sm font-medium text-white rounded transition-colors"
            style={{ background: 'var(--danger)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--danger)')}
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  )
}
