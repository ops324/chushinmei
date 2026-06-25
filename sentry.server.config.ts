// サーバー(Node.js)ランタイムの Sentry 初期化。
// DSN 未設定時は enabled:false で完全に無効（ビルド・実行に影響しない）。
import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn,
  enabled: !!dsn,
  tracesSampleRate: 0.1,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
})
