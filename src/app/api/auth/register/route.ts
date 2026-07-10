import { NextRequest, NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { createClient } = await import('@supabase/supabase-js')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url?.startsWith('https://')) {
    return NextResponse.json({ error: `Supabase URL 格式错误: ${url}` }, { status: 500 })
  }
  if (!key) {
    return NextResponse.json({ error: '服务端密钥未配置' }, { status: 500 })
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  try {
    const { username, nickname, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6个字符' }, { status: 400 })
    }

    const { data: existing, error: lookupError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (lookupError && lookupError.code !== 'PGRST116') {
      return NextResponse.json({ error: `查询失败: ${lookupError.message}` }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ error: '用户名已存在' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const { error: insertError } = await supabase.from('users').insert({
      username,
      nickname: nickname || username,
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
