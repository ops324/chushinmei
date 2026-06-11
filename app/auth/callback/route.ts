import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { safeNext } from '@/lib/utils/safe-redirect'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = safeNext(searchParams.get('next'))

  // メール確認（新規登録）のリンクは token_hash 方式。code（PKCE）と違い
  // code_verifier に依存しないため、別ブラウザ／スマホで開いても確実に検証できる。
  if (tokenHash && type) {
    const redirectUrl = `${origin}${next}`
    const response = NextResponse.redirect(redirectUrl)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (error) {
      return NextResponse.redirect(
        `${origin}/auth/login#error_code=otp_expired&error_description=${encodeURIComponent(error.message)}`
      )
    }

    return response
  }

  if (code) {
    // リダイレクトレスポンスにCookieを含めるため、
    // cookies()ではなくrequest/responseベースでCookieを管理する
    const redirectUrl = `${origin}${next}`
    const response = NextResponse.redirect(redirectUrl)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(
        `${origin}/auth/login#error_code=otp_expired&error_description=${encodeURIComponent(error.message)}`
      )
    }

    return response
  }

  return NextResponse.redirect(`${origin}${next}`)
}
