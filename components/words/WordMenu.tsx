'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { toggleWordPublic } from '@/lib/actions/word-actions'

type Props = {
  wordId: string
  isPublic: boolean
  shareId: string | null
  onDelete: () => void
  showToast: (message: string, type?: 'success' | 'error') => void
}

export default function WordMenu({ wordId, isPublic, shareId, onDelete, showToast }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  async function handleShare() {
    setOpen(false)
    if (isPublic && shareId) {
      // Already public — just copy
      const url = `${window.location.origin}/shared/${shareId}`
      try {
        await navigator.clipboard.writeText(url)
        showToast('URLをコピーしました')
      } catch {
        showToast('コピーに失敗しました', 'error')
      }
    } else {
      // Make public first, then copy
      startTransition(async () => {
        try {
          await toggleWordPublic(wordId, true)
          // After revalidation the shareId won't be available here yet,
          // so we read it from the response by refetching — but since
          // revalidatePath triggers a re-render with updated data,
          // we show a message to copy next time or generate the URL.
          showToast('公開URLを生成しました。もう一度タップでコピーできます')
        } catch {
          showToast('操作に失敗しました', 'error')
        }
      })
    }
  }

  function handleDelete() {
    setOpen(false)
    onDelete()
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={isPending}
        className="p-1.5 text-ink-faint hover:text-ink rounded-sm hover:bg-bg transition-all disabled:opacity-50"
        title="メニュー"
        aria-label="メニューを開く"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-bg-card border border-border rounded-sm shadow-[0_4px_16px_var(--shadow)] z-10 min-w-[140px] py-1">
          <button
            onClick={handleShare}
            className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-bg transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            {isPublic && shareId ? 'URLをコピー' : 'シェア'}
          </button>
          <button
            onClick={handleDelete}
            className="w-full text-left px-4 py-2 text-sm text-[#8b3a3a] hover:bg-[#f5e8e8] transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            削除
          </button>
        </div>
      )}
    </div>
  )
}
