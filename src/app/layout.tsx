import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CampusWall 校园时光墙',
  description: '校园社交平台 - 分享校园生活的每一个精彩瞬间',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#0a0a1a" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
