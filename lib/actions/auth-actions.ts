'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

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
    result = await supabase.auth.signUp({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      options: {
        data: { full_name: formData.get('display_name') as string },
      },
    })
  } catch (e) {
    return { error: toUserMessage({ message: e instanceof Error ? e.message : String(e) }) }
  }

  if (result.error) return { error: toUserMessage(result.error) }
  redirect('/')
}

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
