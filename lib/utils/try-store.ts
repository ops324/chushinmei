import type { WordInput } from '@/lib/utils/word-validation'
import { SAMPLE_WORDS } from '@/lib/utils/try-samples'

// お試しモードの名言1件。認証済みの Word とほぼ同形だが、共有/公開はお試しでは扱わない。
export type TryWord = {
  id: string
  text: string
  author: string
  memo: string
  created_at: string
}

// localStorage キー（衝突回避のため名前空間付き）
const WORDS_KEY = 'chushinmei:try-words'
const SEEDED_KEY = 'chushinmei:try-seeded'
const MIGRATED_KEY = 'chushinmei:try-migrated'
const DISMISSED_KEY = 'chushinmei:try-migrate-dismissed'

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // プライベートモードや容量超過などは黙って無視（体験継続を優先）
  }
}

function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // no-op
  }
}

function parseWords(raw: string | null): TryWord[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw)
    if (!Array.isArray(data)) return []
    // 最低限の形チェック（壊れたデータを弾く）
    return data.filter(
      (w): w is TryWord =>
        w && typeof w.id === 'string' && typeof w.text === 'string'
    )
  } catch {
    return []
  }
}

// 入力から TryWord を生成する。id は UUID、作成日時は現在時刻。
export function createWord(input: WordInput): TryWord {
  return {
    id: crypto.randomUUID(),
    text: input.text.trim(),
    author: input.author.trim(),
    memo: input.memo.trim(),
    created_at: new Date().toISOString(),
  }
}

// 保存済みの名言を読み込む（seed はしない）。引き継ぎ判定など読み取り専用の用途に使う。
export function readStored(): TryWord[] {
  if (!isBrowser()) return []
  return parseWords(safeGet(WORDS_KEY))
}

// お試しページ用の読み込み。初回（未 seed）ならサンプルを投入して返す。
// ユーザーが全削除しても seed フラグが残るため、サンプルは復活しない。
export function loadForTrial(): TryWord[] {
  if (!isBrowser()) return []
  if (safeGet(SEEDED_KEY)) {
    return parseWords(safeGet(WORDS_KEY))
  }
  const now = Date.now()
  const seeded: TryWord[] = SAMPLE_WORDS.map((s, i) => ({
    id: crypto.randomUUID(),
    text: s.text,
    author: s.author,
    memo: s.memo,
    // 新しいものが上に来るよう、わずかに時刻をずらす
    created_at: new Date(now - i * 1000).toISOString(),
  }))
  safeSet(SEEDED_KEY, '1')
  persist(seeded)
  return seeded
}

// 名言リストを localStorage へ書き込む。
export function persist(words: TryWord[]): void {
  if (!isBrowser()) return
  safeSet(WORDS_KEY, JSON.stringify(words))
}

// 引き継ぎ完了後、お試しデータを消す（seed フラグは残し、サンプル再投入を防ぐ）。
export function clearStoredWords(): void {
  if (!isBrowser()) return
  safeRemove(WORDS_KEY)
}

export function hasMigrated(): boolean {
  return isBrowser() && safeGet(MIGRATED_KEY) === '1'
}

export function setMigrated(): void {
  safeSet(MIGRATED_KEY, '1')
}

export function hasDismissedMigration(): boolean {
  return isBrowser() && safeGet(DISMISSED_KEY) === '1'
}

export function setDismissedMigration(): void {
  safeSet(DISMISSED_KEY, '1')
}
