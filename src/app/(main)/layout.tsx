'use client'

import { SessionProvider } from 'next-auth/react'
import { GlassNav } from '@/components/glass/GlassNav'
import { ThemeProvider } from '@/components/common/ThemeProvider'
import { Toaster } from '@/components/ui/toast'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <div className="relative min-h-screen pb-20">
          <main className="relative z-1 mx-auto max-w-2xl px-4 pt-6">
            {children}
          </main>
          <GlassNav />
        </div>
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
