'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import bcrypt from 'bcryptjs'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('密码至少6个字符')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const hashedPassword = await bcrypt.hash(password, 12)

    const { error: signUpError } = await supabase.from('users').insert({
      username,
      nickname: nickname || username,
      password: hashedPassword,
      role: 'user',
      status: 'active',
    })

    if (signUpError) {
      setError(signUpError.message.includes('duplicate') ? '用户名已存在' : '注册失败')
      setLoading(false)
      return
    }

    router.push('/auth/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong w-full max-w-sm rounded-3xl p-8"
      >
        <h1 className="mb-2 text-center text-2xl font-semibold">注册</h1>
        <p className="mb-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          加入校园时光墙，分享你的校园生活
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="glass-input w-full rounded-xl px-4 py-3 text-sm"
              required
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="昵称（可选）"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="glass-input w-full rounded-xl px-4 py-3 text-sm"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="密码（至少6位）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input w-full rounded-xl px-4 py-3 text-sm"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-center text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="glass-btn-accent w-full rounded-xl py-3 text-sm font-medium disabled:opacity-50"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          已有账号？{' '}
          <Link href="/auth/login" style={{ color: 'var(--accent)' }}>
            去登录
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
