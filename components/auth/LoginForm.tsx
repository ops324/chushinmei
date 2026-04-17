'use client'

import { useActionState, useEffect, useState } from 'react'
import { login } from '@/lib/actions/auth-actions'
import Link from 'next/link'

const HASH_ERROR_MAP: Record<string, string> = {
  otp_expired: 'メールリンクが無効または期限切れです。再度リセットをお試しください',
  access_denied: 'アクセスが拒否されました',
}

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null)
  const [hashError, setHashError] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    if (!hash) return
    const params = new URLSearchParams(hash)
    const errorCode = params.get('error_code')
    if (errorCode) {
      setHashError(HASH_ERROR_MAP[errorCode] ?? params.get('error_description')?.replace(/\+/g, ' ') ?? 'エラーが発生しました')
      // ハッシュをクリア
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const displayError = state?.error ?? hashError

  return (
    <div className="bg-bg-card border border-border rounded-lg p-6 shadow-sm">
      <form action={action} className="flex flex-col gap-4">
        {displayError && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
            {displayError}
          </p>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-ink-light" htmlFor="email">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="border border-border rounded px-3 py-2 text-ink bg-white focus:outline-none focus:border-ai text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-ink-light" htmlFor="password">
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="border border-border rounded px-3 py-2 text-ink bg-white focus:outline-none focus:border-ai text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="bg-ai text-white rounded py-2 text-sm font-medium hover:bg-ai-light transition-colors disabled:opacity-50"
        >
          {pending ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      <p className="text-center text-sm text-ink-faint mt-4">
        <Link href="/auth/forgot-password" className="text-ai hover:underline">
          パスワードを忘れた方
        </Link>
      </p>

      <p className="text-center text-sm text-ink-faint mt-2">
        アカウントがない方は{' '}
        <Link href="/auth/register" className="text-ai hover:underline">
          登録
        </Link>
      </p>
    </div>
  )
}
