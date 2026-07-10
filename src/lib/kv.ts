/**
 * Vercel KV / Upstash Redis 缓存
 * 用于缓存热门帖子列表，降低数据库请求频率
 */

import { Redis } from '@upstash/redis'

const redis = (() => {
  const url = process.env.UPSTASH_REDIS_URL
  const token = process.env.UPSTASH_REDIS_TOKEN
  if (url && token) return new Redis({ url, token })
  return null
})()

const CACHE_TTL = 300 // 5 分钟

export async function getCachedPosts<T>(
  wallType: string,
  page: number,
): Promise<T | null> {
  if (!redis) return null
  const key = `posts:${wallType}:${page}`
  return redis.get<T>(key)
}

export async function setCachedPosts<T>(
  wallType: string,
  page: number,
  data: T,
): Promise<void> {
  if (!redis) return
  const key = `posts:${wallType}:${page}`
  await redis.setex(key, CACHE_TTL, data)
}

export async function invalidatePostCache(wallType?: string): Promise<void> {
  if (!redis) return
  if (wallType) {
    await redis.del(`posts:${wallType}:1`)
  } else {
    // 清除所有帖子缓存
    const keys = await redis.keys('posts:*')
    if (keys.length > 0) await redis.del(...keys)
  }
}
