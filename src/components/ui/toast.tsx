'use client'

import { useToast } from '@/hooks/use-toast'
import * as React from 'react'
import { cn } from '@/lib/ui-utils'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-24 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'glass-strong rounded-2xl px-4 py-3 text-sm shadow-lg animate-in slide-in-from-right',
          )}
        >
          <p className="font-medium">{t.title}</p>
          {t.description && (
            <p className="mt-1 text-white/60 text-xs">{t.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}
