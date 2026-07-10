import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { invalidatePostCache } from '@/lib/kv'
import { mapRow, mapRows } from '@/lib/db-utils'

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
    .from('posts')
    .select(`
      *,
      author:author_id ( id, nickname, username, role )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(mapRows(data || []))
}

export async function PATCH(request: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const body = await request.json()
  const supabase = await createAdminSupabase()

  const { data, error } = await supabase
    .from('posts')
    .update({
      status: body.status,
      is_approved: body.isApproved,
    })
    .eq('id', body.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await invalidatePostCache()
  return NextResponse.json(mapRow(data) as Record<string, unknown>)
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: '缺少帖子 ID' }, { status: 400 })
  }

  const supabase = await createAdminSupabase()
  const { error } = await supabase.from('posts').delete().eq('id', parseInt(id))

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await invalidatePostCache()
  return NextResponse.json({ success: true })
}
