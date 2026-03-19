import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold text-center text-ink mb-2">中心銘</h1>
        <p className="text-center text-sm text-ink-faint mb-8">アカウントを作成する</p>
        <RegisterForm />
      </div>
    </div>
  )
}
