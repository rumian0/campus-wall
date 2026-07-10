'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

interface CommentFormProps {
  postId: number
  parentId?: number | null
  onSubmit: (content: string) => void
  placeholder?: string
}

export function CommentForm({
  postId,
  parentId,
  onSubmit,
  placeholder = '写评论...',
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || loading) return
    setLoading(true)

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), parentId }),
      })

      if (res.ok) {
        onSubmit(content.trim())
        setContent('')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="glass-input flex-1 rounded-xl px-3 py-2 text-sm"
        maxLength={500}
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="glass-btn flex h-9 w-9 items-center justify-center rounded-xl disabled:opacity-40"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  )
}
