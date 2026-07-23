import type { Metadata } from 'next'
import { Noto_Serif_JP, Noto_Sans_JP } from 'next/font/google'
import { ToastProvider } from '@/components/ui/Toast'
import './globals.css'

// 明朝＝引用・ブランド（作品）／サンセリフ＝UI（情報）の役割分担（BRAND.md §9）
const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-noto-serif',
})

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-noto-sans',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chushinmei.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: '中心銘',
  description: '大切な言葉を、手元に。',
  openGraph: {
    title: '中心銘',
    description: '大切な言葉を、手元に。',
    siteName: '中心銘',
    type: 'website',
    locale: 'ja_JP',
    // og:image は app/opengraph-image.tsx が自動生成（ファイル規約）
  },
  twitter: {
    card: 'summary_large_image',
    title: '中心銘',
    description: '大切な言葉を、手元に。',
    // twitter:image も app/opengraph-image.tsx から自動付与
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={`${notoSerifJP.variable} ${notoSansJP.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
