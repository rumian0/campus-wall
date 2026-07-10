'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/ui-utils'
import type { WallType } from '@/types'

const TABS: { id: WallType; label: string; icon: string }[] = [
  { id: 'campus', label: '校园墙', icon: '🏛️' },
  { id: 'confession', label: '表白墙', icon: '❤️' },
  { id: 'friend', label: '交友墙', icon: '🤝' },
]

export function GlassNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const currentTab = pathname.split('/')[1] || 'campus'

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto max-w-md rounded-[28px] px-2 py-1.5 shadow-2xl" style={{ background: 'var(--tab-bar-bg)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', border: '1px solid var(--glass-border)', borderTop: '0.5px solid var(--glass-highlight)' }}>
        <div className="flex items-center justify-around">
          {TABS.map((tab) => {
            const isActive = currentTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => router.push(`/${tab.id}`)}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 px-5 py-2 transition-all duration-300',
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-2xl bg-white/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative text-xl">{tab.icon}</span>
                <span
                  className={cn(
                    'relative text-[10px] font-medium tracking-wide',
                    isActive
                      ? 'text-white'
                      : 'text-white/40',
                  )}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
