'use client'

import { useState, useCallback, useEffect } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', reject)
    image.src = url
  })
}

async function getCroppedBlob(src: string, area: Area): Promise<Blob> {
  const image = await createImage(src)
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas context unavailable')
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('crop failed'))),
      'image/jpeg',
      0.9,
    )
  })
}

type Props = {
  src: string
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

export default function AvatarCropDialog({ src, onConfirm, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [areaPixels, setAreaPixels] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  const onCropComplete = useCallback((_: Area, area: Area) => setAreaPixels(area), [])

  async function handleApply() {
    if (!areaPixels) return
    setBusy(true)
    try {
      const blob = await getCroppedBlob(src, areaPixels)
      onConfirm(blob)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        className="bg-bg-card border border-border rounded-lg shadow-[0_8px_32px_var(--shadow-lg)] max-w-sm w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="画像を調整"
      >
        <p className="text-sm font-medium text-ink mb-4">画像を調整</p>
        <div className="relative w-full h-64 rounded overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="flex items-center gap-3 mt-4">
          <span className="text-xs text-ink-faint shrink-0">縮小</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
            style={{ accentColor: 'var(--accent)' }}
            aria-label="ズーム"
          />
          <span className="text-xs text-ink-faint shrink-0">拡大</span>
        </div>
        <p className="text-xs text-ink-faint leading-[1.7] mt-3">
          ドラッグで位置、スライダー（またはピンチ・ホイール）でズームを調整できます。
        </p>
        <div className="flex justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 text-sm text-ink-light border border-border rounded hover:border-border-strong hover:text-ink transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={busy}
            className="px-5 py-2 text-sm font-medium text-white rounded bg-accent hover:bg-accent-light transition-colors disabled:opacity-40"
          >
            {busy ? '処理中...' : '適用'}
          </button>
        </div>
      </div>
    </div>
  )
}
