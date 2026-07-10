import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { createServerSupabase } from './supabase/server'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: '用户名', type: 'text' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const supabase = await createServerSupabase()
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('username', credentials.username as string)
          .single()

        if (!user) return null
        if (user.status === 'banned') return null

        // 使用 bcryptjs 验证密码
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        )
        if (!isValid) return null

        return {
          id: user.id,
          name: user.nickname,
          email: user.email ?? undefined,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        ;(session.user as any).role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: { strategy: 'jwt' },
  trustHost: true,
})
