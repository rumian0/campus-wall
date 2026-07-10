'use client'

import { useState, useEffect } from 'react'
import { formatTime } from '@/lib/utils'

interface AdminUser {
  id: string
  username: string
  nickname: string
  role: string
  status: string
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) setUsers(await res.json())
    } finally {
      setLoading(false)
    }
  }

  async function toggleBan(userId: string, currentStatus: string) {
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned'
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, status: newStatus }),
    })
    fetchUsers()
  }

  if (loading) return <p className="text-sm text-white/60">加载中...</p>

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">用户管理</h2>
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="glass-card flex items-center justify-between rounded-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-medium">
                {user.nickname.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{user.nickname}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  @{user.username} · {user.role} · {formatTime(user.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] ${
                  user.status === 'banned' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}
              >
                {user.status === 'banned' ? '已封禁' : '正常'}
              </span>
              <button
                onClick={() => toggleBan(user.id, user.status)}
                className={`glass-btn rounded-lg px-3 py-1 text-xs ${
                  user.status === 'banned' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {user.status === 'banned' ? '解封' : '封禁'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
