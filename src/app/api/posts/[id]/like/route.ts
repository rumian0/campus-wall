import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { invalidatePostCache } from '@/lib/kv'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session?.id || session.id === 'guest') {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { id } = await params
  const postId = parseInt(id)
  if (isNaN(postId)) {
    return NextResponse.json({ error: '无效的帖子 ID' }, { status: 400 })
  }

  const { type } = await request.json()
  if (!['like', 'dislike'].includes(type)) {
    return NextResponse.json({ error: '无效的操作类型' }, { status: 400 })
  }

  const supabase = await createAdminSupabase()
  const userId = session.id

  const { data: existing } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle()

  const { data: post } = await supabase
    .from('posts')
    .select('like_count, dislike_count')
    .eq('id', postId)
    .single()

  let likeCount = post?.like_count ?? 0
  let dislikeCount = post?.dislike_count ?? 0

  if (existing) {
    if (existing.type === type) {
      await supabase.from('likes').delete().eq('id', existing.id)
      if (type === 'like') likeCount = Math.max(0, likeCount - 1)
      else dislikeCount = Math.max(0, dislikeCount - 1)
    } else {
      await supabase.from('likes').update({ type }).eq('id', existing.id)
      if (type === 'like') { likeCount += 1; dislikeCount = Math.max(0, dislikeCount - 1) }
      else { dislikeCount += 1; likeCount = Math.max(0, likeCount - 1) }
    }
  } else {
    await supabase.from('likes').insert({ user_id: userId, post_id: postId, type })
    if (type === 'like') likeCount += 1
    else dislikeCount += 1
  }

  await supabase.from('posts').update({ like_count: likeCount, dislike_count: dislikeCount }).eq('id', postId)
  await invalidatePostCache()
  return NextResponse.json({ success: true, likeCount, dislikeCount })
}
