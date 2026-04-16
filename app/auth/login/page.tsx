import LoginForm from '@/components/auth/LoginForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      redirect('/auth/update-password')
    }
    // コード交換に失敗した場合はログインフォームを表示（エラーはハッシュ経由で表示）
  }

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
