import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm'
import { Suspense } from 'react'

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold text-center text-ink mb-2">中心銘</h1>
        <p className="text-center text-sm text-ink-faint mb-8">新しいパスワードを設定</p>
        <Suspense fallback={
          <div className="bg-bg-card border border-border rounded-lg p-6 shadow-sm">
            <p className="text-sm text-ink-light text-center">読み込み中...</p>
          </div>
        }>
          <UpdatePasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
