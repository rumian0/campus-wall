# CampusWall 校园时光墙 - 部署文档

## 一、GitHub 仓库初始化

```bash
cd wall
git init
git add -A
git commit -m "feat: init CampusWall - Next.js 15 + Supabase"
git remote add origin https://github.com/rumian0/campus-wall.git
git branch -M main
git push -u origin main
```

## 二、Supabase 数据库配置

1. 登录 [supabase.com](https://supabase.com) → 新建项目
2. 进入 SQL Editor → 粘贴 `scripts/seed.sql` 全部内容 → 运行
3. 获取连接信息：
   - 项目 Settings → API → `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - 项目 Settings → API → `anon public`
   -  (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - 项目 Settings → API → `service_role` (SUPABASE_SERVICE_ROLE_KEY)

## 三、Vercel 一键部署

1. 登录 [vercel.com](https://vercel.com) → Import Git Repository
2. 选择 `campus-wall` 仓库
3. Framework Preset 自动识别为 **Next.js**
4. 添加环境变量：

| 变量名 | 说明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
| `AUTH_SECRET` | 随机字符串 (openssl rand -base64 32) |
| `AUTH_URL` | 设为 `https://你的域名.vercel.app` |
| `CLOUDFLARE_IMAGES_TOKEN` | Cloudflare Images API Token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账号 ID |

5. 点击 Deploy，等待完成

## 四、Cloudflare Images 配置（可选，图片上传用）

1. 登录 Cloudflare Dashboard → Images
2. 创建新的 Images 桶
3. 生成 API Token（权限：Images:Write）
4. 在 Vercel 环境变量中设置 `CLOUDFLARE_IMAGES_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`

## 五、Upstash Redis 配置（可选，缓存用）

1. 登录 [upstash.com](https://upstash.com) → 创建 Redis 数据库
2. 获取 `UPSTASH_REDIS_URL` 和 `UPSTASH_REDIS_TOKEN`
3. 在 Vercel 环境变量中设置

## 六、Cloudflare Pages 部署（可选替代方案）

1. 登录 Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
2. 选择仓库
3. 构建设置：
   - Framework: Next.js (static HTML export)
   - Build command: `npx next build && npx next export`
   - Build output: `out/`
4. 环境变量同上
5. ⚠️ 注意：Cloudflare Pages 部署需要静态导出，不支持 Server Actions 和 API Routes，推荐使用 Vercel

## 七、本地开发

```bash
# 安装依赖
pnpm install

# 复制环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的 Supabase 配置

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

## 八、环境变量完整清单

```env
# Supabase（必填）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# NextAuth（必填）
AUTH_SECRET=your-random-secret-at-least-32-chars
AUTH_URL=http://localhost:3000

# Cloudflare Images（可选）
CLOUDFLARE_IMAGES_TOKEN=xxx
CLOUDFLARE_ACCOUNT_ID=xxx

# Upstash Redis（可选）
UPSTASH_REDIS_URL=https://xxx.upstash.io
UPSTASH_REDIS_TOKEN=xxx
```

## 九、测试账号（种子数据）

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| demo | user123 | 普通用户 |
