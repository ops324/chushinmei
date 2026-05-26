import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import {
  AvatarForm,
  DisplayNameForm,
  EmailForm,
  PasswordForm,
  DeleteAccountForm,
} from '@/components/account/AccountForms'

export const metadata: Metadata = {
  title: 'アカウント設定 — 中心銘',
}

function Section({
  title,
  description,
  danger,
  children,
}: {
  title: string
  description?: string
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      className="bg-bg-card border border-border rounded-lg p-6"
      style={danger ? { borderColor: 'var(--danger-border)' } : undefined}
    >
      <h2 className={`text-sm font-semibold tracking-wide mb-1 ${danger ? 'text-danger' : 'text-ink'}`}>
        {title}
      </h2>
      {description && <p className="text-xs text-ink-faint leading-[1.7] mb-4">{description}</p>}
      <div className={description ? '' : 'mt-4'}>{children}</div>
    </section>
  )
}

export default async function AccountPage() {
  // proxy.ts で検証済みの user 情報をヘッダから取得（重複 getUser() を避ける）
  const h = await headers()
  const userId = h.get('x-user-id')
  const email = h.get('x-user-email') ?? ''
  if (!userId) redirect('/auth/login')

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', userId)
    .maybeSingle()

  return (
    <>
      <Header
        displayName={profile?.display_name ?? ''}
        email={email}
        avatarUrl={profile?.avatar_url ?? null}
      />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="text-xs text-ink-faint hover:text-ink-light transition-colors tracking-wide inline-flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="15 18 9 12 15 6" />
            </svg>
            一覧に戻る
          </Link>
          <h1 className="text-lg font-semibold text-ink tracking-wide mt-2">アカウント設定</h1>
        </div>

        <div className="flex flex-col gap-5">
          <Section title="アイコン画像">
            <AvatarForm current={profile?.avatar_url ?? null} name={profile?.display_name ?? email} />
          </Section>

          <Section title="プロフィール">
            <DisplayNameForm current={profile?.display_name ?? ''} />
          </Section>

          <Section title="メールアドレス">
            <EmailForm current={email} />
          </Section>

          <Section title="パスワード">
            <PasswordForm />
          </Section>

          <Section
            title="アカウントの削除"
            danger
          >
            <DeleteAccountForm />
          </Section>
        </div>
      </main>
    </>
  )
}
