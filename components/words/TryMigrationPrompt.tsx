'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { bulkAddWords } from '@/lib/actions/word-actions'
import {
  readStored,
  clearStoredWords,
  setMigrated,
  hasMigrated,
  hasDismissedMigration,
  setDismissedMigration,
  type TryWord,
} from '@/lib/utils/try-store'

// ホーム初回表示時、お試し（localStorage）で作った言葉を検出し、
// 確認のうえアカウントへ取り込む。登録直後ではなくホーム到達時に実行することで、
// メール確認ON環境でも session 確立後に確実に処理できる。
export default function TryMigrationPrompt() {
  const router = useRouter()
  const { showToast } = useToast()
  const [pending, setPending] = useState<TryWord[] | null>(null)
  const [isImporting, startTransition] = useTransition()

  useEffect(() => {
    if (hasMigrated() || hasDismissedMigration()) return
    const stored = readStored()
    if (stored.length > 0) {
      // localStorage 検出によるダイアログ表示なので effect 内 setState が妥当
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPending(stored)
    }
  }, [])

  if (!pending) return null

  function handleImport() {
    const words = pending ?? []
    startTransition(async () => {
      try {
        const res = await bulkAddWords(
          words.map(w => ({ text: w.text, author: w.author, memo: w.memo }))
        )
        clearStoredWords()
        setMigrated()
        setPending(null)
        showToast(`お試しの言葉を${res.inserted}件取り込みました`)
        router.refresh()
      } catch (e) {
        console.error(e)
        showToast('取り込みに失敗しました', 'error')
      }
    })
  }

  function handleDismiss() {
    setDismissedMigration()
    setPending(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px]"
      onClick={isImporting ? undefined : handleDismiss}
    >
      <div
        className="bg-bg-card border border-border rounded-lg shadow-[0_8px_32px_var(--shadow-lg)] max-w-sm w-full mx-4 p-6"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-describedby="try-migrate-desc"
      >
        <p id="try-migrate-desc" className="text-sm text-ink leading-[1.9] mb-6">
          お試しで作成した<strong className="font-medium">{pending.length}件</strong>の言葉を、
          このアカウントに取り込みますか？
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleDismiss}
            disabled={isImporting}
            className="px-5 py-2 text-sm text-ink-light border border-border rounded hover:border-border-strong hover:text-ink transition-colors disabled:opacity-40"
          >
            あとで
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="px-5 py-2 text-sm font-medium text-white rounded bg-accent hover:bg-accent-light transition-colors disabled:opacity-40"
          >
            {isImporting ? '取り込み中...' : '取り込む'}
          </button>
        </div>
      </div>
    </div>
  )
}
