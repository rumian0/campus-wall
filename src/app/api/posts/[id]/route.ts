import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

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

  // 增加浏览量
  await supabase.rpc('increment_view_count', { post_id: postId })

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:authorId ( id, nickname, avatar ),
      post_tags ( tag:tagId ( * ) )
    `)
    .eq('id', postId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const post = {
    ...data,
    tags: (data as any).post_tags?.map((pt: any) => pt.tag).filter(Boolean) || [],
  }

  return NextResponse.json(post)
}
