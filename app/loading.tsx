export default function Loading() {
  return (
    <>
      <header
        className="bg-bg-card border-b border-border sticky top-0 z-40"
        style={{ borderTop: '3px solid var(--ai)' }}
      >
        <div className="max-w-2xl mx-auto w-full px-4 h-[52px] grid grid-cols-3 items-center">
          <div aria-hidden />
          <span className="justify-self-center text-sm font-semibold text-ink tracking-[0.22em]">
            中心銘
          </span>
          <div className="justify-self-end">
            <div className="w-8 h-8 rounded-full bg-bg-surface animate-pulse" aria-hidden />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8" aria-busy="true" aria-live="polite">
        <span className="sr-only">読み込み中</span>
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-bg-card border border-border rounded-lg p-5 animate-pulse"
            >
              <div className="h-4 bg-bg-surface rounded w-3/4 mb-3" />
              <div className="h-3 bg-bg-surface rounded w-1/3" />
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
