import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import WordsClient from '@/components/words/WordsClient'
import TryMigrationPrompt from '@/components/words/TryMigrationPrompt'

export default async function Home() {
  // proxy.ts で検証済みの user 情報をヘッダから取得する。
  // proxy が x-user-id を上書き／削除しているので、ここに来た時点で偽装はあり得ない。
  const h = await headers()
  const userId = h.get('x-user-id')
  const email = h.get('x-user-email') ?? ''
  if (!userId) redirect('/auth/login')

  const supabase = await createClient()
  const [wordsRes, profileRes] = await Promise.all([
    supabase
      .from('words')
      .select('id, text, author, memo, is_public, share_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', userId)
      .maybeSingle(),
  ])

  return (
    <>
      <Header
        displayName={profileRes.data?.display_name ?? ''}
        email={email}
        avatarUrl={profileRes.data?.avatar_url ?? null}
      />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <WordsClient initialWords={wordsRes.data ?? []} />
      </main>
      <TryMigrationPrompt />
    </>
  )
}
