import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // パスワードリカバリの場合はパスワード更新ページへ
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/auth/update-password`)
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
