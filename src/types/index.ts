/* ===== 数据库模型类型定义 ===== */

export interface User {
  id: string
  username: string
  nickname: string
  avatar: string | null
  email: string | null
  role: 'user' | 'admin' | 'super_admin'
  status: 'active' | 'banned'
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: number
  name: string
  icon: string | null
  wallType: 'campus' | 'confession' | 'friend'
  sort: number
  createdAt: string
}

export interface Post {
  id: number
  content: string
  wallType: 'campus' | 'confession' | 'friend'
  images: string[]
  status: 'pending' | 'approved' | 'rejected'
  isApproved: boolean
  viewCount: number
  likeCount: number
  dislikeCount: number
  commentCount: number
  authorId: string
  author: Pick<User, 'id' | 'nickname' | 'avatar'>
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: number
  content: string
  parentId: number | null
  authorId: string
  author: Pick<User, 'id' | 'nickname' | 'avatar'>
  postId: number
  createdAt: string
  updatedAt: string
  replies?: Comment[]
}

export interface Like {
  id: number
  type: 'like' | 'dislike'
  userId: string
  postId: number
  createdAt: string
}

/* ===== API 请求/响应类型 ===== */

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface CreatePostInput {
  content: string
  wallType: 'campus' | 'confession' | 'friend'
  images?: string[]
  tagIds?: number[]
}

export interface CreateCommentInput {
  content: string
  parentId?: number | null
}

export interface UpdatePostStatusInput {
  status: 'pending' | 'approved' | 'rejected'
  isApproved: boolean
}

export interface ToggleBanInput {
  status: 'active' | 'banned'
}

export interface CreateTagInput {
  name: string
  wallType: 'campus' | 'confession' | 'friend'
  icon?: string
  sort?: number
}

/* ===== 前端本地状态类型 ===== */

export interface BackgroundConfig {
  bgImage: string | null
  bgColor: string
  blur: number
  opacity: number
}

export type WallType = 'campus' | 'confession' | 'friend'

export const WALL_LABELS: Record<WallType, string> = {
  campus: '校园墙',
  confession: '表白墙',
  friend: '交友墙',
}

export const WALL_ICONS: Record<WallType, string> = {
  campus: '🏛️',
  confession: '❤️',
  friend: '🤝',
}
