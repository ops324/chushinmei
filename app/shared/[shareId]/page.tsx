import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import PublicShare from '@/components/shared/PublicShare'

type Props = {
  params: Promise<{ shareId: string }>
}

type SharedWord = { text: string; author: string; created_at: string }

async function getWord(shareId: string): Promise<SharedWord | null> {
  const supabase = await createClient()
  // anon にテーブル直アクセスを与えず、share_id 指定で1行だけ返す RPC 経由で取得する
  // （is_public=true の全件列挙を防ぐため）。
  const { data } = await supabase
    .rpc('get_shared_word', { p_share_id: shareId })
    .maybeSingle()
  return (data as SharedWord | null) ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareId } = await params
  const word = await getWord(shareId)
  if (!word) return { title: '中心銘' }

  const quote = word.text.length > 70 ? `${word.text.slice(0, 70)}…` : word.text
  const headline = `「${quote}」`
  const description = word.author ? `— ${word.author}` : '中心銘より'

  return {
    title: `${headline} — 中心銘`,
    description,
    openGraph: {
      title: headline,
      description,
      siteName: '中心銘',
      type: 'article',
      locale: 'ja_JP',
      images: ['/og.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: headline,
      description,
      images: ['/og.png'],
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
      <header
        className="bg-bg-card border-b border-border"
        style={{ borderTop: '3px solid var(--ai)' }}
      >
        <div className="max-w-2xl mx-auto w-full px-4 h-[52px] flex items-center justify-between">
          <Link
            href="/"
            className="text-xs tracking-[0.2em] text-ink-faint hover:text-ink transition-colors font-medium"
          >
            中心銘
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="relative text-center max-w-lg w-full p-10 bg-bg-card border border-border rounded overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-ai" />
          <div
            className="absolute inset-[7px] border border-border rounded pointer-events-none opacity-50"
            aria-hidden
          />
          <p className="text-[10px] tracking-[0.4em] text-ink-faint mb-7 uppercase">中心銘</p>
          <p className="text-xl font-medium leading-[2.1] text-ink mb-5 whitespace-pre-wrap">
            {word.text}
          </p>
          {word.author && (
            <p className="text-sm text-ink-light tracking-wide whitespace-pre-wrap">— {word.author}</p>
          )}
          <p className="text-xs text-ink-faint mt-7">{date}</p>
        </div>

        <PublicShare />
      </main>
    </div>
  )
}
