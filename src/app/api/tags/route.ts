import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const wallType = searchParams.get('wallType')

  const supabase = await createServerSupabase()
  let query = supabase.from('tags').select('*').order('sort', { ascending: true })

  if (wallType) {
    query = query.eq('wall_type', wallType)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || !['admin', 'super_admin'].includes(session.role)) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }

  const body = await request.json()
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('tags')
    .insert(body)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
