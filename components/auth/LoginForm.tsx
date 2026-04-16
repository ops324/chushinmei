'use client'

import { useActionState } from 'react'
import { login, loginWithGoogle } from '@/lib/actions/auth-actions'
import Link from 'next/link'

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null)

  return (
    <div className="bg-bg-card border border-border rounded-lg p-6 shadow-sm">
      <form action={action} className="flex flex-col gap-4">
        {state?.error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
            {state.error}
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

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-bg-card px-2 text-ink-faint">または</span>
        </div>
      </div>

      <form action={loginWithGoogle}>
        <button
          type="submit"
          className="w-full border border-border rounded py-2 text-sm text-ink-light hover:bg-bg transition-colors"
        >
          Googleでログイン
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
