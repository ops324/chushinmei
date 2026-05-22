'use client'

import { useEffect, useRef } from 'react'
import ShareActions from '@/components/ui/ShareActions'

type Props = {
  open: boolean
  onClose: () => void
  url: string
}

export default function ShareDialog({ open, onClose, url }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>('button')
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="bg-bg-card border border-border rounded-lg shadow-[0_8px_32px_var(--shadow-lg)] max-w-sm w-full mx-4 p-6"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="共有"
      >
        <p className="text-sm font-medium text-ink mb-4">共有する</p>
        <ShareActions url={url} />
        <div className="flex justify-end mt-5">
          <button
            ref={closeRef}
            onClick={onClose}
            className="px-5 py-2 text-sm text-ink-light border border-border rounded hover:border-border-strong hover:text-ink transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
