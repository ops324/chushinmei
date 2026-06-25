'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

const CONNECTION_ERROR_MSG =
  'サーバーに接続できません。しばらく待ってから再度お試しください。（管理者: Supabaseプロジェクトの停止または環境変数をご確認ください）'

// Supabase エラーメッセージ → 日本語変換マップ（部分一致キー）
const ERROR_MESSAGE_MAP: Record<string, string> = {
  'Invalid login credentials': 'メールアドレスまたはパスワードが正しくありません',
  'Email not confirmed': 'メールアドレスが確認されていません。確認メールをご確認ください',
  'User already registered': 'このメールアドレスは既に登録されています',
  'Password should be at least': 'パスワードは6文字以上で入力してください',
  'Invalid email': '有効なメールアドレスを入力してください',
  'Signup requires a valid password': 'パスワードを入力してください',
  'Email link is invalid or has expired': 'メールリンクが無効または期限切れです',
  'Token has expired or is invalid': '認証トークンが無効または期限切れです。再度お試しください',
  'For security purposes': 'セキュリティ保護のため、しばらく待ってから再度お試しください',
  'Email rate limit exceeded': 'メール送信の上限に達しました。しばらく待ってから再度お試しください',
  'Auth session missing': 'セッションが無効です。パスワードリセットのメールを再度送信してください',
  'not authenticated': '認証されていません。再度ログインしてください',
  'JWT expired': 'セッションが期限切れです。再度ログインしてください',
}

function toUserMessage(error: { message?: string; status?: number }): string {
  const msg = error.message ?? ''
  // ステータスコード 5xx は接続・サーバーエラー
  if (error.status && error.status >= 500) return CONNECTION_ERROR_MSG
  // 既知のエラーメッセージを日本語に変換（大文字小文字を無視）
  const msgLower = msg.toLowerCase()
  for (const [key, jaMsg] of Object.entries(ERROR_MESSAGE_MAP)) {
    if (msgLower.includes(key.toLowerCase())) return jaMsg
  }
  // それ以外（{}、DOCTYPE、Unexpected token 等）はすべて接続エラーとして扱う
  // 未分類のエラーはサーバーログに残し、本番でバグが不可視にならないようにする
  console.error('[auth] 未分類エラー:', error.status ?? '-', msg)
  return CONNECTION_ERROR_MSG
}

export async function login(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  let supabase
  try {
    supabase = await createClient()
  } catch (e) {
    return { error: toUserMessage({ message: String(e) }) }
  }

  let result
  try {
    result = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })
  } catch (e) {
    return { error: toUserMessage({ message: e instanceof Error ? e.message : String(e) }) }
  }

  if (result.error) return { error: toUserMessage(result.error) }
  redirect('/')
}

export async function register(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  let supabase
  try {
    supabase = await createClient()
  } catch (e) {
    return { error: toUserMessage({ message: String(e) }) }
  }

  const email = formData.get('email') as string

  let result
  try {
    result = await supabase.auth.signUp({
      email,
      password: formData.get('password') as string,
      options: {
        data: { full_name: formData.get('display_name') as string },
      },
    })
  } catch (e) {
    return { error: toUserMessage({ message: e instanceof Error ? e.message : String(e) }) }
  }

  if (result.error) return { error: toUserMessage(result.error) }

  // メール確認ON環境では signUp 時点でセッションが張られない。その場合トップへ飛ばすと
  // proxy で /auth/login に弾かれ、ユーザーは無言でログイン画面に戻されてしまう。
  // セッションが無ければリダイレクトせず、確認メールの案内を表示する。
  if (!result.data.session) {
    return {
      success: `「中心銘」から ${email} に確認メールを送信しました。メール内のリンクをクリックすると登録が完了します。`,
    }
  }
  redirect('/')
}

// Google OAuth は現在UIを非表示にしているため未使用だが、再有効化時に使うため残している
export async function loginWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  const redirectTo = `${protocol}://${host}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })

  if (error || !data.url) throw new Error(error?.message ?? 'OAuth error')
  redirect(data.url)
}

export async function resetPassword(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  let supabase
  try {
    supabase = await createClient()
  } catch (e) {
    return { error: toUserMessage({ message: String(e) }) }
  }

  const email = formData.get('email') as string

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${await getOrigin()}/auth/callback?next=/auth/update-password`,
    })
    if (error) return { error: toUserMessage(error) }
  } catch (e) {
    return { error: toUserMessage({ message: e instanceof Error ? e.message : String(e) }) }
  }

  return { success: 'パスワードリセット用のメールを送信しました。メールをご確認ください。' }
}

export async function updatePassword(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  const password = formData.get('password') as string
  const passwordConfirm = formData.get('password_confirm') as string

  if (password !== passwordConfirm) {
    return { error: 'パスワードが一致しません' }
  }

  let supabase
  try {
    supabase = await createClient()
  } catch (e) {
    return { error: toUserMessage({ message: String(e) }) }
  }

  // セッションが存在するか確認
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'セッションが無効です。パスワードリセットのメールを再度送信してください。' }
  }

  try {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { error: toUserMessage(error) }
  } catch (e) {
    return { error: toUserMessage({ message: e instanceof Error ? e.message : String(e) }) }
  }

  redirect('/')
}

async function getOrigin(): Promise<string> {
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function updateDisplayName(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  const displayName = ((formData.get('display_name') as string | null) ?? '').trim()
  if (!displayName) return { error: '表示名を入力してください' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証されていません。再度ログインしてください' }

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, display_name: displayName })
  if (error) return { error: toUserMessage(error) }

  revalidatePath('/account')
  revalidatePath('/')
  return { success: '表示名を更新しました' }
}

export async function updateEmail(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  const email = ((formData.get('email') as string | null) ?? '').trim()
  if (!email) return { error: 'メールアドレスを入力してください' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証されていません。再度ログインしてください' }
  if (email === user.email) return { error: '現在のメールアドレスと同じです' }

  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: `${await getOrigin()}/auth/callback?next=/account` }
  )
  if (error) return { error: toUserMessage(error) }

  return { success: `${email} に確認メールを送信しました。メール内のリンクをクリックすると変更が完了します。` }
}

export async function changePassword(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  const currentPassword = formData.get('current_password') as string
  const password = formData.get('password') as string
  const passwordConfirm = formData.get('password_confirm') as string

  if (!currentPassword || !password) return { error: 'パスワードを入力してください' }
  if (password !== passwordConfirm) return { error: '新しいパスワードが一致しません' }
  if (password.length < 6) return { error: 'パスワードは6文字以上で入力してください' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: '認証されていません。再度ログインしてください' }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (verifyError) return { error: '現在のパスワードが正しくありません' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: toUserMessage(error) }

  return { success: 'パスワードを変更しました' }
}

export async function deleteAccount(): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証されていません。再度ログインしてください' }

  const { error } = await supabase.rpc('delete_own_account')
  if (error) return { error: toUserMessage(error) }

  await supabase.auth.signOut()
  redirect('/auth/login')
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
// SVG（image/svg+xml）は実行可能マークアップを含められ、avatars は公開バケットのため
// 直リンクでスクリプトが評価される恐れがある。ラスタ画像のみをホワイトリストで許可する。
// （クライアントのクロップは常に image/jpeg を出力する。）
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function updateAvatar(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  const file = formData.get('avatar') as File | null
  if (!file || file.size === 0) return { error: '画像を選択してください' }
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return { error: 'JPEG / PNG / WebP / GIF の画像を選択してください' }
  }
  if (file.size > MAX_AVATAR_BYTES) return { error: '画像は2MB以下にしてください' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証されていません。再度ログインしてください' }

  const path = `${user.id}/avatar`
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) return { error: toUserMessage(uploadError) }

  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path)
  const avatarUrl = `${pub.publicUrl}?v=${Date.now()}`

  const { error } = await supabase.from('profiles').upsert({ id: user.id, avatar_url: avatarUrl })
  if (error) return { error: toUserMessage(error) }

  revalidatePath('/account')
  revalidatePath('/')
  return { success: 'アイコン画像を更新しました' }
}

export async function removeAvatar(): Promise<{ error?: string; success?: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証されていません。再度ログインしてください' }

  await supabase.storage.from('avatars').remove([`${user.id}/avatar`])

  const { error } = await supabase.from('profiles').upsert({ id: user.id, avatar_url: null })
  if (error) return { error: toUserMessage(error) }

  revalidatePath('/account')
  revalidatePath('/')
  return { success: 'アイコン画像を削除しました' }
}
