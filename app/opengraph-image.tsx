import { ImageResponse } from 'next/og'

// 共有時のOGPカード。ブランドシンボル（墨の角枠＋朱の一点）＋ワードマーク＋タグライン。BRAND.md §9/§11
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = '中心銘 — 大切な言葉を、手元に。'

// 明朝の日本語を Satori で描くため、使用文字だけをサブセットした TTF を取得する。
// Google Fonts は古い User-Agent には woff2 でなく ttf を返す（Satori は woff2 非対応）。
async function loadSerif(): Promise<ArrayBuffer | null> {
  const text = '中心銘大切な言葉を、手元に。'
  const api =
    'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@600&text=' +
    encodeURIComponent(text)
  try {
    const css = await (
      await fetch(api, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; rv:10.0) Gecko/20100101 Firefox/10.0',
        },
      })
    ).text()
    const url = css.match(/src:\s*url\((.+?)\)/)?.[1]
    if (!url) return null
    return await (await fetch(url)).arrayBuffer()
  } catch {
    return null
  }
}

export default async function OpengraphImage() {
  const serif = await loadSerif()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0ebe0',
          fontFamily: serif ? 'Noto Serif JP' : 'serif',
        }}
      >
        {/* 上部のnavyアクセントバー（アプリと共通の所作） */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            background: '#1e3654',
          }}
        />
        {/* ブランドシンボル */}
        <div
          style={{
            width: 120,
            height: 120,
            border: '9px solid #1c1916',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 56,
          }}
        >
          <div style={{ width: 34, height: 34, background: '#c8442a', borderRadius: 6 }} />
        </div>
        {/* ワードマーク */}
        <div
          style={{
            fontSize: 104,
            fontWeight: 600,
            color: '#1c1916',
            letterSpacing: 24,
            paddingLeft: 24,
            display: 'flex',
          }}
        >
          中心銘
        </div>
        {/* タグライン */}
        <div
          style={{
            fontSize: 34,
            color: '#6a6058',
            letterSpacing: 6,
            marginTop: 28,
            display: 'flex',
          }}
        >
          大切な言葉を、手元に。
        </div>
      </div>
    ),
    {
      ...size,
      fonts: serif
        ? [{ name: 'Noto Serif JP', data: serif, style: 'normal', weight: 600 }]
        : [],
    }
  )
}
