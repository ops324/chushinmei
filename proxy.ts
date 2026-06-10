import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // 下流（page/RSC）に渡すリクエストヘッダ。クライアントからの偽装を防ぐため
  // x-user-* は proxy が必ず上書きするので、まず削除しておく。
  const forwardedHeaders = new Headers(request.headers)
  forwardedHeaders.delete('x-user-id')
  forwardedHeaders.delete('x-user-email')

  let supabaseResponse = NextResponse.next({ request: { headers: forwardedHeaders } })

  const { pathname } = request.nextUrl

  // パブリックパス（認証不要かつセッション不要）— Supabaseへの接続を省略
  // /auth/callback と /auth/update-password はセッション処理が必要なので除外
  const authNeedsSession = pathname === '/auth/callback' || pathname === '/auth/update-password'
  if ((pathname.startsWith('/auth') && !authNeedsSession) || pathname.startsWith('/shared') || pathname.startsWith('/try')) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: { headers: forwardedHeaders } })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // authパスでセッション処理が必要なルートはリフレッシュのみ（リダイレクトしない）
  if (authNeedsSession) {
    return supabaseResponse
  }

  // 未認証はログインへリダイレクト
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // 検証済み user 情報を下流に渡す。これにより page/Header での重複 getUser() を省略できる。
  // 新レスポンスを作り直す際、getUser() のトークン更新で supabaseResponse に積まれた
  // Set-Cookie が失われないよう必ずコピーする（セッション早期切れの防止）。
  forwardedHeaders.set('x-user-id', user.id)
  if (user.email) forwardedHeaders.set('x-user-email', user.email)
  const response = NextResponse.next({ request: { headers: forwardedHeaders } })
  supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
