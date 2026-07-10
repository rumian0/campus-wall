'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useInView } from 'react-intersection-observer'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { PostCard } from './PostCard'
import { PostSkeleton } from './PostSkeleton'
import { PostForm } from './PostForm'
import { BackgroundPicker } from '@/components/common/BackgroundPicker'
import { Plus } from 'lucide-react'
import type { Post, WallType, PaginatedResponse } from '@/types'

interface WallFeedProps {
  wallType: WallType
}

export function WallFeed({ wallType }: WallFeedProps) {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showBgPicker, setShowBgPicker] = useState(false)
  const loadingRef = useRef(false)

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  })

  const fetchPosts = useCallback(
    async (pageNum: number, append = false) => {
      if (loadingRef.current) return
      loadingRef.current = true

      if (!append) setLoading(true)

      try {
        const res = await fetch(
          `/api/posts?wallType=${wallType}&page=${pageNum}&pageSize=12`,
        )
        const data: PaginatedResponse<Post> = await res.json()

        if (append) {
          setPosts((prev) => [...prev, ...data.data])
        } else {
          setPosts(data.data)
        }
        setHasMore(data.hasMore)
        setPage(pageNum)
      } finally {
        setLoading(false)
        loadingRef.current = false
      }
    },
    [wallType],
  )

  useEffect(() => {
    fetchPosts(1)
  }, [fetchPosts])

  useEffect(() => {
    if (inView && hasMore && !loading) {
      fetchPosts(page + 1, true)
    }
  }, [inView, hasMore, loading, page, fetchPosts])

  async function handleLike(postId: number, type: 'like' | 'dislike') {
    if (!session) return
    await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    fetchPosts(page, false)
  }

  async function handleComment(
    postId: number,
    _content: string,
    _parentId?: number | null,
  ) {
    // 评论由 CommentForm 内部处理，刷新帖子列表
    fetchPosts(page, false)
  }

  return (
    <div className="space-y-4">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          {wallType === 'campus'
            ? '校园墙'
            : wallType === 'confession'
              ? '表白墙'
              : '交友墙'}
        </h1>
        <div className="flex items-center gap-2">
          <BackgroundPicker
            open={showBgPicker}
            onOpenChange={setShowBgPicker}
          />
          <ThemeToggle />
        </div>
      </div>

      {/* 发帖按钮 */}
      {session && (
        <button
          onClick={() => setShowForm(true)}
          className="glass-btn-accent flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          发布动态
        </button>
      )}

      {/* 帖子瀑布流 */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
          />
        ))}

        {/* 加载更多触发器 */}
        <div ref={loadMoreRef} className="py-4">
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          )}
          {!hasMore && posts.length > 0 && (
            <p className="text-center text-xs py-4" style={{ color: 'var(--text-tertiary)' }}>
              没有更多了
            </p>
          )}
        </div>

        {/* 空状态 */}
        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              这里还没有内容
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
              来发布第一条动态吧
            </p>
          </div>
        )}
      </div>

      {/* 发帖弹窗 */}
      <PostForm
        open={showForm}
        onClose={() => {
          setShowForm(false)
          fetchPosts(1)
        }}
        wallType={wallType}
      />
    </div>
  )
}
