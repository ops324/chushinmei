'use client'

import { useActionState } from 'react'
import { updatePassword } from '@/lib/actions/auth-actions'

export default function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, null)

  return (
    <div className="bg-bg-card border border-border rounded-lg p-6 shadow-sm">
      <form action={action} className="flex flex-col gap-4">
        {state?.error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
            {state.error}
          </p>
        )}
        {state?.success && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
            {state.success}
          </p>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-ink-light" htmlFor="password">
            新しいパスワード
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
        <div className="flex flex-col gap-1">
          <label className="text-sm text-ink-light" htmlFor="password_confirm">
            パスワードを確認
          </label>
          <input
            id="password_confirm"
            name="password_confirm"
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
          {pending ? '更新中...' : 'パスワードを更新'}
        </button>
      </form>
    </div>
  )
}
