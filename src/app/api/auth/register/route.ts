import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as bcrypt from 'bcryptjs'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

export async function POST(request: NextRequest) {
  try {
    const { username, nickname, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6个字符' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existing) {
      return NextResponse.json({ error: '用户名已存在' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const { error: insertError } = await supabaseAdmin.from('users').insert({
      username,
      nickname: nickname || username,
      password: hashedPassword,
      role: 'user',
      status: 'active',
    })

    if (insertError) {
      return NextResponse.json({ error: '注册失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '请求无效' }, { status: 400 })
  }
}
