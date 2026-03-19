'use client'

import { useTransition } from 'react'
import { toggleWordPublic } from '@/lib/actions/word-actions'

type Props = {
  wordId: string
  isPublic: boolean
  shareId: string | null
  showToast: (message: string, type?: 'success' | 'error') => void
}

export default function ShareToggle({ wordId, isPublic, shareId, showToast }: Props) {
  const [isPending, startTransition] = useTransition()

  const shareUrl = shareId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${shareId}`
    : null

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleWordPublic(wordId, !isPublic)
        showToast(isPublic ? '非公開にしました' : '公開URLを生成しました')
      } catch {
        showToast('操作に失敗しました', 'error')
      }
    })
  }

  async function handleCopy() {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      showToast('URLをコピーしました')
    } catch {
      showToast('コピーに失敗しました', 'error')
    }
  }

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-sm border transition-all disabled:opacity-50 ${
          isPublic
            ? 'bg-ai text-white border-ai hover:bg-ai-light hover:border-ai-light'
            : 'text-ink-light border-border hover:border-ai hover:text-ai'
        }`}
      >
        <span>{isPublic ? '公開中' : '非公開'}</span>
      </button>

      {isPublic && shareUrl && (
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 text-xs text-ink-light border border-border rounded-sm hover:border-ai hover:text-ai transition-all"
        >
          URLをコピー
        </button>
      )}
    </div>
  )
}
