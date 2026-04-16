'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/lib/actions/auth-actions'
import Link from 'next/link'

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, null)

  return (
    <div className="bg-bg-card border border-border rounded-lg p-6 shadow-sm">
      {state?.success ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
            {state.success}
          </p>
          <Link
            href="/auth/login"
            className="text-center text-sm text-ai hover:underline"
          >
            ログインに戻る
          </Link>
        </div>
      ) : (
        <form action={action} className="flex flex-col gap-4">
          {state?.error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
              {state.error}
            </p>
          )}
          <p className="text-sm text-ink-light">
            登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
          </p>
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
          <button
            type="submit"
            disabled={pending}
            className="bg-ai text-white rounded py-2 text-sm font-medium hover:bg-ai-light transition-colors disabled:opacity-50"
          >
            {pending ? '送信中...' : 'リセットメールを送信'}
          </button>
          <Link
            href="/auth/login"
            className="text-center text-sm text-ai hover:underline"
          >
            ログインに戻る
          </Link>
        </form>
      )}
    </div>
  )
}
