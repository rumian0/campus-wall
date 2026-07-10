import { cn } from '@/lib/ui-utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('skeleton-pulse rounded-xl', className)}
      {...props}
    />
  )
}

export { Skeleton }
