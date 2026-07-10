import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { getSession } from '@/lib/session'
import { getCachedPosts, setCachedPosts, invalidatePostCache } from '@/lib/kv'
import { mapRow, mapRows } from '@/lib/db-utils'
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
      author:author_id ( id, nickname, avatar ),
      post_tags ( tag:tag_id ( * ) )
    `, { count: 'exact' })
    .eq('status', 'approved')
    .eq('wall_type', wallType)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (tagId) {
    query = query.eq('post_tags.tag_id', tagId)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const posts = ((data || []).map((item: any) => ({
    ...mapRow(item),
    tags: ((item.post_tags || []) as any[]).map((pt: any) => pt.tag).filter(Boolean),
  })) as unknown) as Post[]

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
  const session = await getSession()
  if (!session?.id) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const body = await request.json()
  const supabase = await createServerSupabase()

  const { data, error } = await supabase
    .from('posts')
    .insert({
      content: body.content,
      wall_type: body.wallType || 'campus',
      images: body.images || [],
      author_id: session.id,
      status: 'pending',
      is_approved: false,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (body.tagIds?.length > 0) {
    const tagInserts = body.tagIds.map((tagId: number) => ({
      post_id: data.id,
      tag_id: tagId,
    }))
    await supabase.from('post_tags').insert(tagInserts)
  }

  await invalidatePostCache(body.wallType)
  return NextResponse.json(mapRow(data) as Record<string, unknown>)
}
