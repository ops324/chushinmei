import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AccountMenu from '@/components/layout/AccountMenu'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let displayName = ''
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle()
    displayName = profile?.display_name ?? ''
  }

  return (
    <header
      className="bg-bg-card border-b border-border sticky top-0 z-40"
      style={{ borderTop: '3px solid var(--ai)' }}
    >
      <div className="max-w-2xl mx-auto w-full px-4 h-[52px] flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-ink tracking-[0.22em] hover:text-ink-light transition-colors">
          中心銘
        </Link>
        {user && <AccountMenu displayName={displayName} email={user.email ?? ''} />}
      </div>
    </header>
  )
}
