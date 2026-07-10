import { cn } from '@/lib/ui-utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export function GlassCard({ children, className, onClick, hover = true }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card rounded-2xl p-4',
        hover && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  )
}
