'use client'

import { useState, useEffect } from 'react'
import { GlassModal } from '@/components/glass/GlassModal'
import { Image, Trash2 } from 'lucide-react'
import type { BackgroundConfig } from '@/types'

const DEFAULT_BG: BackgroundConfig = {
  bgImage: null,
  bgColor: '#0a0a1a',
  blur: 12,
  opacity: 0.65,
}

function loadBgFromStorage(): BackgroundConfig {
  if (typeof window === 'undefined') return DEFAULT_BG
  try {
    const saved = localStorage.getItem('campus-wall-bg')
    if (saved) return JSON.parse(saved)
  } catch {}
  return DEFAULT_BG
}

function saveBgToStorage(config: BackgroundConfig) {
  localStorage.setItem('campus-wall-bg', JSON.stringify(config))
  // 可选：IndexedDB 持久化
}

interface BackgroundPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BackgroundPicker({ open, onOpenChange }: BackgroundPickerProps) {
  const [config, setConfig] = useState<BackgroundConfig>(DEFAULT_BG)

  useEffect(() => {
    setConfig(loadBgFromStorage())
  }, [])

  useEffect(() => {
    if (config.bgImage) {
      document.documentElement.style.setProperty('--custom-bg', `url(${config.bgImage})`)
      document.documentElement.style.setProperty('--custom-bg-opacity', String(config.opacity))
    } else {
      document.documentElement.style.removeProperty('--custom-bg')
      document.documentElement.style.removeProperty('--custom-bg-opacity')
    }
  }, [config])

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const newConfig = { ...config, bgImage: reader.result as string }
      setConfig(newConfig)
      saveBgToStorage(newConfig)
    }
    reader.readAsDataURL(file)
  }

  function handleReset() {
    const newConfig = { ...DEFAULT_BG }
    setConfig(newConfig)
    saveBgToStorage(newConfig)
  }

  return (
    <>
      <button
        onClick={() => onOpenChange(true)}
        className="glass-btn flex h-9 w-9 items-center justify-center rounded-full"
        aria-label="背景设置"
      >
        <Image className="h-4 w-4" />
      </button>

      <GlassModal
        open={open}
        onClose={() => onOpenChange(false)}
        title="背景设置"
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            设置仅对你本地生效，更换设备后失效
          </p>

          {config.bgImage && (
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={config.bgImage}
                alt="当前背景"
                className="h-32 w-full object-cover"
              />
              <button
                onClick={handleReset}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}

          <label className="glass-btn flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm">
            <Image className="h-4 w-4" />
            {config.bgImage ? '更换背景' : '选择背景图片'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

          {/* 透明度调节 */}
          <div>
            <label className="mb-2 block text-xs" style={{ color: 'var(--text-secondary)' }}>
              不透明度: {Math.round(config.opacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(config.opacity * 100)}
              onChange={(e) => {
                const newConfig = {
                  ...config,
                  opacity: parseInt(e.target.value) / 100,
                }
                setConfig(newConfig)
                saveBgToStorage(newConfig)
              }}
              className="w-full accent-purple-500"
            />
          </div>
        </div>
      </GlassModal>
    </>
  )
}
