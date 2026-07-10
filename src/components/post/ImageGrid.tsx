'use client'

import { useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { cn } from '@/lib/ui-utils'

interface ImageGridProps {
  images: string[]
}

export function ImageGrid({ images }: ImageGridProps) {
  const [loaded, setLoaded] = useState<Set<number>>(new Set())

  if (images.length === 0) return null

  const gridClass =
    images.length === 1
      ? 'grid-cols-1'
      : images.length === 2
        ? 'grid-cols-2'
        : images.length === 3
          ? 'grid-cols-2'
          : 'grid-cols-2'

  return (
    <div className={cn('grid gap-1.5 rounded-xl overflow-hidden', gridClass)}>
      {images.map((url, i) => (
        <ImageItem
          key={i}
          src={url}
          alt={`图片 ${i + 1}`}
          className={
            images.length === 3 && i === 0
              ? 'row-span-2'
              : ''
          }
          onLoad={() => setLoaded((prev) => new Set(prev).add(i))}
          loaded={loaded.has(i)}
        />
      ))}
    </div>
  )
}

function ImageItem({
  src,
  alt,
  className,
  onLoad,
  loaded,
}: {
  src: string
  alt: string
  className?: string
  onLoad: () => void
  loaded: boolean
}) {
  const { ref, inView } = useInView({ triggerOnce: true })

  return (
    <div
      ref={ref}
      className={cn('relative aspect-square overflow-hidden bg-white/5', className)}
    >
      {!loaded && (
        <div className="absolute inset-0 skeleton-pulse" />
      )}
      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={onLoad}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  )
}
