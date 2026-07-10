import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { auth } from '@/lib/auth'
import { invalidatePostCache } from '@/lib/kv'

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

  const { type } = await request.json()
  if (!['like', 'dislike'].includes(type)) {
    return NextResponse.json({ error: '无效的操作类型' }, { status: 400 })
  }

  const supabase = await createServerSupabase()
  const userId = session.user.id

  // 查询是否已点赞/踩
  const { data: existing } = await supabase
    .from('likes')
    .select('*')
    .eq('userId', userId)
    .eq('postId', postId)
    .single()

  if (existing) {
    if (existing.type === type) {
      // 取消
      await supabase.from('likes').delete().eq('id', existing.id)
      const delta = type === 'like' ? -1 : 1
      if (type === 'like') {
        await supabase.rpc('increment_like_count', { post_id: postId, delta })
      } else {
        await supabase.rpc('increment_dislike_count', { post_id: postId, delta })
      }
    } else {
      // 切换
      await supabase.from('likes').update({ type }).eq('id', existing.id)
      const likeDelta = type === 'like' ? 1 : -1
      const dislikeDelta = type === 'dislike' ? 1 : -1
      await supabase.rpc('increment_like_count', { post_id: postId, delta: likeDelta })
      await supabase.rpc('increment_dislike_count', { post_id: postId, delta: dislikeDelta })
    }
  } else {
    // 新增
    await supabase.from('likes').insert({ userId, postId, type })
    const delta = 1
    if (type === 'like') {
      await supabase.rpc('increment_like_count', { post_id: postId, delta })
    } else {
      await supabase.rpc('increment_dislike_count', { post_id: postId, delta })
    }
  }

  await invalidatePostCache()
  return NextResponse.json({ success: true })
}
