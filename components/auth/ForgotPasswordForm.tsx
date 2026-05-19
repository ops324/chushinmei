'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/lib/actions/auth-actions'
import Link from 'next/link'

const inputClass =
  'w-full border border-border rounded px-3.5 py-2.5 text-sm text-ink bg-bg outline-none focus:border-ai focus:ring-2 focus:ring-ai-muted transition-colors placeholder:text-ink-faint'

const labelClass = 'text-xs font-medium text-ink-light tracking-wide'

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(resetPassword, null)

  return (
    <div className="bg-bg-card border border-border rounded-lg p-7">
      {state?.success ? (
        <div className="flex flex-col gap-4">
          <p
            className="text-sm rounded px-3.5 py-2.5 border leading-[1.7]"
            style={{ background: 'var(--success-bg)', borderColor: 'var(--success-border)', color: 'var(--success)' }}
          >
            {state.success}
          </p>
          <Link
            href="/auth/login"
            className="text-center text-sm text-ai hover:underline underline-offset-4"
          >
            ログインに戻る
          </Link>
        </div>
      ) : (
        <form action={action} className="flex flex-col gap-4">
          {state?.error && (
            <p
              className="text-sm rounded px-3.5 py-2.5 border leading-[1.7]"
              style={{ background: 'var(--danger-bg)', borderColor: 'var(--danger-border)', color: 'var(--danger)' }}
            >
              {state.error}
            </p>
          )}
          <p className="text-sm text-ink-light leading-[1.8]">
            登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
          </p>
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
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-ai text-white rounded py-2.5 text-sm font-medium hover:bg-ai-light transition-colors disabled:opacity-40 mt-1"
          >
            {pending ? '送信中...' : 'リセットメールを送信'}
          </button>
          <div className="pt-1 text-center">
            <Link href="/auth/login" className="text-sm text-ai hover:underline underline-offset-4">
              ログインに戻る
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
