'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import { GlassCard } from '@/components/glass/GlassCard'
import { ImageGrid } from './ImageGrid'
import { PostActions } from './PostActions'
import { CommentList } from '@/components/comment/CommentList'
import { CommentForm } from '@/components/comment/CommentForm'
import { useAuth } from '@/contexts/AuthContext'
import { formatTime } from '@/lib/utils'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
  onLike: (postId: number, type: 'like' | 'dislike') => void
  onComment: (postId: number, content: string, parentId?: number | null) => void
}

export function PostCard({ post, onLike, onComment }: PostCardProps) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)
  const isLongContent = post.content.length > 200

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard className="space-y-3">
        {/* 作者信息 */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-medium">
            {post.author.nickname.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{post.author.nickname}</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {formatTime(post.createdAt)}
            </p>
          </div>
          {post.tags.length > 0 && (
            <div className="flex gap-1">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] text-white/60"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 帖子内容 */}
        <div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
            {showFullContent || !isLongContent
              ? post.content
              : `${post.content.slice(0, 200)}...`}
          </p>
          {isLongContent && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              className="mt-1 flex items-center gap-1 text-xs"
              style={{ color: 'var(--accent)' }}
            >
              {showFullContent ? '收起' : '展开全文'}
              {showFullContent ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          )}
        </div>

        {/* 图片 */}
        {post.images.length > 0 && <ImageGrid images={post.images} />}

        {/* 统计 */}
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {post.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {post.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {post.commentCount}
          </span>
        </div>

        {/* 操作栏 */}
        <PostActions
          postId={post.id}
          likeCount={post.likeCount}
          dislikeCount={post.dislikeCount}
          onLike={(type) => onLike(post.id, type)}
          onCommentToggle={() => setShowComments(!showComments)}
        />

        {/* 评论区 */}
        {showComments && (
          <div className="border-t pt-3" style={{ borderColor: 'var(--glass-border)' }}>
            <CommentList postId={post.id} />
            {user && (
              <div className="mt-3">
                <CommentForm
                  postId={post.id}
                  onSubmit={(content) => onComment(post.id, content)}
                />
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}
