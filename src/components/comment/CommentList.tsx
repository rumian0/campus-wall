'use client'

import { useState, useEffect } from 'react'
import { formatTime } from '@/lib/utils'
import type { Comment } from '@/types'

interface CommentListProps {
  postId: number
}

export function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data.data ?? data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [postId])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="skeleton-pulse h-12 rounded-xl" />
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <p className="py-4 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
        暂无评论，来说点什么吧
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id}>
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium">
              {comment.author.nickname.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{comment.author.nickname}</p>
              <p className="mt-0.5 text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {comment.content}
              </p>
              <p className="mt-1 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                {formatTime(comment.createdAt)}
              </p>
            </div>
          </div>
          {/* 子评论缩进 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-9 mt-2 space-y-2 border-l-2 pl-3" style={{ borderColor: 'var(--glass-border)' }}>
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium">
                    {reply.author.nickname.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{reply.author.nickname}</p>
                    <p className="mt-0.5 text-sm leading-relaxed">{reply.content}</p>
                    <p className="mt-1 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      {formatTime(reply.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
