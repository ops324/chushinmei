import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-sm md:max-w-md">
        <div className="text-center mb-8">
          <p className="text-[10px] tracking-[0.45em] text-ink-faint mb-3">中心銘</p>
          <h1 className="text-xl font-semibold text-ink mb-1.5">アカウント作成</h1>
          <p className="text-sm text-ink-faint">大切な言葉を記す場所を作りましょう。</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
