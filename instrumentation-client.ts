// クライアント(ブラウザ)の Sentry 初期化。
// DSN 未設定時は enabled:false で完全に無効。
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn,
  enabled: !!dsn,
  tracesSampleRate: 0.1,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
})

// App Router のクライアント側ナビゲーション計測に必要
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
