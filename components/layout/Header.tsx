import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/actions/auth-actions'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header
      className="bg-bg-card border-b border-border sticky top-0 z-40"
      style={{ borderTop: '3px solid var(--ai)' }}
    >
      <div className="max-w-2xl mx-auto w-full px-4 h-[52px] flex items-center justify-between">
        <h1 className="text-sm font-semibold text-ink tracking-[0.22em]">中心銘</h1>
        {user && (
          <form action={logout}>
            <button
              type="submit"
              className="text-xs text-ink-faint hover:text-ink-light transition-colors tracking-wide px-1 py-1"
            >
              ログアウト
            </button>
          </form>
        )}
      </div>
    </header>
  )
}
