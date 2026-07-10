import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

async function checkAdmin() {
  const session = await getSession()
  if (!session || !['admin', 'super_admin'].includes(session.role)) {
    return false
  }
  return true
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const supabase = await createAdminSupabase()
  const { data, error } = await supabase
    .from('users')
    .select('id, username, nickname, role, status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const body = await request.json()
  const supabase = await createAdminSupabase()

  const { data, error } = await supabase
    .from('users')
    .update({ status: body.status })
    .eq('id', body.id)
    .select('id, username, nickname, role, status')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
