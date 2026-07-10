import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const COOKIE_NAME = 'wall_session'
const SECRET = process.env.AUTH_SECRET!

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60,
}

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey(
    'raw', enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign', 'verify'],
  )
}

function toBase64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64url(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  const p = str.length % 4 ? 4 - str.length % 4 : 0
  return Uint8Array.from(atob(str + '='.repeat(p)), (c) => c.charCodeAt(0))
}

export interface SessionUser {
  id: string
  name: string
  role: string
}

export async function createToken(user: SessionUser): Promise<string> {
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 30 * 24 * 60 * 60
  const header = toBase64url(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const body = toBase64url(new TextEncoder().encode(JSON.stringify({ ...user, iat, exp })))
  const key = await getKey()
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(header + '.' + body))
  return header + '.' + body + '.' + toBase64url(sig)
}

export async function verifyToken(token: string): Promise<(SessionUser & { iat: number; exp: number }) | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, sig] = parts
  const key = await getKey()
  const valid = await crypto.subtle.verify('HMAC', key, fromBase64url(sig), new TextEncoder().encode(header + '.' + body))
  if (!valid) return null
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64url(body)))
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch { return null }
}

/** 将 JWT 令牌设置为 cookie */
export async function setSessionCookie(user: SessionUser) {
  const token = await createToken(user)
  const store = await cookies()
  store.set(COOKIE_NAME, token, COOKIE_OPTIONS)
}

/** 在 NextResponse 上设置 session cookie（推荐用于 route handler） */
export async function setSessionCookieOnResponse(response: NextResponse, user: SessionUser) {
  const token = await createToken(user)
  response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS)
  return response
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.set(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 })
}

/** 在 NextResponse 上清除 session cookie */
export function clearSessionCookieOnResponse(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 })
  return response
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null
  return { id: payload.id, name: payload.name, role: payload.role }
}
