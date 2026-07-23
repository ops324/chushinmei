'use client'

import { useState, useRef, useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useTryWords } from '@/lib/hooks/useTryWords'
import { validateWord } from '@/lib/utils/word-validation'
import type { TryWord } from '@/lib/utils/try-store'

const inputClass =
  'text-sm px-3 py-2.5 bg-bg border border-border rounded text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent-muted resize-y placeholder:text-ink-faint transition-colors'

const labelClass = 'text-xs font-medium text-ink-light tracking-wide'

const btnPrimary =
  'px-7 py-2 text-sm font-medium bg-accent text-white rounded hover:bg-accent-light transition-colors disabled:opacity-40'

const btnSecondary =
  'px-5 py-2 text-sm text-ink-light border border-border rounded hover:border-border-strong hover:text-ink transition-colors'

function formInput(formData: FormData) {
  return {
    text: ((formData.get('text') as string | null) ?? '').trim(),
    author: ((formData.get('author') as string | null) ?? '').trim(),
    memo: ((formData.get('memo') as string | null) ?? '').trim(),
  }
}

export default function TryWordsClient() {
  const { showToast } = useToast()
  const { words, ready, add, update, remove } = useTryWords()
  const [formOpen, setFormOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const filtered = query.trim()
    ? words.filter(w =>
        w.text.toLowerCase().includes(query.toLowerCase()) ||
        w.author.toLowerCase().includes(query.toLowerCase()) ||
        w.memo.toLowerCase().includes(query.toLowerCase())
      )
    : words

  function handleAdd(formData: FormData) {
    const input = formInput(formData)
    const error = validateWord(input)
    if (error) {
      showToast(error, 'error')
      return
    }
    add(input)
    setFormOpen(false)
    showToast('言葉を記しました')
  }

  function handleDeleteConfirm() {
    if (!confirmId) return
    remove(confirmId)
    setConfirmId(null)
    showToast('言葉を削除しました')
  }

  if (!ready) {
    return (
      <div className="text-center py-20">
        <p className="text-[11px] tracking-[0.3em] text-ink-faint">— 読み込み中 —</p>
      </div>
    )
  }

  return (
    <>
      <TodayWord words={words} />

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
              <button type="submit" className={btnPrimary}>
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
            {query ? `${filtered.length}件` : `${words.length}件`}
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
              <TryWordCard
                key={word.id}
                word={word}
                onUpdate={update}
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

function TodayWord({ words }: { words: TryWord[] }) {
  const [idx, setIdx] = useState<number | null>(null)

  useEffect(() => {
    if (words.length === 0) return
    const seed = new Date().toDateString()
    let hash = 0
    for (const c of seed) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
    // new Date() はクライアント専用。SSRハイドレーション不一致を避けるため effect 内で算出する
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdx(Math.abs(hash) % words.length)
  }, [words.length])

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
        <p className="font-serif text-xl font-medium leading-[2.1] text-ink mb-4 whitespace-pre-wrap">
          {entry.text}
        </p>
        <div className="flex items-end justify-between gap-4 text-sm">
          <div>
            {entry.author && (
              <p className="font-serif text-ink-light whitespace-pre-wrap">— {entry.author}</p>
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

function TryWordCard({
  word,
  onUpdate,
  onDelete,
  showToast,
}: {
  word: TryWord
  onUpdate: (id: string, input: { text: string; author: string; memo: string }) => void
  onDelete: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}) {
  const [editing, setEditing] = useState(false)
  const date = new Date(word.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  function handleUpdate(formData: FormData) {
    const input = formInput(formData)
    const error = validateWord(input)
    if (error) {
      showToast(error, 'error')
      return
    }
    onUpdate(word.id, input)
    setEditing(false)
    showToast('言葉を更新しました')
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
            <button type="submit" className={btnPrimary}>
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
        <TryWordMenu
          onEdit={() => setEditing(true)}
          onDelete={onDelete}
          showToast={showToast}
        />
      </div>
      <p className="font-serif text-[15px] font-medium leading-[2.1] whitespace-pre-wrap text-ink mb-3 pr-9">
        {word.text}
      </p>
      <div className="pt-3 border-t border-border flex items-start justify-between gap-4 text-xs">
        <div className="flex flex-col gap-0.5">
          {word.author && (
            <span className="font-serif text-ink-light whitespace-pre-wrap">— {word.author}</span>
          )}
          {word.memo && (
            <span className="text-ink-faint whitespace-pre-wrap">{word.memo}</span>
          )}
        </div>
        <span className="text-ink-faint shrink-0 mt-0.5">{date}</span>
      </div>
    </div>
  )
}

// お試し用のカードメニュー。共有はアカウント登録後の機能のため、ここでは登録へ誘導する。
function TryWordMenu({
  onEdit,
  onDelete,
  showToast,
}: {
  onEdit: () => void
  onDelete: () => void
  showToast: (msg: string, type?: 'success' | 'error') => void
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKey)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleKey)
      }
    }
  }, [open])

  function handleEdit() { setOpen(false); onEdit() }
  function handleDelete() { setOpen(false); onDelete() }
  function handleShare() {
    setOpen(false)
    showToast('共有はアカウント登録後に使えます')
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        className="p-1.5 text-ink-faint hover:text-ink rounded hover:bg-bg-surface transition-all"
        aria-label="メニューを開く"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.4" />
          <circle cx="8" cy="8" r="1.4" />
          <circle cx="8" cy="13" r="1.4" />
        </svg>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1.5 bg-bg-card border border-border rounded shadow-[0_4px_20px_var(--shadow-md)] z-10 min-w-[148px] py-1 overflow-hidden">
          <button
            role="menuitem"
            onClick={handleEdit}
            className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-bg-surface transition-colors flex items-center gap-2.5"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            編集
          </button>
          <button
            role="menuitem"
            onClick={handleShare}
            className="w-full text-left px-4 py-2.5 text-sm text-ink-faint hover:bg-bg-surface transition-colors flex items-center gap-2.5"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            共有（登録後）
          </button>
          <div className="mx-3 my-1 border-t border-border" />
          <button
            role="menuitem"
            onClick={handleDelete}
            className="w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-danger-bg focus-visible:bg-danger-bg transition-colors flex items-center gap-2.5"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            削除
          </button>
        </div>
      )}
    </div>
  )
}
