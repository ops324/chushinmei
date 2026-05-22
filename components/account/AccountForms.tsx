'use client'

import { useActionState, useState, useTransition } from 'react'
import {
  updateDisplayName,
  updateEmail,
  changePassword,
  deleteAccount,
} from '@/lib/actions/auth-actions'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const inputClass =
  'w-full border border-border rounded px-3.5 py-2.5 text-sm text-ink bg-bg outline-none focus:border-ai focus:ring-2 focus:ring-ai-muted transition-colors placeholder:text-ink-faint'
const labelClass = 'text-xs font-medium text-ink-light tracking-wide'
const submitClass =
  'bg-ai text-white rounded px-5 py-2.5 text-sm font-medium hover:bg-ai-light transition-colors disabled:opacity-40'

type FormState = { error?: string; success?: string } | null

function Feedback({ state }: { state: FormState }) {
  if (!state?.error && !state?.success) return null
  const isError = !!state.error
  return (
    <p
      className="text-sm rounded px-3.5 py-2.5 border leading-[1.7]"
      style={
        isError
          ? { background: 'var(--danger-bg)', borderColor: 'var(--danger-border)', color: 'var(--danger)' }
          : { background: 'var(--success-bg)', borderColor: 'var(--success-border)', color: 'var(--success)' }
      }
    >
      {state.error ?? state.success}
    </p>
  )
}

export function DisplayNameForm({ current }: { current: string }) {
  const [state, action, pending] = useActionState(updateDisplayName, null)
  return (
    <form action={action} className="flex flex-col gap-4">
      <Feedback state={state} />
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="display_name">表示名</label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          required
          defaultValue={current}
          className={inputClass}
        />
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className={submitClass}>
          {pending ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  )
}

export function EmailForm({ current }: { current: string }) {
  const [state, action, pending] = useActionState(updateEmail, null)
  return (
    <form action={action} className="flex flex-col gap-4">
      <Feedback state={state} />
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="email">メールアドレス</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={current}
          className={inputClass}
        />
        <p className="text-xs text-ink-faint leading-[1.7]">
          変更後、新しいアドレスに確認メールが届きます。リンクをクリックすると変更が完了します。
        </p>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className={submitClass}>
          {pending ? '送信中...' : '確認メールを送信'}
        </button>
      </div>
    </form>
  )
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null)
  return (
    <form action={action} className="flex flex-col gap-4">
      <Feedback state={state} />
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="current_password">現在のパスワード</label>
        <input
          id="current_password"
          name="current_password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="password">新しいパスワード（6文字以上）</label>
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
      <div className="flex flex-col gap-1.5">
        <label className={labelClass} htmlFor="password_confirm">新しいパスワード（確認）</label>
        <input
          id="password_confirm"
          name="password_confirm"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className={submitClass}>
          {pending ? '変更中...' : 'パスワードを変更'}
        </button>
      </div>
    </form>
  )
}

export function DeleteAccountForm() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function handleConfirm() {
    setOpen(false)
    setError('')
    startTransition(async () => {
      const res = await deleteAccount()
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p
          className="text-sm rounded px-3.5 py-2.5 border leading-[1.7]"
          style={{ background: 'var(--danger-bg)', borderColor: 'var(--danger-border)', color: 'var(--danger)' }}
        >
          {error}
        </p>
      )}
      <p className="text-sm text-ink-light leading-[1.9]">
        アカウントを削除すると、登録したすべての言葉とプロフィールが完全に削除され、元に戻すことはできません。
      </p>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={pending}
          className="px-5 py-2.5 text-sm font-medium text-white rounded bg-danger hover:bg-danger-light transition-colors disabled:opacity-40"
        >
          {pending ? '削除中...' : 'アカウントを削除'}
        </button>
      </div>
      <ConfirmDialog
        open={open}
        message="本当にアカウントを削除しますか？すべての言葉とプロフィールが完全に削除され、元に戻せません。"
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </div>
  )
}
