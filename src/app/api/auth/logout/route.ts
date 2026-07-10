import { NextResponse } from 'next/server'
import { clearSessionCookieOnResponse } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function POST() {
  const response = NextResponse.json({ success: true })
  return clearSessionCookieOnResponse(response)
}
