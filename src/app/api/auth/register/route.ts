import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import * as bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { username, nickname, password } = await request.json()
    const trimmedUser = (username || '').trim()
    const trimmedNick = (nickname || '').trim()
    const trimmedPass = (password || '').trim()

    if (!trimmedUser || !trimmedPass) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 })
    }
    if (trimmedPass.length < 6) {
      return NextResponse.json({ error: '密码至少6个字符' }, { status: 400 })
    }

    const supabase = await createAdminSupabase()

    const { data: existing, error: lookupError } = await supabase
      .from('users')
      .select('id')
      .eq('username', trimmedUser)
      .maybeSingle()

    if (lookupError) {
      return NextResponse.json({ error: `查询失败: ${lookupError.message}` }, { status: 500 })
    }
    if (existing) {
      return NextResponse.json({ error: '用户名已存在' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(trimmedPass, 12)

    const { error: insertError } = await supabase.from('users').insert({
      username: trimmedUser,
      nickname: trimmedNick || trimmedUser,
      password: hashedPassword,
      role: 'user',
      status: 'active',
    })

    if (insertError) {
      return NextResponse.json({ error: `注册失败: ${insertError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: `服务器错误: ${e?.message || '未知错误'}` }, { status: 500 })
  }
}
