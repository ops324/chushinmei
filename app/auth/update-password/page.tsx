import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm'
import { Suspense } from 'react'

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm md:max-w-md">
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.45em] text-ink-faint mb-3">中心銘</p>
          <h1 className="text-xl font-semibold text-ink mb-1.5">新しいパスワードを設定</h1>
          <p className="text-sm text-ink-faint">6文字以上で入力してください。</p>
        </div>
        <Suspense fallback={
          <div className="bg-bg-card border border-border rounded-lg p-7">
            <p className="text-sm text-ink-faint text-center">読み込み中...</p>
          </div>
        }>
          <UpdatePasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
