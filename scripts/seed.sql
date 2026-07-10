-- ============================================================
-- CampusWall 校园时光墙 - Supabase 建表 SQL
-- 在 Supabase SQL Editor 中执行
-- ============================================================

-- 1. 用户扩展表（补充 Supabase Auth）
CREATE TABLE public.users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username    TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  nickname    TEXT NOT NULL,
  avatar      TEXT,
  email       TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. 标签表
CREATE TABLE public.tags (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT UNIQUE NOT NULL,
  icon       TEXT,
  wall_type  TEXT NOT NULL CHECK (wall_type IN ('campus', 'confession', 'friend')),
  sort       INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- 3. 帖子表
CREATE TABLE public.posts (
  id             BIGSERIAL PRIMARY KEY,
  content        TEXT NOT NULL,
  wall_type      TEXT NOT NULL CHECK (wall_type IN ('campus', 'confession', 'friend')),
  images         JSONB DEFAULT '[]'::jsonb,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_approved    BOOLEAN NOT NULL DEFAULT false,
  view_count     INT NOT NULL DEFAULT 0,
  like_count     INT NOT NULL DEFAULT 0,
  dislike_count  INT NOT NULL DEFAULT 0,
  comment_count  INT NOT NULL DEFAULT 0,
  author_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 4. 帖子-标签关联表
CREATE TABLE public.post_tags (
  post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id  BIGINT NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- 5. 评论表（支持层级评论）
CREATE TABLE public.comments (
  id         BIGSERIAL PRIMARY KEY,
  content    TEXT NOT NULL,
  parent_id  BIGINT REFERENCES public.comments(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id    BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 6. 点赞/踩表
CREATE TABLE public.likes (
  id         BIGSERIAL PRIMARY KEY,
  type       TEXT NOT NULL CHECK (type IN ('like', 'dislike')),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id    BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 索引
-- ============================================================
CREATE INDEX idx_posts_wall_type_status ON public.posts(wall_type, status, created_at DESC);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_tags_wall_type ON public.tags(wall_type);
CREATE INDEX idx_comments_post ON public.comments(post_id, created_at);
CREATE INDEX idx_comments_parent ON public.comments(parent_id);
CREATE INDEX idx_likes_post ON public.likes(post_id);
CREATE INDEX idx_likes_user_post ON public.likes(user_id, post_id);

-- ============================================================
-- RLS 策略
-- ============================================================

-- 用户表：用户可以读取所有用户，只能更新自己的信息
CREATE POLICY "users_select" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update" ON public.users FOR UPDATE USING (id = auth.uid());

-- 帖子表：任何人可读已通过的，登录用户可创建
CREATE POLICY "posts_select_approved" ON public.posts FOR SELECT USING (status = 'approved');
CREATE POLICY "posts_insert" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 评论表：任何人可读，登录用户可创建
CREATE POLICY "comments_select" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 点赞表：任何人可读，登录用户可管理
CREATE POLICY "likes_select" ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 计数更新函数（替代数据库触发器）
-- ============================================================
CREATE OR REPLACE FUNCTION increment_view_count(post_id BIGINT)
RETURNS void AS $$
  UPDATE public.posts SET view_count = view_count + 1 WHERE id = post_id;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION increment_like_count(post_id BIGINT, delta INT)
RETURNS void AS $$
  UPDATE public.posts SET like_count = GREATEST(like_count + delta, 0) WHERE id = post_id;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION increment_dislike_count(post_id BIGINT, delta INT)
RETURNS void AS $$
  UPDATE public.posts SET dislike_count = GREATEST(dislike_count + delta, 0) WHERE id = post_id;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION increment_comment_count(post_id BIGINT, delta INT)
RETURNS void AS $$
  UPDATE public.posts SET comment_count = GREATEST(comment_count + delta, 0) WHERE id = post_id;
$$ LANGUAGE sql;

-- ============================================================
-- 种子数据
-- ============================================================

-- 管理员账号（密码: admin123）$2b$10$X/DtgycnzL6.EtBOAIkTYe1rZA7iDcLFa5/6y75KizJGVMueNJ/We
INSERT INTO public.users (username, password, nickname, role, status) VALUES
('admin', '$2b$10$X/DtgycnzL6.EtBOAIkTYe1rZA7iDcLFa5/6y75KizJGVMueNJ/We', '管理员', 'admin', 'active');

-- 演示用户（密码: user123）$2b$10$8cHrKGrX9ZU9IGY35/XT4O34IgqoOZf0l0pu6npijwb24.EliNZ5i
INSERT INTO public.users (username, password, nickname, role, status) VALUES
('demo', '$2b$10$8cHrKGrX9ZU9IGY35/XT4O34IgqoOZf0l0pu6npijwb24.EliNZ5i', 'Demo用户', 'user', 'active');

-- 标签
INSERT INTO public.tags (name, wall_type, sort) VALUES
('校园新闻', 'campus', 1),
('学习交流', 'campus', 2),
('社团活动', 'campus', 3),
('失物招领', 'campus', 4),
('表白', 'confession', 1),
('感谢', 'confession', 2),
('道歉', 'confession', 3),
('找搭子', 'friend', 1),
('兴趣群', 'friend', 2),
('运动', 'friend', 3);

-- 示例帖子
INSERT INTO public.posts (content, wall_type, author_id, status, is_approved) VALUES
('新学期开始啦！欢迎大家回到校园 🎉', 'campus', (SELECT id FROM public.users WHERE username = 'admin'), 'approved', true),
('有没有一起学摄影的同学？周末去拍照 📸', 'campus', (SELECT id FROM public.users WHERE username = 'demo'), 'approved', true),
('图书馆三楼的风景真好，适合自习 📚', 'campus', (SELECT id FROM public.users WHERE username = 'admin'), 'approved', true),
('从第一次见到你，心跳就漏了一拍 💕', 'confession', (SELECT id FROM public.users WHERE username = 'demo'), 'approved', true),
('谢谢你昨天帮我捡书，想认识你 🌸', 'confession', (SELECT id FROM public.users WHERE username = 'demo'), 'approved', true),
('找人一起打羽毛球 🏸 每周六下午', 'friend', (SELECT id FROM public.users WHERE username = 'demo'), 'approved', true),
('有没有玩原神的同学？一起讨论！', 'friend', (SELECT id FROM public.users WHERE username = 'admin'), 'approved', true);
