import { createClient } from '@supabase/supabase-js'

// キープアライブ兼ヘルスチェック用エンドポイント。
// Vercel Cron（vercel.json の crons 定義）から 1 日 1 回叩かれ、
// 実際に Supabase DB へ軽量クエリを投げることで「7日間非アクティブでの自動一時停止」を防ぎつつ、
// アプリ→DB の接続が正常かを確認する。
//
// Route Handler は既定でキャッシュされないが、毎回必ずリクエスト時に実行されることを明示する。
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // CRON_SECRET が設定されている場合は、Vercel Cron が自動付与する
  // `Authorization: Bearer <CRON_SECRET>` ヘッダを検証し、外部からの無認証アクセスを弾く。
  // 未設定の環境（ローカル/プレビュー等）では検証をスキップして従来どおり動作させる。
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return Response.json({ status: 'error' }, { status: 401 })
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return Response.json(
      { status: 'error', db: 'error' },
      { status: 503 }
    )
  }

  // セッション不要のため、cookie 配線のない匿名クライアントを直接生成する。
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // anon に EXECUTE 付与済みの公開 RPC を叩く（該当 share_id なしで空を返すがエラーにはならず、
  // 必ず DB 関数が実行される = 実際の DB ラウンドトリップ）。テーブル直 SELECT は anon に
  // 与えられていないため、この RPC が唯一の匿名で実行できる DB クエリ。
  const { error } = await supabase.rpc('get_shared_word', {
    p_share_id: '__healthcheck__',
  })

  if (error) {
    // 詳細（キー・接続文字列・スタックトレース）は返さず、状態のみ返す。
    return Response.json(
      { status: 'error', db: 'error' },
      { status: 503 }
    )
  }

  return Response.json({
    status: 'ok',
    db: 'ok',
    timestamp: new Date().toISOString(),
  })
}
