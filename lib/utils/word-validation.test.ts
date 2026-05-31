import { describe, it, expect } from 'vitest'
import { validateWord, WORD_LIMITS } from './word-validation'

const base = { text: '言葉', author: '', memo: '' }

describe('validateWord', () => {
  it('正常な入力は null を返す', () => {
    expect(validateWord(base)).toBeNull()
  })

  it('text が空ならエラー', () => {
    expect(validateWord({ ...base, text: '' })).toBe('言葉は必須です')
  })

  it('text が上限ちょうどは許可', () => {
    expect(validateWord({ ...base, text: 'あ'.repeat(WORD_LIMITS.text) })).toBeNull()
  })

  it('text が上限超過はエラー', () => {
    expect(validateWord({ ...base, text: 'あ'.repeat(WORD_LIMITS.text + 1) })).toMatch(/言葉は/)
  })

  it('author が上限超過はエラー', () => {
    expect(validateWord({ ...base, author: 'あ'.repeat(WORD_LIMITS.author + 1) })).toMatch(/出典/)
  })

  it('memo が上限超過はエラー', () => {
    expect(validateWord({ ...base, memo: 'あ'.repeat(WORD_LIMITS.memo + 1) })).toMatch(/メモ/)
  })
})
