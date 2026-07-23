'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'

const inputClass =
  'w-full border border-border rounded px-3.5 py-2.5 text-sm text-ink bg-bg outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted transition-colors disabled:opacity-50 placeholder:text-ink-faint'

const labelClass = 'text-xs font-medium text-ink-light tracking-wide'

export default function UpdatePasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (tokenHash && type === 'recovery') {
      const supabase = createClient()
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' }).then(({ error }) => {
        if (error) {
          setError('リセットリンクが無効または期限切れです。再度パスワードリセットをお試しください。')
        } else {
          setSessionReady(true)
        }
        setVerifying(false)
      })
    } else {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setSessionReady(true)
        } else {
          setError('セッションが無効です。パスワードリセットのメールを再度送信してください。')
        }
        setVerifying(false)
      })
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const passwordConfirm = formData.get('password_confirm') as string

    if (password !== passwordConfirm) {
      setError('パスワードが一致しません')
      setPending(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setPending(false)
      return
    }

    setSuccess('パスワードを更新しました。リダイレクトします...')
    setTimeout(() => router.push('/'), 1500)
  }

  if (verifying) {
    return (
      <div className="bg-bg-card border border-border rounded-lg p-7">
        <p className="text-sm text-ink-faint text-center">認証を確認中...</p>
      </div>
    )
  }

  return (
    <div className="bg-bg-card border border-border rounded-lg p-7">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p
            className="text-sm rounded px-3.5 py-2.5 border leading-[1.7]"
            style={{ background: 'var(--danger-bg)', borderColor: 'var(--danger-border)', color: 'var(--danger)' }}
          >
            {error}
          </p>
        )}
        {success && (
          <p
            className="text-sm rounded px-3.5 py-2.5 border leading-[1.7]"
            style={{ background: 'var(--success-bg)', borderColor: 'var(--success-border)', color: 'var(--success)' }}
          >
            {success}
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="password">新しいパスワード</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            disabled={!sessionReady}
            autoComplete="new-password"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="password_confirm">パスワードを確認</label>
          <input
            id="password_confirm"
            name="password_confirm"
            type="password"
            required
            minLength={6}
            disabled={!sessionReady}
            autoComplete="new-password"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={pending || !sessionReady}
          className="w-full bg-accent text-white rounded py-2.5 text-sm font-medium hover:bg-accent-light transition-colors disabled:opacity-40 mt-1"
        >
          {pending ? '更新中...' : 'パスワードを更新'}
        </button>
      </form>
    </div>
  )
}
