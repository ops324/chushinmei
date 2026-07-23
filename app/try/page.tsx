import Link from 'next/link'
import TryWordsClient from '@/components/words/TryWordsClient'

// お試しページ。proxy.ts で公開パスに登録されており、認証チェックは行わない。
// 名言はブラウザの localStorage にのみ保存され、登録時にアカウントへ引き継げる。
export default function TryPage() {
  return (
    <>
      <header
        className="bg-bg-card border-b border-border sticky top-0 z-40"
        style={{ borderTop: '3px solid var(--accent)' }}
      >
        <div className="max-w-2xl mx-auto w-full px-4 h-[52px] grid grid-cols-3 items-center">
          <span className="text-[10px] tracking-[0.25em] text-ink-faint">お試し中</span>
          <Link
            href="/"
            className="justify-self-center text-sm font-semibold text-ink tracking-[0.22em] hover:text-ink-light transition-colors"
          >
            中心銘
          </Link>
          <Link
            href="/auth/register?from=try"
            className="justify-self-end text-xs font-medium bg-accent text-white rounded px-3.5 py-1.5 hover:bg-accent-light transition-colors"
          >
            登録して保存
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="mb-8 bg-bg-card border border-border rounded px-5 py-4 flex items-start gap-3">
          <span className="text-accent mt-0.5 shrink-0" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
          </span>
          <p className="text-sm text-ink-light leading-[1.9]">
            これはお試し体験です。記した言葉は<strong className="text-ink font-medium">このブラウザにのみ</strong>保存されます。
            アカウントを登録すると、お試しで作った言葉をそのまま引き継いで保存できます。
          </p>
        </div>

        <TryWordsClient />

        <div className="mt-12 text-center border-t border-border pt-8">
          <p className="text-sm text-ink-faint mb-4">気に入ったら、言葉を手元に残しましょう。</p>
          <Link
            href="/auth/register?from=try"
            className="inline-block bg-accent text-white rounded px-7 py-2.5 text-sm font-medium hover:bg-accent-light transition-colors"
          >
            登録して保存する
          </Link>
          <p className="text-sm text-ink-faint mt-4">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/auth/login" className="text-accent font-medium hover:underline underline-offset-4">
              ログイン
            </Link>
          </p>
        </div>
      </main>
    </>
  )
}
