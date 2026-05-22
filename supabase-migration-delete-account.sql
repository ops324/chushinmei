-- ============================================================
-- 中心銘 マイグレーション: 本人によるアカウント削除機能
-- 既存のSupabaseプロジェクトに対し、Supabase SQL Editor で一度だけ実行してください。
-- （アカウント削除ボタンはこの関数が無いと動作しません）
--
-- words.user_id / profiles.id は auth.users(id) を ON DELETE CASCADE 参照しているため、
-- auth.users の行を削除すると、そのユーザーの言葉・プロフィールも自動的に削除されます。
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM auth.users WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
