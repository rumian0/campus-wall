import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { mapRow } from '@/lib/db-utils'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const postId = parseInt(id)
  if (isNaN(postId)) {
    return NextResponse.json({ error: '无效的帖子 ID' }, { status: 400 })
  }

  const { data: post } = await supabase
    .from('posts')
    .select('view_count')
    .eq('id', postId)
    .single()

  await supabase
    .from('posts')
    .update({ view_count: (post?.view_count ?? 0) + 1 })
    .eq('id', postId)

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:author_id ( id, nickname, avatar ),
      post_tags ( tag:tag_id ( * ) )
    `)
    .eq('id', postId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const raw = data as any
  const result = {
    ...(mapRow(raw) as Record<string, unknown>),
    tags: (raw?.post_tags || []).map((pt: any) => pt.tag).filter(Boolean),
  }

  return NextResponse.json(result)
}
