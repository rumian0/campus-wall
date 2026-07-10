import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as bcrypt from 'bcryptjs'
import { setSessionCookie } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    )

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (!user) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
    }
    if (user.status === 'banned') {
      return NextResponse.json({ error: '账号已被禁用' }, { status: 403 })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
    }

    await setSessionCookie({ id: user.id, name: user.nickname, role: user.role })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || '服务器错误' }, { status: 500 })
  }
}
