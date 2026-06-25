-- ============================================================
-- 中心銘 マイグレーション: 共有言葉の取得を RPC 経由に限定
--
-- 【背景】
-- 従来は `GRANT SELECT ON public.words TO anon` ＋ RLS ポリシー
-- `public_words_select (is_public = true)` により、未認証ユーザーが
-- Data API で `GET /rest/v1/words?is_public=eq.true` を直接叩くと、
-- share_id を知らなくても全ユーザーの公開言葉を一括列挙できてしまった。
-- これは「個別の固有 URL（/shared/[shareId]）でのみ共有する」という
-- 設計意図と乖離していた。
--
-- 【対策】
-- anon のテーブル直アクセスを撤廃し、share_id を指定した 1 行のみを
-- 返す SECURITY DEFINER 関数 get_shared_word() 経由に限定する。
--
-- 既存プロジェクトには SQL Editor でこのスクリプトを一度だけ実行してください。
-- （新規セットアップは supabase-schema.sql に同等の定義が含まれます）
-- ============================================================

-- share_id 指定で公開言葉を 1 行だけ返す関数（列挙不可）
CREATE OR REPLACE FUNCTION public.get_shared_word(p_share_id text)
RETURNS TABLE (text text, author text, created_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT w.text, w.author, w.created_at
  FROM public.words w
  WHERE w.share_id = p_share_id
    AND w.is_public = true
  LIMIT 1;
$$;

REVOKE ALL     ON FUNCTION public.get_shared_word(text) FROM public;
GRANT  EXECUTE ON FUNCTION public.get_shared_word(text) TO anon, authenticated;

-- anon のテーブル直アクセスと公開列挙ポリシーを撤廃
REVOKE SELECT ON public.words FROM anon;
DROP POLICY IF EXISTS "public_words_select" ON public.words;
