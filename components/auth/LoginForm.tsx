'use client'

import { useActionState, useEffect, useState } from 'react'
import { login } from '@/lib/actions/auth-actions'
import Link from 'next/link'

const HASH_ERROR_MAP: Record<string, string> = {
  otp_expired: 'メールリンクが無効または期限切れです。再度リセットをお試しください',
  access_denied: 'アクセスが拒否されました',
}

const inputClass =
  'w-full border border-border rounded px-3.5 py-2.5 text-sm text-ink bg-bg outline-none focus:border-ai focus:ring-2 focus:ring-ai-muted transition-colors placeholder:text-ink-faint'

const labelClass = 'text-xs font-medium text-ink-light tracking-wide'

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null)
  const [hashError, setHashError] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    if (!hash) return
    const params = new URLSearchParams(hash)
    const errorCode = params.get('error_code')
    if (errorCode) {
      // URLハッシュ（クライアント専用）からのエラー読み取りなので effect 内 setState が妥当
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHashError(HASH_ERROR_MAP[errorCode] ?? params.get('error_description')?.replace(/\+/g, ' ') ?? 'エラーが発生しました')
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  const displayError = state?.error ?? hashError

  return (
    <div className="bg-bg-card border border-border rounded-lg p-7">
      <form action={action} className="flex flex-col gap-4">
        {displayError && (
          <p
            className="text-sm rounded px-3.5 py-2.5 border leading-[1.7]"
            style={{ background: 'var(--danger-bg)', borderColor: 'var(--danger-border)', color: 'var(--danger)' }}
          >
            {displayError}
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="email">メールアドレス</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="password">パスワード</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-ai text-white rounded py-2.5 text-sm font-medium hover:bg-ai-light transition-colors disabled:opacity-40 mt-1"
        >
          {pending ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      <div className="mt-5 pt-5 border-t border-border flex flex-col gap-2 text-center">
        <p className="text-sm text-ink-faint">
          <Link href="/auth/forgot-password" className="text-ai font-medium hover:underline underline-offset-4">
            パスワードを忘れた方
          </Link>
        </p>
        <p className="text-sm text-ink-faint">
          アカウントがない方は{' '}
          <Link href="/auth/register" className="text-ai font-medium hover:underline underline-offset-4">
            登録
          </Link>
        </p>
      </div>
    </div>
  )
}
