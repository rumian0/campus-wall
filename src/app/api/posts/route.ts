import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { auth } from '@/lib/auth'
import { getCachedPosts, setCachedPosts, invalidatePostCache } from '@/lib/kv'
import type { Post, PaginatedResponse } from '@/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const wallType = searchParams.get('wallType') || 'campus'
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '12')
  const tagId = searchParams.get('tagId')

  const cacheKey = `${wallType}:${page}`
  const cached = await getCachedPosts<PaginatedResponse<Post>>(cacheKey, 0)
  if (cached) return NextResponse.json(cached)

  const supabase = await createServerSupabase()

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:authorId ( id, nickname, avatar ),
      post_tags ( tag:tagId ( * ) )
    `, { count: 'exact' })
    .eq('status', 'approved')
    .eq('wallType', wallType)
    .order('createdAt', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (tagId) {
    query = query.eq('post_tags.tagId', tagId)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const posts: Post[] = (data || []).map((item: any) => ({
    ...item,
    tags: (item.post_tags || []).map((pt: any) => pt.tag).filter(Boolean),
  }))

  const result: PaginatedResponse<Post> = {
    data: posts,
    total: count || 0,
    page,
    pageSize,
    hasMore: ((page - 1) * pageSize + posts.length) < (count || 0),
  }

  await setCachedPosts(cacheKey, 0, result)
  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const body = await request.json()
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('posts')
    .insert({
      content: body.content,
      wallType: body.wallType || 'campus',
      images: body.images || [],
      authorId: session.user.id,
      status: 'pending',
      isApproved: false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (body.tagIds?.length > 0) {
    const tagInserts = body.tagIds.map((tagId: number) => ({
      postId: data.id,
      tagId,
    }))
    await supabase.from('post_tags').insert(tagInserts)
  }

  await invalidatePostCache(body.wallType)
  return NextResponse.json(data)
}
