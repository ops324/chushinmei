-- ============================================================
-- 中心銘 マイグレーション: words の入力長 CHECK 制約を追加
-- 既存プロジェクトに一度だけ実行してください（新規 setup は supabase-schema.sql に含む）。
-- アプリ側（lib/utils/word-validation.ts）と同じ上限を DB でも担保する多層防御。
-- 冪等: IF NOT EXISTS で再実行しても安全。
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'words_text_len'
  ) THEN
    ALTER TABLE public.words
      ADD CONSTRAINT words_text_len CHECK (char_length(text) BETWEEN 1 AND 2000);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'words_author_len'
  ) THEN
    ALTER TABLE public.words
      ADD CONSTRAINT words_author_len CHECK (char_length(author) <= 200);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'words_memo_len'
  ) THEN
    ALTER TABLE public.words
      ADD CONSTRAINT words_memo_len CHECK (char_length(memo) <= 2000);
  END IF;
END $$;
