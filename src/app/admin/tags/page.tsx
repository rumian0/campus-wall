'use client'

import { useState, useEffect } from 'react'

interface AdminTag {
  id: number
  name: string
  icon: string | null
  wallType: string
  sort: number
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<AdminTag[]>([])
  const [name, setName] = useState('')
  const [wallType, setWallType] = useState('campus')
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => { fetchTags() }, [])

  async function fetchTags() {
    const res = await fetch('/api/admin/tags')
    if (res.ok) setTags(await res.json())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    if (editingId) {
      await fetch('/api/admin/tags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, name: name.trim(), wallType }),
      })
    } else {
      await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), wallType }),
      })
    }

    setName('')
    setEditingId(null)
    fetchTags()
  }

  async function deleteTag(id: number) {
    if (!confirm('确定删除此标签？')) return
    await fetch(`/api/admin/tags?id=${id}`, { method: 'DELETE' })
    fetchTags()
  }

  function editTag(tag: AdminTag) {
    setEditingId(tag.id)
    setName(tag.name)
    setWallType(tag.wallType)
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">标签管理</h2>

      <form onSubmit={handleSubmit} className="glass-card mb-6 flex items-end gap-3 rounded-2xl p-4">
        <div className="flex-1">
          <label className="mb-1 block text-xs" style={{ color: 'var(--text-secondary)' }}>标签名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="glass-input w-full rounded-xl px-3 py-2 text-sm"
            placeholder="输入标签名称"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs" style={{ color: 'var(--text-secondary)' }}>分类</label>
          <select
            value={wallType}
            onChange={(e) => setWallType(e.target.value)}
            className="glass-input rounded-xl px-3 py-2 text-sm"
          >
            <option value="campus">校园墙</option>
            <option value="confession">表白墙</option>
            <option value="friend">交友墙</option>
          </select>
        </div>
        <button type="submit" className="glass-btn-accent rounded-xl px-4 py-2 text-sm">
          {editingId ? '更新' : '添加'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setName(''); }} className="glass-btn rounded-xl px-3 py-2 text-xs">
            取消
          </button>
        )}
      </form>

      <div className="space-y-2">
        {tags.map((tag) => (
          <div key={tag.id} className="glass-card flex items-center justify-between rounded-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{tag.name}</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
                {tag.wallType === 'campus' ? '校园' : tag.wallType === 'confession' ? '表白' : '交友'}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => editTag(tag)} className="glass-btn rounded-lg px-2.5 py-1 text-xs">
                编辑
              </button>
              <button onClick={() => deleteTag(tag.id)} className="glass-btn rounded-lg px-2.5 py-1 text-xs text-red-400">
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
