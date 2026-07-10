import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const role = (session?.user as any)?.role

  if (!session || !['admin', 'super_admin'].includes(role)) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen">
      <nav className="glass-strong sticky top-0 z-50 border-b px-4" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="mx-auto flex max-w-4xl items-center gap-6 py-3">
          <h1 className="text-sm font-bold">管理后台</h1>
          <a href="/admin" className="text-xs text-white/60 hover:text-white transition-colors">概览</a>
          <a href="/admin/posts" className="text-xs text-white/60 hover:text-white transition-colors">帖子</a>
          <a href="/admin/tags" className="text-xs text-white/60 hover:text-white transition-colors">标签</a>
          <a href="/admin/users" className="text-xs text-white/60 hover:text-white transition-colors">用户</a>
          <a href="/campus" className="ml-auto text-xs text-white/40 hover:text-white transition-colors">返回前台</a>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-4 py-6">
        {children}
      </main>
    </div>
  )
}
