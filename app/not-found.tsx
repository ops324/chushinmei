import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="relative text-center max-w-sm w-full p-10 bg-bg-card border border-border rounded overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-ai" />
        <div
          className="absolute inset-[7px] border border-border rounded pointer-events-none opacity-50"
          aria-hidden
        />
        <p className="text-[10px] tracking-[0.4em] text-ink-faint mb-7 uppercase">404</p>
        <p className="text-sm text-ink leading-[2] mb-8">
          お探しのページは見つかりませんでした。
        </p>
        <Link
          href="/"
          className="inline-block px-7 py-2.5 text-sm font-medium bg-ai text-white rounded hover:bg-ai-light transition-colors"
        >
          ホームへ戻る
        </Link>
      </div>
    </div>
  )
}
