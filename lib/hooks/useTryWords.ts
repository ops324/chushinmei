'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  loadForTrial,
  persist,
  createWord,
  type TryWord,
} from '@/lib/utils/try-store'
import type { WordInput } from '@/lib/utils/word-validation'

// try-store（localStorage）を React の state に橋渡しする hook。
// SSR とのハイドレーション不一致を避けるため、初回読み込みは useEffect 内で行う。
export function useTryWords() {
  const [words, setWords] = useState<TryWord[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // localStorage はクライアント専用のため、初回読み込みは effect 内で行う（SSR不一致回避）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWords(loadForTrial())
    setReady(true)
  }, [])

  const add = useCallback((input: WordInput) => {
    setWords(prev => {
      const next = [createWord(input), ...prev]
      persist(next)
      return next
    })
  }, [])

  const update = useCallback((id: string, input: WordInput) => {
    setWords(prev => {
      const next = prev.map(w =>
        w.id === id
          ? { ...w, text: input.text.trim(), author: input.author.trim(), memo: input.memo.trim() }
          : w
      )
      persist(next)
      return next
    })
  }, [])

  const remove = useCallback((id: string) => {
    setWords(prev => {
      const next = prev.filter(w => w.id !== id)
      persist(next)
      return next
    })
  }, [])

  return { words, ready, add, update, remove }
}
