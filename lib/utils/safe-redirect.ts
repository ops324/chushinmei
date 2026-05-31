// オープンリダイレクト対策。内部の絶対パス（"/" 始まり）のみ許可し、
// "//host" や "/\host" のようなスキーム相対 URL、外部 URL は "/" に丸める。
export function safeNext(next: string | null | undefined): string {
  if (!next) return '/'
  if (!next.startsWith('/')) return '/'
  // 2文字目が "/" または "\" の場合はスキーム相対 URL とみなして拒否
  if (next.length > 1 && (next[1] === '/' || next[1] === '\\')) return '/'
  return next
}
