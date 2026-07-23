import Link from 'next/link'
import AccountMenu from '@/components/layout/AccountMenu'

type Props = {
  displayName: string
  email: string
  avatarUrl: string | null
}

export default function Header({ displayName, email, avatarUrl }: Props) {
  return (
    <header
      className="bg-bg-card border-b border-border sticky top-0 z-40"
      style={{ borderTop: '3px solid var(--accent)' }}
    >
      <div className="max-w-2xl mx-auto w-full px-4 h-[52px] grid grid-cols-3 items-center">
        <div aria-hidden />
        <Link href="/" className="font-serif justify-self-center text-sm font-semibold text-ink tracking-[0.22em] hover:text-ink-light transition-colors">
          中心銘
        </Link>
        <div className="justify-self-end">
          {email && <AccountMenu displayName={displayName} email={email} avatarUrl={avatarUrl} />}
        </div>
      </div>
    </header>
  )
}
