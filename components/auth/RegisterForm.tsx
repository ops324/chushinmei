'use client'

import { useActionState } from 'react'
import { register } from '@/lib/actions/auth-actions'
import Link from 'next/link'

const inputClass =
  'w-full border border-border rounded px-3.5 py-2.5 text-sm text-ink bg-bg outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted transition-colors placeholder:text-ink-faint'

const labelClass = 'text-xs font-medium text-ink-light tracking-wide'

export default function RegisterForm() {
  const [state, action, pending] = useActionState(register, null)

  // 確認メール送信後は、フォームを案内パネルに差し替える（再送信防止）。
  // このパネルは送信後＝クライアント描画時のみ表示されるため window 参照は安全。
  if (state?.success) {
    const fromTry =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('from') === 'try'
    return (
      <div className="bg-bg-card border border-border rounded-lg p-7 text-center">
        <div className="flex justify-center mb-4">
          <span
            className="inline-flex items-center justify-center w-12 h-12 rounded-full"
            style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
            aria-hidden
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-10 5L2 7" />
            </svg>
          </span>
        </div>
        <h2 className="text-base font-semibold text-ink mb-3">確認メールを送信しました</h2>
        <p className="text-sm text-ink-light leading-[1.9]">{state.success}</p>
        {fromTry && (
          <p className="text-sm text-ink-light leading-[1.9] mt-2">
            ログイン後、お試しで作成した言葉も引き継げます。
          </p>
        )}
        <p className="text-xs text-ink-faint leading-[1.8] mt-4">
          メールが届かない場合は、迷惑メールフォルダもご確認ください。
        </p>
        <div className="mt-6 pt-5 border-t border-border">
          <p className="text-sm text-ink-faint">
            確認が済んだら{' '}
            <Link href="/auth/login" className="text-accent font-medium hover:underline underline-offset-4">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    )
  }

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
          className="w-full bg-accent text-white rounded py-2.5 text-sm font-medium hover:bg-accent-light transition-colors disabled:opacity-40 mt-1"
        >
          {pending ? '登録中...' : 'アカウント作成'}
        </button>
      </form>

      <div className="mt-5 pt-5 border-t border-border text-center flex flex-col gap-2">
        <p className="text-sm text-ink-faint">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/auth/login" className="text-accent font-medium hover:underline underline-offset-4">
            ログイン
          </Link>
        </p>
        <p className="text-sm text-ink-faint">
          <Link href="/try" className="text-accent font-medium hover:underline underline-offset-4">
            まずはお試しで体験する
          </Link>
        </p>
      </div>
    </div>
  )
}
