import type { TryWord } from '@/lib/utils/try-store'

// お試しページの初回表示時にプリセットされるサンプル名言。
// 出典が明確な公有（パブリックドメイン）の言葉のみを使う。
// id / created_at は seed 時に try-store 側で付与するため、ここでは本文のみ定義する。
export const SAMPLE_WORDS: Pick<TryWord, 'text' | 'author' | 'memo'>[] = [
  {
    text: '足るを知る者は富む',
    author: '老子（道徳経）',
    memo: '本当の豊かさとは何か。立ち止まって考えたい言葉。',
  },
  {
    text: '千里の道も一歩より始まる',
    author: '老子（道徳経）',
    memo: '',
  },
  {
    text: '過ちて改めざる、是を過ちと謂う',
    author: '論語（孔子）',
    memo: '失敗そのものより、向き合わないことが過ちだという戒め。',
  },
]
