'use client'

import { useSyncExternalStore } from 'react'
import ShareActions from '@/components/ui/ShareActions'

const noopSubscribe = () => () => {}

export default function PublicShare() {
  const url = useSyncExternalStore(
    noopSubscribe,
    () => window.location.href,
    () => '',
  )

  if (!url) return null

  return (
    <div className="mt-8 w-full max-w-lg">
      <p className="text-[10px] tracking-[0.3em] text-ink-faint mb-3 uppercase text-center">Share</p>
      <ShareActions url={url} />
    </div>
  )
}
