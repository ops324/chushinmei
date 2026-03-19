import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold text-center text-ink mb-2">中心銘</h1>
        <p className="text-center text-sm text-ink-faint mb-8">大切な言葉を、手元に。</p>
        <LoginForm />
      </div>
    </div>
  )
}
