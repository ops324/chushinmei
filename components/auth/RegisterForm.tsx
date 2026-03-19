'use client'

import { useActionState } from 'react'
import { register } from '@/lib/actions/auth-actions'
import Link from 'next/link'

export default function RegisterForm() {
  const [state, action, pending] = useActionState(register, null)

  return (
    <div className="bg-bg-card border border-border rounded-lg p-6 shadow-sm">
      <form action={action} className="flex flex-col gap-4">
        {state?.error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
            {state.error}
          </p>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-ink-light" htmlFor="display_name">
            表示名
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            className="border border-border rounded px-3 py-2 text-ink bg-white focus:outline-none focus:border-ai text-sm"
          />
        </div>
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
            パスワード（6文字以上）
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="border border-border rounded px-3 py-2 text-ink bg-white focus:outline-none focus:border-ai text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="bg-ai text-white rounded py-2 text-sm font-medium hover:bg-ai-light transition-colors disabled:opacity-50"
        >
          {pending ? '登録中...' : 'アカウント作成'}
        </button>
      </form>

      <p className="text-center text-sm text-ink-faint mt-4">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/auth/login" className="text-ai hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  )
}
