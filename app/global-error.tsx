'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

// ルートレイアウト自体で発生したエラーの最終フォールバック。
// global-error は独自に <html>/<body> を描画する必要がある。
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="ja">
      <body style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ letterSpacing: '0.3em', color: '#736756', marginBottom: '1.5rem' }}>— エラー —</p>
        <p style={{ marginBottom: '2rem' }}>予期しないエラーが発生しました。</p>
        <button
          onClick={() => { window.location.href = '/' }}
          style={{ color: '#3b5b8c', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
        >
          ホームへ
        </button>
      </body>
    </html>
  )
}
