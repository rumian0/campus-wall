import { NextResponse } from 'next/server'
import { setSessionCookieOnResponse } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST() {
  const guestUser = {
    id: 'guest',
    name: '游客',
    role: 'guest',
  }
  const response = NextResponse.json({ success: true, user: guestUser })
  return setSessionCookieOnResponse(response, guestUser)
}
