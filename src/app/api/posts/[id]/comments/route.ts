import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { auth } from '@/lib/auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const postId = parseInt(id)
  if (isNaN(postId)) {
    return NextResponse.json({ error: '无效的帖子 ID' }, { status: 400 })
  }

  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:authorId ( id, nickname, avatar )
    `)
    .eq('postId', postId)
    .is('parentId', null)
    .order('createdAt', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 获取子评论
  const commentIds = (data || []).map((c) => c.id)
  let replies: any[] = []
  if (commentIds.length > 0) {
    const { data: replyData } = await supabase
      .from('comments')
      .select(`
        *,
        author:authorId ( id, nickname, avatar )
      `)
      .in('parentId', commentIds)
      .order('createdAt', { ascending: true })
    replies = replyData || []
  }

  const comments = (data || []).map((comment) => ({
    ...comment,
    replies: replies.filter((r) => r.parentId === comment.id),
  }))

  return NextResponse.json({ data: comments })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { id } = await params
  const postId = parseInt(id)
  if (isNaN(postId)) {
    return NextResponse.json({ error: '无效的帖子 ID' }, { status: 400 })
  }

  const body = await request.json()
  if (!body.content?.trim()) {
    return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 })
  }

  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('comments')
    .insert({
      content: body.content.trim(),
      parentId: body.parentId || null,
      authorId: session.user.id,
      postId,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 更新帖子评论数
  await supabase.rpc('increment_comment_count', { post_id: postId, delta: 1 })

  return NextResponse.json(data)
}
