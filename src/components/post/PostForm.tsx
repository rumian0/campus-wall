'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { GlassModal } from '@/components/glass/GlassModal'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { WallType } from '@/types'

interface PostFormProps {
  open: boolean
  onClose: () => void
  wallType?: WallType
}

export function PostForm({ open, onClose, wallType = 'campus' }: PostFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!session) {
    router.push('/auth/login')
    return null
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const newImages = [...images, ...files].slice(0, 9)
    setImages(newImages)
    setPreviews(
      newImages.map((f) => URL.createObjectURL(f)),
    )
  }

  function removeImage(i: number) {
    URL.revokeObjectURL(previews[i])
    setImages((prev) => prev.filter((_, idx) => idx !== i))
    setPreviews((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || loading) return
    setLoading(true)

    try {
      // 上传图片到 Cloudflare Images
      const imageUrls: string[] = []
      for (const file of images) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.url) imageUrls.push(data.url)
      }

      // 创建帖子
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          wallType,
          images: imageUrls,
        }),
      })

      if (res.ok) {
        onClose()
        setContent('')
        setImages([])
        setPreviews([])
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassModal open={open} onClose={onClose} title="发布动态">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="说点什么..."
          className="glass-input min-h-[120px] w-full resize-none rounded-xl px-4 py-3 text-sm"
          maxLength={2000}
          required
        />

        {/* 图片预览 */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((img, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-white/5">
                <img src={img} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="glass-btn flex items-center gap-2 rounded-xl px-4 py-2 text-sm"
            disabled={images.length >= 9}
          >
            <ImagePlus className="h-4 w-4" />
            {images.length}/9
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
          />

          <motion.button
            type="submit"
            disabled={loading || !content.trim()}
            whileTap={{ scale: 0.95 }}
            className="glass-btn-accent rounded-xl px-6 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              '发布'
            )}
          </motion.button>
        </div>
      </form>
    </GlassModal>
  )
}
