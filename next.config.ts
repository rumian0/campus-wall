import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Images CDN 域名
    remotePatterns: [
      { protocol: 'https', hostname: 'pub-*.r2.dev' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  // 启用 React Strict Mode
  reactStrictMode: true,
  // 压缩
  compress: true,
  // 实验性功能
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/*'],
  },
}

export default nextConfig
