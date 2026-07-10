import { NextResponse } from 'next/server'
import { setSessionCookie } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST() {
  const guestUser = {
    id: 'guest',
    name: '游客',
    role: 'guest',
  }
  await setSessionCookie(guestUser)
  return NextResponse.json({ success: true, user: guestUser })
}
