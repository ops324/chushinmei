import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="relative text-center max-w-sm w-full p-10 bg-bg-card border border-border rounded-sm">
        <div
          className="absolute inset-[6px] border border-border rounded-sm pointer-events-none"
          aria-hidden
        />
        <p className="text-xs tracking-[0.3em] text-ink-faint mb-6">— 404 —</p>
        <p className="text-sm text-ink leading-[2] mb-8">
          お探しのページは見つかりませんでした。
        </p>
        <Link
          href="/"
          className="px-7 py-2 text-sm bg-ai text-white rounded-sm hover:bg-ai-light transition-colors"
        >
          ホームへ戻る
        </Link>
      </div>
    </div>
  )
}
