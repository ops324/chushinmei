// Next.js のサーバー計測フック。ランタイムに応じて Sentry 設定を読み込む。
import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// Server Components / Route Handlers / Server Actions のエラーを捕捉
export const onRequestError = Sentry.captureRequestError
