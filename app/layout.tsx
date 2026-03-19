import type { Metadata } from 'next'
import { Noto_Serif_JP } from 'next/font/google'
import { ToastProvider } from '@/components/ui/Toast'
import './globals.css'

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: '中心銘',
  description: '大切な言葉を、手元に。',
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
