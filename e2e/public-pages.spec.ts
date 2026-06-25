import { test, expect } from '@playwright/test'

// 認証・DB を必要としない公開ページのスモークテスト。
// レンダリング崩れ・ビルド破損・ルーティングのリグレッションを検出する。

test('ログインページが表示される', async ({ page }) => {
  await page.goto('/auth/login')
  await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()
  await expect(page.getByLabel(/メール/)).toBeVisible()
})

test('新規登録ページが表示される', async ({ page }) => {
  await page.goto('/auth/register')
  await expect(page.getByRole('heading', { name: 'アカウント作成' })).toBeVisible()
})

test('パスワードリセットページが表示される', async ({ page }) => {
  await page.goto('/auth/forgot-password')
  await expect(page.getByLabel(/メール/)).toBeVisible()
})

test('お試しモードが未認証で表示される', async ({ page }) => {
  await page.goto('/try')
  // localStorage 駆動のお試し UI。サンプルの言葉が表示される。
  await expect(page.getByText('中心銘').first()).toBeVisible()
})

test('未認証でトップにアクセスするとログインへリダイレクトされる', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/auth\/login/)
})
