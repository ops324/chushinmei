import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AccountMenu from '@/components/layout/AccountMenu'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let displayName = ''
  let avatarUrl: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle()
    displayName = profile?.display_name ?? ''
    avatarUrl = profile?.avatar_url ?? null
  }

  return (
    <header
      className="bg-bg-card border-b border-border sticky top-0 z-40"
      style={{ borderTop: '3px solid var(--ai)' }}
    >
      <div className="max-w-2xl mx-auto w-full px-4 h-[52px] grid grid-cols-3 items-center">
        <div aria-hidden />
        <Link href="/" className="justify-self-center text-sm font-semibold text-ink tracking-[0.22em] hover:text-ink-light transition-colors">
          中心銘
        </Link>
        <div className="justify-self-end">
          {user && <AccountMenu displayName={displayName} email={user.email ?? ''} avatarUrl={avatarUrl} />}
        </div>
      </div>
    </header>
  )
}
