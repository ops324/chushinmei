import type { Metadata } from 'next'
import { Noto_Serif_JP } from 'next/font/google'
import { ToastProvider } from '@/components/ui/Toast'
import './globals.css'

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
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
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '中心銘',
    description: '大切な言葉を、手元に。',
    images: ['/og.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={`${notoSerifJP.className} h-full`}>
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
