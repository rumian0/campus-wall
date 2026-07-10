'use client'

import { useState, useEffect } from 'react'
import { formatTime } from '@/lib/utils'

interface AdminPost {
  id: number
  content: string
  wallType: string
  status: string
  isApproved: boolean
  author: { id: string; nickname: string }
  createdAt: string
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const res = await fetch('/api/admin/posts')
      if (res.ok) setPosts(await res.json())
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: number, status: string) {
    await fetch('/api/admin/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, isApproved: status === 'approved' }),
    })
    fetchPosts()
  }

  async function deletePost(id: number) {
    if (!confirm('确定删除此帖子？')) return
    await fetch(`/api/admin/posts?id=${id}`, { method: 'DELETE' })
    fetchPosts()
  }

  if (loading) return <p className="text-sm text-white/60">加载中...</p>

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">帖子管理</h2>
      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="glass-card rounded-2xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm line-clamp-2">{post.content}</p>
                <div className="mt-2 flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span>{post.author.nickname}</span>
                  <span>{post.wallType}</span>
                  <span>{formatTime(post.createdAt)}</span>
                  <span className={post.status === 'pending' ? 'text-yellow-400' : post.status === 'approved' ? 'text-green-400' : 'text-red-400'}>
                    {post.status === 'pending' ? '待审核' : post.status === 'approved' ? '已通过' : '已拒绝'}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {post.status !== 'approved' && (
                  <button onClick={() => updateStatus(post.id, 'approved')} className="glass-btn rounded-lg px-3 py-1 text-xs text-green-400">
                    通过
                  </button>
                )}
                {post.status !== 'rejected' && (
                  <button onClick={() => updateStatus(post.id, 'rejected')} className="glass-btn rounded-lg px-3 py-1 text-xs text-red-400">
                    拒绝
                  </button>
                )}
                <button onClick={() => deletePost(post.id)} className="glass-btn rounded-lg px-3 py-1 text-xs text-white/40 hover:text-red-400">
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>暂无帖子</p>
        )}
      </div>
    </div>
  )
}
