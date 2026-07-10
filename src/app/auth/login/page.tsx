'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

function LoginForm() {
  const searchParams = useSearchParams()
  const [error, setError] = useState(searchParams.get('error') ? '用户名或密码错误' : '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)

    await signIn('credentials', {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      callbackUrl: '/campus',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong w-full max-w-sm rounded-3xl p-8"
    >
      <h1 className="mb-2 text-center text-2xl font-semibold">登录</h1>
      <p className="mb-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        欢迎回到校园时光墙
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            name="username"
            type="text"
            placeholder="用户名"
            className="glass-input w-full rounded-xl px-4 py-3 text-sm"
            required
          />
        </div>
        <div>
          <input
            name="password"
            type="password"
            placeholder="密码"
            className="glass-input w-full rounded-xl px-4 py-3 text-sm"
            required
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
          {loading ? '登录中...' : '登录'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        还没有账号？{' '}
        <Link href="/auth/register" style={{ color: 'var(--accent)' }}>
          立即注册
        </Link>
      </p>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<div className="glass-strong w-full max-w-sm rounded-3xl p-8"><p className="text-center">加载中...</p></div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
