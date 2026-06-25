-- ============================================================
-- 中心銘 Supabaseスキーマ
-- Supabase SQL Editorでこのスクリプトを実行してください
--
-- 【注意】テーブルを新規追加する際は必ずGRANT文を含めること
-- 2026-05-30以降、publicスキーマの新規テーブルはGRANTなしでは
-- Data API（supabase-js / PostgREST）からアクセス不可になる
-- 例:
--   GRANT SELECT ON public.your_table TO anon;
--   GRANT SELECT, INSERT, UPDATE, DELETE ON public.your_table TO authenticated;
--   GRANT SELECT, INSERT, UPDATE, DELETE ON public.your_table TO service_role;
-- ============================================================

-- プロファイル（auth.usersの拡張）
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 言葉テーブル
CREATE TABLE public.words (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text       TEXT NOT NULL CHECK (char_length(text) BETWEEN 1 AND 2000),
  author     TEXT DEFAULT '' CHECK (char_length(author) <= 200),
  memo       TEXT DEFAULT '' CHECK (char_length(memo) <= 2000),
  is_public  BOOLEAN DEFAULT false NOT NULL,
  share_id   TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Data API アクセス権付与（PostgREST / supabase-js 用）
-- words: ログイン済みユーザーは自分の言葉をCRUD可。未ログインユーザーには
-- テーブル直アクセスを与えず、共有は get_shared_word() RPC（後述）経由に限定する
-- （anon に SELECT を与えると is_public=true の全件を列挙できてしまうため）。
GRANT SELECT, INSERT, UPDATE, DELETE ON public.words  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.words  TO service_role;

-- profiles: ログイン済みユーザーのみCRUD可
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO service_role;

-- RLS有効化
ALTER TABLE public.words    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- words のRLSポリシー（自分の言葉のみCRUD可）
-- 公開言葉の閲覧は anon への直SELECTを与えず、get_shared_word() RPC で
-- share_id 指定の1行のみ返す方式に限定する（全件列挙の防止）。
CREATE POLICY "own_words_all" ON public.words
  FOR ALL USING (auth.uid() = user_id);

-- share_id 指定で公開言葉を1行だけ返す関数（未認証でも閲覧可だが列挙不可）
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

-- profiles のRLSポリシー
CREATE POLICY "own_profile_all" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- ユーザー作成時にprofileを自動生成
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles(id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 本人によるアカウント削除（words / profiles は ON DELETE CASCADE で連動削除）
-- authenticated ロールから自分自身の auth.users 行のみ削除できるようにする
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

-- プロフィール画像（アバター）用ストレージ
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatars_public_read"  ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_delete" ON storage.objects;

CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
