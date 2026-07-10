import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { mapRow, mapRows } from '@/lib/db-utils'

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
      author:author_id ( id, nickname, avatar )
    `)
    .eq('post_id', postId)
    .is('parent_id', null)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const commentIds = (data || []).map((c) => c.id)
  let replies: any[] = []
  if (commentIds.length > 0) {
    const { data: replyData } = await supabase
      .from('comments')
      .select(`
        *,
        author:author_id ( id, nickname, avatar )
      `)
      .in('parent_id', commentIds)
      .order('created_at', { ascending: true })
    replies = replyData || []
  }

  const rawReplies = replies
  const comments = (data || []).map((comment) => ({
    ...(mapRow(comment) as Record<string, unknown>),
    replies: rawReplies.filter((r) => r.parent_id === comment.id).map((r) => mapRow(r) as Record<string, unknown>),
  }))

  return NextResponse.json({ data: comments })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session?.id) {
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
      parent_id: body.parentId || null,
      author_id: session.id,
      post_id: postId,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.rpc('increment_comment_count', { post_id: postId, delta: 1 })

  return NextResponse.json(mapRow(data) as Record<string, unknown>)
}
