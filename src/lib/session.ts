import { cookies } from 'next/headers'

const COOKIE_NAME = 'wall_session'
const SECRET = process.env.AUTH_SECRET!

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

export async function setSessionCookie(user: SessionUser) {
  const token = await createToken(user)
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', path: '/',
    maxAge: 30 * 24 * 60 * 60,
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.set(COOKIE_NAME, '', {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', path: '/', maxAge: 0,
  })
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null
  return { id: payload.id, name: payload.name, role: payload.role }
}
