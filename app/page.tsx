import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import WordsClient from '@/components/words/WordsClient'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: words } = await supabase
    .from('words')
    .select('id, text, author, memo, is_public, share_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <WordsClient initialWords={words ?? []} />
      </main>
    </>
  )
}
