'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { toggleWordPublic } from '@/lib/actions/word-actions'
import ShareDialog from '@/components/words/ShareDialog'

type Props = {
  wordId: string
  isPublic: boolean
  shareId: string | null
  onEdit: () => void
  onDelete: () => void
  showToast: (message: string, type?: 'success' | 'error') => void
}

export default function WordMenu({ wordId, isPublic, shareId, onEdit, onDelete, showToast }: Props) {
  const [open, setOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [isPending, startTransition] = useTransition()
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKey)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleKey)
      }
    }
  }, [open])

  function handleShare() {
    setOpen(false)
    if (isPublic && shareId) {
      setShareUrl(`${window.location.origin}/shared/${shareId}`)
      setShareOpen(true)
    } else {
      startTransition(async () => {
        try {
          const newShareId = await toggleWordPublic(wordId, true)
          setShareUrl(`${window.location.origin}/shared/${newShareId}`)
          setShareOpen(true)
        } catch (e) {
          console.error(e)
          showToast('操作に失敗しました', 'error')
        }
      })
    }
  }

  function handleEdit() { setOpen(false); onEdit() }
  function handleDelete() { setOpen(false); onDelete() }

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        disabled={isPending}
        className="p-1.5 text-ink-faint hover:text-ink rounded hover:bg-bg-surface transition-all disabled:opacity-50"
        aria-label="メニューを開く"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.4" />
          <circle cx="8" cy="8" r="1.4" />
          <circle cx="8" cy="13" r="1.4" />
        </svg>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1.5 bg-bg-card border border-border rounded shadow-[0_4px_20px_var(--shadow-md)] z-10 min-w-[148px] py-1 overflow-hidden">
          <button
            role="menuitem"
            onClick={handleEdit}
            className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-bg-surface transition-colors flex items-center gap-2.5"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            編集
          </button>
          <button
            role="menuitem"
            onClick={handleShare}
            className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-bg-surface transition-colors flex items-center gap-2.5"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            シェア
          </button>
          <div className="mx-3 my-1 border-t border-border" />
          <button
            role="menuitem"
            onClick={handleDelete}
            className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger-bg focus-visible:bg-danger-bg transition-colors flex items-center gap-2.5"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            削除
          </button>
        </div>
      )}

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
      />
    </div>
  )
}
