# 中心銘（ちゅうしんめい）

> 大切な言葉を、手元に。

読書や日常で出会った心に響く言葉を、出典やメモとともに記録・整理し、毎日ランダムに振り返れるパーソナル名言管理アプリです。「今日の言葉」で過去に記した言葉と再会でき、OGP対応の共有リンクで大切な言葉を誰かに贈ることもできます。和紙のような温かみのあるデザインで、言葉と静かに向き合う体験を提供します。

## スクリーンショット

| メイン画面 | 共有ページ | ログイン |
|:---:|:---:|:---:|
| ![メイン画面](portfolio-screenshots/01_main_full.png) | ![共有ページ](portfolio-screenshots/02_shared_page.png) | ![ログイン](portfolio-screenshots/03_login.png) |

## 主な機能

- **言葉の記録** — テキスト・出典/作者・メモを添えて CRUD 管理（カード上でインライン編集）
- **今日の言葉** — 日替わりでランダムに1つを表示。「くじを引く」でシャッフルも可能
- **検索** — 言葉・出典・メモを横断してリアルタイム絞り込み
- **共有リンク** — 個別の言葉を OGP 付きの固有 URL（`/shared/[shareId]`）で公開
- **SNS シェア** — X・LINE・Facebook への投稿、OS 標準の共有シート（モバイル）、URL コピー（非セキュア環境向けフォールバック付き）に対応。自分の一覧と公開ページの双方から共有可能。引用文の二重表示を避けるため共有メッセージ本文は URL のみとし、言葉・出典は OGP カードに集約
- **OGP カード画像** — シェア時に SNS のプレビューへ和紙基調のブランドカード画像（`og:image` / Twitter `summary_large_image`）を表示し、`og:title` / `og:description` に言葉・出典を掲載
- **アカウント設定** — 右上のアカウントメニューから設定ページ（`/account`）へ遷移し、表示名・メールアドレス・パスワードの変更、アカウント削除を操作可能。ログアウトはメニューに集約
- **プロフィール画像** — アカウント設定からアイコン画像をアップロード・差し替え・削除（Supabase Storage の `avatars` バケットに保存）。アップロード時にズーム・位置を調整して円形に切り抜き可能（`react-easy-crop`）。未設定時は表示名の頭文字を表示
- **楽観的 UI / 読み込みスケルトン** — 削除を即座に反映し体感速度を向上。サーバー応答待ちの間は `app/loading.tsx` のスケルトンを即時表示し、画面が真っ白になる時間をゼロに

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | Next.js 16（App Router）, React 19, TypeScript |
| スタイリング | Tailwind CSS 4, Noto Serif JP（Google Fonts） |
| バックエンド | Supabase（PostgreSQL + Auth + Storage + Row Level Security） |
| 認証 | Supabase Auth（Email / Password） |
| 画像クロップ | react-easy-crop（クライアント側で円形クロップ・ズーム） |
| デプロイ | Vercel |

## 設計のポイント

- **Server Components / Server Actions** を中心に構成し、データ取得はサーバー、対話部分のみ Client Component に分離
- **Row Level Security（RLS）** に加え、各 Server Action 内でも認証・所有者チェックを行う多層防御。DB 書き込みは戻り値の `error` を必ず検査し、失敗を握り潰さずユーザーへ通知
- **入力バリデーション** — 言葉の文字数上限を純関数（`lib/utils/word-validation.ts`）に切り出してアプリ側で検証しつつ、DB の `CHECK` 制約でも同じ上限を担保。純関数は Vitest で単体テスト済み
- **`proxy.ts`**（Next.js 16 で `middleware.ts` から改名された規約）でセッション更新と未認証リダイレクトを実装。検証済みの `user.id` / `email` をリクエストヘッダ（`x-user-id` / `x-user-email`）で下流に渡し、page・Header での重複 `getUser()` を排除
- **初回表示の最適化** — トップページでは `words` と `profiles` を `Promise.all` で並列取得し、結果を Header に props で受け渡し（Header は同期 Server Component 化）。`app/loading.tsx` でスケルトンを即時表示し体感速度を向上
- **日付ベースのハッシュ** で「今日の言葉」を同一ユーザー・同一日には同じ結果に
- **OGP メタデータ動的生成** で共有リンクの SNS プレビューに言葉と作者を表示
- **アカウント管理** — ログアウト・設定への入口を右上メニューに集約（ヒューリスティック評価に基づく導線設計）。本人によるアカウント削除は `SECURITY DEFINER` 関数 `delete_own_account()` 経由で自分の行のみを削除し、`ON DELETE CASCADE` で言葉・プロフィールを連動削除
- **プロフィール画像** — クライアント側でズーム・位置調整して円形に切り抜き、512px に縮小して Supabase Storage（`avatars` バケット）へアップロード。ストレージの RLS で「閲覧は公開／書き込みは本人フォルダ（`{uid}/...`）のみ」を保証し、`profiles.avatar_url` に公開 URL を保存（キャッシュ無効化のため `?v=` を付与）
- **ブランドの一貫性** — ファビコン（`app/icon.png` / `apple-icon.png`）と共有用 OGP カード画像を、和紙色・明朝体・藍アクセントで統一

## セットアップ

### 1. 依存のインストール

```bash
npm install
```

### 2. Supabase プロジェクトの用意

[Supabase](https://supabase.com) でプロジェクトを作成し、`Project Settings > API` から URL と publishable（anon）キーを取得します。

### 3. 環境変数の設定

`.env.local.example` を `.env.local` にコピーして値を設定します。

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

### 4. データベーススキーマの適用

Supabase ダッシュボードの `SQL Editor` で [`supabase-schema.sql`](supabase-schema.sql) を実行します（テーブル・RLS ポリシー・プロファイル自動生成トリガーを作成）。

> 新しいテーブルを追加する際は、Data API（supabase-js / PostgREST）からアクセスするため必ず `GRANT` 文を含めてください（詳細はスキーマ冒頭のコメント参照）。

> アカウント削除機能には `delete_own_account()` 関数が必要です。`supabase-schema.sql` に含まれているため新規セットアップでは自動で作成されます。既存プロジェクトには [`supabase-migration-delete-account.sql`](supabase-migration-delete-account.sql) を一度だけ実行してください。

> プロフィール画像機能には `profiles.avatar_url` 列と `avatars` ストレージバケット（＋RLS）が必要です。新規セットアップは `supabase-schema.sql` に含まれます。既存プロジェクトには [`supabase-migration-avatar.sql`](supabase-migration-avatar.sql) を一度だけ実行してください。

> 言葉の入力長制限（`text` 1〜2000 / `author` ≤200 / `memo` ≤2000 文字）は新規セットアップでは `supabase-schema.sql` に含まれます。既存プロジェクトには [`supabase-migration-word-limits.sql`](supabase-migration-word-limits.sql) を一度だけ実行してください（アプリ側のバリデーションと同じ上限を DB でも担保する多層防御）。

### 5. パスワードリセット用メールテンプレートの設定

パスワードリセットは PKCE の code_verifier がメールリンク経由で失われる問題を避けるため、**token_hash 方式**を採用しています。Supabase ダッシュボードで以下を設定してください。

- `Authentication > URL Configuration`
  - **Site URL**: 開発時は `http://localhost:3000`、本番はデプロイ先 URL
  - **Redirect URLs**: `http://localhost:3000/**` および本番 URL の `/**` を許可
- `Authentication > Email Templates > Reset Password` のリンクを次の形式に変更

  ```html
  <a href="{{ .SiteURL }}/auth/update-password?token_hash={{ .TokenHash }}&type=recovery">
    パスワードを再設定する
  </a>
  ```

### 6. （任意）デモデータの投入

[`supabase-seed-demo.sql`](supabase-seed-demo.sql) 内の `YOUR_USER_ID` を実際の `auth.users` の UUID に置き換えてから SQL Editor で実行すると、サンプルの言葉が登録されます。

### 7. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開きます。

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm start` | 本番サーバー起動 |
| `npm run lint` | ESLint（フラット設定 / `eslint-config-next`）。Next.js 16 で `next lint` は廃止されたため ESLint CLI を直接使用 |
| `npm test` | Vitest による単体テスト（入力バリデーション・リダイレクト検証などの純関数） |

## デプロイ

[Vercel](https://vercel.com) にインポートし、環境変数（`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`）を設定するだけでデプロイできます。Supabase 側の Site URL / Redirect URLs に本番 URL を追加するのを忘れずに。

### パフォーマンス計測（任意）

Vercel ダッシュボードの **Speed Insights** を有効化すると、本番環境の Core Web Vitals（LCP / TTFB / CLS / INP）を継続的に計測できます。最適化の効果検証や、リージョン設定（必要なら Function Region を Supabase と同じリージョンに合わせる）の判断に有用です。

## 補足

- Google OAuth はコード上に実装済みですが、現在は UI を非表示にしています（再有効化時は `lib/actions/auth-actions.ts` の `loginWithGoogle` とログイン画面のボタンを復帰）。
