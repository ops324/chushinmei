import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/actions/auth-actions'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="border-b border-border bg-bg-card px-4 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-ink tracking-wide">中心銘</h1>
      {user && (
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-ink-faint hover:text-ink transition-colors"
          >
            ログアウト
          </button>
        </form>
      )}
    </header>
  )
}
