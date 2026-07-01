import { createClient } from '@supabase/supabase-js'

// キープアライブ兼ヘルスチェック用エンドポイント。
// GitHub Actions の cron（.github/workflows/keepalive.yml）から数日おきに叩かれ、
// 実際に Supabase DB へ軽量クエリを投げることで「7日間非アクティブでの自動一時停止」を防ぎつつ、
// アプリ→DB の接続が正常かを確認する。
//
// Route Handler は既定でキャッシュされないが、毎回必ずリクエスト時に実行されることを明示する。
export const dynamic = 'force-dynamic'

export async function GET() {
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
