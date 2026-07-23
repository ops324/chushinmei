'use client'

import { useState, useOptimistic, useTransition, useEffect } from 'react'
import { addWord, deleteWord, updateWord } from '@/lib/actions/word-actions'
import { useToast } from '@/components/ui/Toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import WordMenu from './WordMenu'

type Word = {
  id: string
  text: string
  author: string
  memo: string
  is_public: boolean
  share_id: string | null
  created_at: string
}

const inputClass =
  'text-sm px-3 py-2.5 bg-bg border border-border rounded text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted resize-y placeholder:text-ink-faint transition-colors'

const labelClass = 'text-xs font-medium text-ink-light tracking-wide'

const btnPrimary =
  'px-7 py-2 text-sm font-medium bg-accent text-white rounded hover:bg-accent-light transition-colors disabled:opacity-40'

const btnSecondary =
  'px-5 py-2 text-sm text-ink-light border border-border rounded hover:border-border-strong hover:text-ink transition-colors'

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
      } catch (e) {
        console.error(e)
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
      } catch (e) {
        console.error(e)
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
          className={`w-full py-3 px-4 text-sm tracking-widest border border-dashed rounded transition-all text-center ${
            formOpen
              ? 'text-ink-light border-border-strong bg-bg-card'
              : 'text-ink-light border-border hover:bg-bg-card hover:border-accent hover:text-accent'
          }`}
        >
          {formOpen ? '✕ 閉じる' : '＋ 言葉を記す'}
        </button>

        {formOpen && (
          <form
            action={handleAdd}
            className="bg-bg-card border border-border border-t-0 rounded-b p-6 flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>
                言葉 <span className="text-danger">*</span>
              </label>
              <textarea
                name="text"
                rows={3}
                required
                placeholder="言葉を入力..."
                className={inputClass}
                onKeyDown={(e) => { if (e.key === 'Enter') e.stopPropagation() }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>出典・作者</label>
              <textarea
                name="author"
                rows={2}
                placeholder="例：老子、夏目漱石、映画名など"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>メモ</label>
              <textarea
                name="memo"
                rows={2}
                placeholder="感想や出会った場所など"
                className={inputClass}
              />
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={() => setFormOpen(false)} className={btnSecondary}>
                閉じる
              </button>
              <button type="submit" disabled={isPending} className={btnPrimary}>
                記す
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 検索 */}
      <section className="mb-6">
        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-ink-faint pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="言葉・出典で検索..."
            className="w-full text-sm pl-9 pr-14 py-2.5 bg-bg-card border border-border rounded text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted placeholder:text-ink-faint transition-colors"
          />
          <span className="absolute right-3.5 text-xs text-ink-faint pointer-events-none">
            {query ? `${filtered.length}件` : `${optimisticWords.length}件`}
          </span>
        </div>
      </section>

      {/* 言葉一覧 */}
      <section>
        {filtered.length === 0 ? (
          <div className="text-center py-14">
            {query ? (
              <p className="text-sm text-ink-faint">「{query}」に一致する言葉がありません。</p>
            ) : (
              <div>
                <p className="text-[11px] tracking-[0.3em] text-ink-faint mb-2">— ここは静かです —</p>
                <p className="text-sm text-ink-faint">大切な言葉を記してみてください。</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
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
    // new Date() はクライアント専用。SSRハイドレーション不一致を避けるため effect 内で算出する
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <section className="relative mb-10 bg-bg-card border border-border rounded overflow-hidden">
      <div className="h-[3px] bg-accent" />
      <div className="p-7">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[10px] tracking-[0.35em] text-ink-faint uppercase">今日の言葉</p>
          <button
            onClick={handleRandom}
            className="text-xs text-ink-faint border border-border rounded px-3 py-1 hover:border-accent hover:text-accent transition-all tracking-wide"
          >
            くじを引く
          </button>
        </div>
        <p className="text-xl font-medium leading-[2.1] text-ink mb-4 whitespace-pre-wrap">
          {entry.text}
        </p>
        <div className="flex items-end justify-between gap-4 text-sm">
          <div>
            {entry.author && (
              <p className="text-ink-light whitespace-pre-wrap">— {entry.author}</p>
            )}
          </div>
          <p className="text-xs text-ink-faint shrink-0">
            {new Date(entry.created_at).toLocaleDateString('ja-JP', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
      </div>
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
  const [editing, setEditing] = useState(false)
  const [isPending, startTransition] = useTransition()
  const date = new Date(word.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      try {
        await updateWord(word.id, formData)
        setEditing(false)
        showToast('言葉を更新しました')
      } catch (e) {
        console.error(e)
        showToast('更新に失敗しました', 'error')
      }
    })
  }

  if (editing) {
    return (
      <div className="relative bg-bg-card border border-accent rounded px-6 py-5">
        <form action={handleUpdate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>
              言葉 <span className="text-danger">*</span>
            </label>
            <textarea
              name="text"
              rows={3}
              required
              defaultValue={word.text}
              className={inputClass}
              onKeyDown={(e) => { if (e.key === 'Enter') e.stopPropagation() }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>出典・作者</label>
            <textarea
              name="author"
              rows={2}
              defaultValue={word.author}
              placeholder="例：老子、夏目漱石、映画名など"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>メモ</label>
            <textarea
              name="memo"
              rows={2}
              defaultValue={word.memo}
              placeholder="感想や出会った場所など"
              className={inputClass}
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={() => setEditing(false)} className={btnSecondary}>
              キャンセル
            </button>
            <button type="submit" disabled={isPending} className={btnPrimary}>
              更新
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="relative bg-bg-card border border-border rounded px-6 py-5 hover:border-border-strong hover:shadow-[0_2px_12px_var(--shadow-md)] transition-all duration-200">
      <div className="absolute top-3.5 right-3.5">
        <WordMenu
          wordId={word.id}
          isPublic={word.is_public}
          shareId={word.share_id}
          onEdit={() => setEditing(true)}
          onDelete={onDelete}
          showToast={showToast}
        />
      </div>
      <p className="text-[15px] font-medium leading-[2.1] whitespace-pre-wrap text-ink mb-3 pr-9">
        {word.text}
      </p>
      <div className="pt-3 border-t border-border flex items-start justify-between gap-4 text-xs">
        <div className="flex flex-col gap-0.5">
          {word.author && (
            <span className="text-ink-light whitespace-pre-wrap">— {word.author}</span>
          )}
          {word.memo && (
            <span className="text-ink-faint italic whitespace-pre-wrap">{word.memo}</span>
          )}
        </div>
        <span className="text-ink-faint shrink-0 mt-0.5">{date}</span>
      </div>
    </div>
  )
}
