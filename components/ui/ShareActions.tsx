'use client'

import { useState, useSyncExternalStore } from 'react'
import { copyText, snsShareLinks } from '@/lib/utils/share'

const noopSubscribe = () => () => {}

type Props = {
  url: string
}

const rowClass =
  'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink rounded border border-border hover:border-border-strong hover:bg-bg-surface transition-colors text-left'

export default function ShareActions({ url }: Props) {
  const [copied, setCopied] = useState(false)
  const canNativeShare = useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator !== 'undefined' && typeof navigator.share === 'function',
    () => false,
  )

  const links = snsShareLinks(url)

  function openWindow(href: string) {
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title: '中心銘', url })
    } catch {
      // ユーザーがキャンセルした場合などは無視
    }
  }

  async function handleCopy() {
    const ok = await copyText(url)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {canNativeShare && (
        <button type="button" onClick={handleNativeShare} className={rowClass}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          その他のアプリで共有
        </button>
      )}

      <button type="button" onClick={() => openWindow(links.x)} className={rowClass}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Xでシェア
      </button>

      <button type="button" onClick={() => openWindow(links.line)} className={rowClass}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738S0 4.935 0 10.304c0 4.814 4.27 8.846 10.035 9.608.39.084.922.258 1.057.592.121.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967C23.176 14.392 24 12.458 24 10.304zM7.7 13.31H5.31a.634.634 0 01-.633-.633V7.898a.634.634 0 011.267 0v4.146H7.7a.633.633 0 010 1.266zm2.484-.633a.634.634 0 01-1.267 0V7.898a.634.634 0 011.267 0zm5.738 0a.634.634 0 01-.434.601.66.66 0 01-.199.032.628.628 0 01-.512-.252l-2.448-3.33v2.949a.633.633 0 11-1.266 0V7.898a.632.632 0 01.433-.6.605.605 0 01.199-.033c.197 0 .381.099.510.258l2.45 3.327V7.898a.634.634 0 011.267 0zm3.86-2.704a.633.633 0 010 1.266h-1.757v1.13h1.757a.633.633 0 010 1.265h-2.39a.634.634 0 01-.633-.633V7.898a.634.634 0 01.633-.634h2.39a.634.634 0 010 1.267h-1.757v1.13z" />
        </svg>
        LINEでシェア
      </button>

      <button type="button" onClick={() => openWindow(links.facebook)} className={rowClass}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Facebookでシェア
      </button>

      <button type="button" onClick={handleCopy} className={rowClass}>
        {copied ? (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
        {copied ? 'コピーしました' : 'URLをコピー'}
      </button>
    </div>
  )
}
