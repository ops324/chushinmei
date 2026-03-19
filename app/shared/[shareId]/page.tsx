import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'

type Props = {
  params: Promise<{ shareId: string }>
}

async function getWord(shareId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('words')
    .select('text, author, created_at')
    .eq('share_id', shareId)
    .eq('is_public', true)
    .single()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareId } = await params
  const word = await getWord(shareId)
  if (!word) return { title: '中心銘' }

  return {
    title: `「${word.text.slice(0, 30)}」— 中心銘`,
    description: word.author ? `— ${word.author}` : '中心銘より',
    openGraph: {
      title: `「${word.text.slice(0, 30)}」`,
      description: word.author ? `— ${word.author}` : '中心銘より',
      siteName: '中心銘',
    },
  }
}

export default async function SharedWordPage({ params }: Props) {
  const { shareId } = await params
  const word = await getWord(shareId)
  if (!word) notFound()

  const date = new Date(word.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto w-full px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm tracking-[0.2em] text-ink-light hover:text-ink transition-colors">
            中心銘
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="relative text-center max-w-lg w-full p-10 bg-bg-card border border-border rounded-sm">
          <div
            className="absolute inset-[6px] border border-border rounded-sm pointer-events-none"
            aria-hidden
          />
          <p className="text-xs tracking-[0.3em] text-ink-faint mb-6">— 中心銘 —</p>
          <p className="text-xl font-medium leading-[2] text-ink mb-4 whitespace-pre-wrap">
            {word.text}
          </p>
          {word.author && (
            <p className="text-sm text-ink-light tracking-wide">— {word.author}</p>
          )}
          <p className="text-xs text-ink-faint mt-6">{date}</p>
        </div>
      </main>
    </div>
  )
}
