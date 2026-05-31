export const WORD_LIMITS = {
  text: 2000,
  author: 200,
  memo: 2000,
} as const

export type WordInput = {
  text: string
  author: string
  memo: string
}

// 言葉の入力値を検証する純関数。問題なければ null、違反時は日本語エラーメッセージを返す。
export function validateWord(input: WordInput): string | null {
  if (!input.text) return '言葉は必須です'
  if (input.text.length > WORD_LIMITS.text) {
    return `言葉は${WORD_LIMITS.text}文字以内で入力してください`
  }
  if (input.author.length > WORD_LIMITS.author) {
    return `出典・作者は${WORD_LIMITS.author}文字以内で入力してください`
  }
  if (input.memo.length > WORD_LIMITS.memo) {
    return `メモは${WORD_LIMITS.memo}文字以内で入力してください`
  }
  return null
}
