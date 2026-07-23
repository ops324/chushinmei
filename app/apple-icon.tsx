import { ImageResponse } from 'next/og'

// ブランドシンボル: 墨の角枠の中心に朱の一点（中心＝core／朱＝銘）。BRAND.md §9
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0ebe0',
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            border: '7px solid #1c1916',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: 28, height: 28, background: '#c8442a', borderRadius: 5 }} />
        </div>
      </div>
    ),
    { ...size }
  )
}
