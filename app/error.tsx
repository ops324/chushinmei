'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="relative text-center max-w-sm w-full p-10 bg-bg-card border border-border rounded-sm">
        <div
          className="absolute inset-[6px] border border-border rounded-sm pointer-events-none"
          aria-hidden
        />
        <p className="text-xs tracking-[0.3em] text-ink-faint mb-6">— エラー —</p>
        <p className="text-sm text-ink leading-[2] mb-8">
          予期しないエラーが発生しました。
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2 text-sm bg-ai text-white rounded-sm hover:bg-ai-light transition-colors"
          >
            再試行
          </button>
          <Link
            href="/"
            className="px-5 py-2 text-sm text-ink-light border border-border rounded-sm hover:border-ink-light transition-colors"
          >
            ホームへ
          </Link>
        </div>
      </div>
    </div>
  )
}
