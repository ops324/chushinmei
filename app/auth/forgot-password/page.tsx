import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm md:max-w-md">
        <div className="text-center mb-8">
          <p className="font-serif text-[10px] tracking-[0.45em] text-ink-faint mb-3">中心銘</p>
          <h1 className="text-xl font-semibold text-ink mb-1.5">パスワードリセット</h1>
          <p className="text-sm text-ink-faint">登録済みのメールへリンクをお送りします。</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
