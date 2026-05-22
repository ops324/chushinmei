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
- **SNS シェア** — X・LINE・Facebook への投稿、OS 標準の共有シート（モバイル）、URL コピー（非セキュア環境向けフォールバック付き）に対応。自分の一覧と公開ページの双方から共有可能
- **楽観的 UI** — 削除を即座に反映し体感速度を向上

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | Next.js 16（App Router）, React 19, TypeScript |
| スタイリング | Tailwind CSS 4, Noto Serif JP（Google Fonts） |
| バックエンド | Supabase（PostgreSQL + Auth + Row Level Security） |
| 認証 | Supabase Auth（Email / Password） |
| デプロイ | Vercel |

## 設計のポイント

- **Server Components / Server Actions** を中心に構成し、データ取得はサーバー、対話部分のみ Client Component に分離
- **Row Level Security（RLS）** に加え、各 Server Action 内でも認証・所有者チェックを行う多層防御
- **`proxy.ts`**（Next.js 16 で `middleware.ts` から改名された規約）でセッション更新と未認証リダイレクトを実装
- **日付ベースのハッシュ** で「今日の言葉」を同一ユーザー・同一日には同じ結果に
- **OGP メタデータ動的生成** で共有リンクの SNS プレビューに言葉と作者を表示

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

## デプロイ

[Vercel](https://vercel.com) にインポートし、環境変数（`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`）を設定するだけでデプロイできます。Supabase 側の Site URL / Redirect URLs に本番 URL を追加するのを忘れずに。

## 補足

- Google OAuth はコード上に実装済みですが、現在は UI を非表示にしています（再有効化時は `lib/actions/auth-actions.ts` の `loginWithGoogle` とログイン画面のボタンを復帰）。
