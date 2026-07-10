'use client'

import { motion } from 'framer-motion'
import { Heart, MessageCircle, ThumbsDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface PostActionsProps {
  postId: number
  likeCount: number
  dislikeCount: number
  onLike: (type: 'like' | 'dislike') => void
  onCommentToggle: () => void
}

export function PostActions({
  likeCount,
  dislikeCount,
  onLike,
  onCommentToggle,
}: PostActionsProps) {
  const { user } = useAuth()
  const router = useRouter()

  function handleAction(action: () => void) {
    if (!user) {
      router.push('/auth/login')
      return
    }
    action()
  }

  return (
    <div className="flex items-center gap-4" style={{ color: 'var(--text-secondary)' }}>
      <motion.button
        whileTap={{ scale: 1.3 }}
        onClick={() => handleAction(() => onLike('like'))}
        className="flex items-center gap-1.5 text-sm transition-colors hover:text-red-400"
      >
        <Heart className="h-4 w-4" />
        {likeCount > 0 && likeCount}
      </motion.button>

      <motion.button
        whileTap={{ scale: 1.3 }}
        onClick={() => handleAction(() => onLike('dislike'))}
        className="flex items-center gap-1.5 text-sm transition-colors hover:text-blue-400"
      >
        <ThumbsDown className="h-4 w-4" />
        {dislikeCount > 0 && dislikeCount}
      </motion.button>

      <motion.button
        whileTap={{ scale: 1.1 }}
        onClick={onCommentToggle}
        className="flex items-center gap-1.5 text-sm transition-colors hover:text-purple-400"
      >
        <MessageCircle className="h-4 w-4" />
        评论
      </motion.button>
    </div>
  )
}
