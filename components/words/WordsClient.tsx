'use client'

import { useState, useOptimistic, useTransition, useEffect } from 'react'
import { addWord, deleteWord } from '@/lib/actions/word-actions'
import { useToast } from '@/components/ui/Toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ShareToggle from './ShareToggle'

type Word = {
  id: string
  text: string
  author: string
  memo: string
  is_public: boolean
  share_id: string | null
  created_at: string
}

export default function WordsClient({ initialWords }: { initialWords: Word[] }) {
  const { showToast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [optimisticWords, removeOptimistic] = useOptimistic(
    initialWords,
    (state: Word[], deletedId: string) => state.filter(w => w.id !== deletedId)
  )

  const filtered = query.trim()
    ? optimisticWords.filter(w =>
        w.text.toLowerCase().includes(query.toLowerCase()) ||
        w.author.toLowerCase().includes(query.toLowerCase()) ||
        w.memo.toLowerCase().includes(query.toLowerCase())
      )
    : optimisticWords

  function handleDeleteConfirm() {
    if (!confirmId) return
    const id = confirmId
    setConfirmId(null)
    startTransition(async () => {
      removeOptimistic(id)
      try {
        await deleteWord(id)
        showToast('言葉を削除しました')
      } catch {
        showToast('削除に失敗しました', 'error')
      }
    })
  }

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      try {
        await addWord(formData)
        setFormOpen(false)
        showToast('言葉を記しました')
      } catch {
        showToast('追加に失敗しました', 'error')
      }
    })
  }

  return (
    <>
      <TodayWord words={optimisticWords} />

      {/* 追加フォーム */}
      <section className="mb-8">
        <button
          onClick={() => setFormOpen(o => !o)}
          className="w-full py-3 px-4 text-sm tracking-widest text-ink-light border border-dashed border-border rounded-sm hover:bg-bg-card hover:border-ai hover:text-ai transition-all text-center"
        >
          {formOpen ? '✕ 閉じる' : '＋ 言葉を記す'}
        </button>
        {formOpen && (
          <form
            action={handleAdd}
            className="bg-bg-card border border-border border-t-0 rounded-b-sm p-6 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-light tracking-wide">
                言葉 <span className="text-[#8b3a3a]">*</span>
              </label>
              <textarea
                name="text"
                rows={3}
                required
                placeholder="言葉を入力..."
                className="text-sm px-3 py-2 bg-bg border border-border rounded-sm text-ink outline-none focus:border-ai-light resize-y placeholder:text-ink-faint"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-light tracking-wide">出典・作者</label>
              <input
                name="author"
                type="text"
                placeholder="例：老子、夏目漱石、映画名など"
                className="text-sm px-3 py-2 bg-bg border border-border rounded-sm text-ink outline-none focus:border-ai-light placeholder:text-ink-faint"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-ink-light tracking-wide">メモ</label>
              <input
                name="memo"
                type="text"
                placeholder="感想や出会った場所など"
                className="text-sm px-3 py-2 bg-bg border border-border rounded-sm text-ink outline-none focus:border-ai-light placeholder:text-ink-faint"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="px-5 py-2 text-sm text-ink-light border border-border rounded-sm hover:border-ink-light transition-colors"
              >
                閉じる
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-7 py-2 text-sm bg-ai text-white rounded-sm hover:bg-ai-light transition-colors disabled:opacity-50"
              >
                記す
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 検索 */}
      <section className="mb-6">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="言葉・出典で検索..."
            className="w-full text-sm px-4 py-3 bg-bg-card border border-border rounded-sm text-ink outline-none focus:border-ai-light placeholder:text-ink-faint"
          />
          <span className="absolute right-4 text-xs text-ink-faint pointer-events-none">
            {query ? `${filtered.length} 件` : `${optimisticWords.length} 件`}
          </span>
        </div>
      </section>

      {/* 言葉一覧 */}
      <section>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-ink-faint text-sm leading-[2.2]">
            {query ? (
              <p>「{query}」に一致する言葉がありません。</p>
            ) : (
              <>
                <p>まだ言葉が記されていません。</p>
                <p>好きな言葉を記してみましょう。</p>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(word => (
              <WordCard
                key={word.id}
                word={word}
                onDelete={() => setConfirmId(word.id)}
                showToast={showToast}
              />
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirmId !== null}
        message="この言葉を削除しますか？"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmId(null)}
      />
    </>
  )
}

function TodayWord({ words }: { words: Word[] }) {
  const [idx, setIdx] = useState<number | null>(null)

  useEffect(() => {
    if (words.length === 0) return
    const seed = new Date().toDateString()
    let hash = 0
    for (const c of seed) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
    setIdx(Math.abs(hash) % words.length)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (words.length === 0 || idx === null) return null

  const safeIdx = idx % words.length
  const entry = words[safeIdx]
  if (!entry) return null

  function handleRandom() {
    if (words.length === 1) return
    setIdx(prev => {
      let next: number
      do { next = Math.floor(Math.random() * words.length) } while (next === prev)
      return next
    })
  }

  return (
    <section className="relative text-center mb-12 p-8 bg-bg-card border border-border rounded-sm">
      <div
        className="absolute inset-[6px] border border-border rounded-sm pointer-events-none"
        aria-hidden
      />
      <p className="text-xs tracking-[0.3em] text-ink-faint mb-5">— 今日の言葉 —</p>
      <p className="text-xl font-medium leading-[2] text-ink mb-3 whitespace-pre-wrap">{entry.text}</p>
      {entry.author && (
        <p className="text-sm text-ink-light tracking-wide">— {entry.author}</p>
      )}
      <button
        onClick={handleRandom}
        className="mt-5 px-5 py-1.5 text-xs tracking-[0.15em] text-ink-light border border-border rounded-sm hover:bg-ai hover:text-white hover:border-ai transition-all"
      >
        くじを引く
      </button>
    </section>
  )
}

function WordCard({
  word,
  onDelete,
  showToast,
}: {
  word: Word
  onDelete: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}) {
  const date = new Date(word.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="group relative bg-bg-card border border-border rounded-sm px-6 py-5 hover:shadow-[0_2px_12px_var(--shadow)] transition-shadow">
      <p className="text-base font-medium leading-[1.9] whitespace-pre-wrap text-ink mb-2">
        {word.text}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-light">
        {word.author && <span>— {word.author}</span>}
        {word.memo && <span className="text-ink-faint italic">{word.memo}</span>}
        <span className="ml-auto text-ink-faint">{date}</span>
      </div>
      <ShareToggle
        wordId={word.id}
        isPublic={word.is_public}
        shareId={word.share_id}
        showToast={showToast}
      />
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 px-2 py-0.5 text-ink-faint opacity-0 group-hover:opacity-100 hover:text-[#8b3a3a] hover:bg-[#f5e8e8] rounded-sm transition-all text-sm leading-none"
        title="削除"
      >
        ×
      </button>
    </div>
  )
}
