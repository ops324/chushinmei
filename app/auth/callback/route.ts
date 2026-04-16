import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    // パスワードリカバリの場合はパスワード更新ページへ
    if (data?.session?.user?.recovery_sent_at) {
      const recoverySentAt = new Date(data.session.user.recovery_sent_at).getTime()
      const now = Date.now()
      // リカバリメール送信から10分以内ならパスワード更新ページへ遷移
      if (now - recoverySentAt < 10 * 60 * 1000) {
        return NextResponse.redirect(`${origin}/auth/update-password`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
