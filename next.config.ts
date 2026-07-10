import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Images CDN 域名
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudflare.com' },
      { protocol: 'https', hostname: 'imagedelivery.net' },
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
