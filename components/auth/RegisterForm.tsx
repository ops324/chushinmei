'use client'

import { useActionState } from 'react'
import { register } from '@/lib/actions/auth-actions'
import Link from 'next/link'

const inputClass =
  'w-full border border-border rounded px-3.5 py-2.5 text-sm text-ink bg-bg outline-none focus:border-ai focus:ring-2 focus:ring-ai-muted transition-colors placeholder:text-ink-faint'

const labelClass = 'text-xs font-medium text-ink-light tracking-wide'

export default function RegisterForm() {
  const [state, action, pending] = useActionState(register, null)

  return (
    <div className="bg-bg-card border border-border rounded-lg p-7">
      <form action={action} className="flex flex-col gap-4">
        {state?.error && (
          <p
            className="text-sm rounded px-3.5 py-2.5 border leading-[1.7]"
            style={{ background: 'var(--danger-bg)', borderColor: 'var(--danger-border)', color: 'var(--danger)' }}
          >
            {state.error}
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="display_name">表示名</label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            className={inputClass}
          />
        </div>
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
          <label className={labelClass} htmlFor="password">パスワード（6文字以上）</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-ai text-white rounded py-2.5 text-sm font-medium hover:bg-ai-light transition-colors disabled:opacity-40 mt-1"
        >
          {pending ? '登録中...' : 'アカウント作成'}
        </button>
      </form>

      <div className="mt-5 pt-5 border-t border-border text-center flex flex-col gap-2">
        <p className="text-sm text-ink-faint">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/auth/login" className="text-ai font-medium hover:underline underline-offset-4">
            ログイン
          </Link>
        </p>
        <p className="text-sm text-ink-faint">
          <Link href="/try" className="text-ai font-medium hover:underline underline-offset-4">
            まずはお試しで体験する
          </Link>
        </p>
      </div>
    </div>
  )
}
