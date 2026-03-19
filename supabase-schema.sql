-- ============================================================
-- 中心銘 Supabaseスキーマ
-- Supabase SQL Editorでこのスクリプトを実行してください
-- ============================================================

-- プロファイル（auth.usersの拡張）
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 言葉テーブル
CREATE TABLE public.words (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  author     TEXT DEFAULT '',
  memo       TEXT DEFAULT '',
  is_public  BOOLEAN DEFAULT false NOT NULL,
  share_id   TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS有効化
ALTER TABLE public.words    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- words のRLSポリシー
CREATE POLICY "own_words_all" ON public.words
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "public_words_select" ON public.words
  FOR SELECT USING (is_public = true);

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
