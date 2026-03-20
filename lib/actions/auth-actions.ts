'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

function toUserMessage(error: { message: string }): string {
  const msg = error.message
  if (
    msg.includes('Unexpected token') ||
    msg.includes('DOCTYPE') ||
    msg.includes('Failed to fetch') ||
    msg.includes('fetch failed') ||
    msg.includes('NetworkError')
  ) {
    return 'Supabaseサーバーに接続できません。しばらく待ってから再度お試しください。（管理者: Supabaseプロジェクトの停止または環境変数をご確認ください）'
  }
  return msg
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

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
