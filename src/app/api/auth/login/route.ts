import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import * as bcrypt from 'bcryptjs'
import { setSessionCookieOnResponse } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    const trimmedUser = (username || '').trim()
    const trimmedPass = (password || '').trim()
    if (!trimmedUser || !trimmedPass) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 })
    }

    const supabase = await createServerSupabase()

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('username', trimmedUser)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
    }
    if (user.status === 'banned') {
      return NextResponse.json({ error: '账号已被禁用' }, { status: 403 })
    }

    const isValid = await bcrypt.compare(trimmedPass, user.password)
    if (!isValid) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    return setSessionCookieOnResponse(response, { id: user.id, name: user.nickname, role: user.role })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || '服务器错误' }, { status: 500 })
  }
}
