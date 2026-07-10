import { createAdminSupabase } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createAdminSupabase()

  const { count: postCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })

  const { count: pendingCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: tagCount } = await supabase
    .from('tags')
    .select('*', { count: 'exact', head: true })

  const stats = [
    { label: '总帖子', value: postCount || 0 },
    { label: '待审核', value: pendingCount || 0 },
    { label: '用户数', value: userCount || 0 },
    { label: '标签数', value: tagCount || 0 },
  ]

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">数据概览</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
