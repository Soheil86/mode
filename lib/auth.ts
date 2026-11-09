import { compare, hash } from 'bcrypt'
import { nanoid } from 'nanoid'
import { cookies } from 'next/headers'
import { db } from '@/db'
import { users } from '@/db/schema'
import * as jose from 'jose'
import { cache } from 'react'

// JWT types
interface JWTPayload {
  userId: string
  [key: string]: string | number | boolean | null | undefined
}

// Secret key for JWT signing. There is deliberately no fallback value: a
// default secret would let anyone forge a session.
function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to at least 32 characters')
  }
  return new TextEncoder().encode(secret)
}

// JWT expiration time
const JWT_EXPIRATION = '7d' // 7 days

// Hash a password
export async function hashPassword(password: string) {
  return hash(password, 10)
}

// Verify a password
export async function verifyPassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword)
}

// Create a new user
export async function createUser(email: string, password: string) {
  const hashedPassword = await hashPassword(password)
  const id = nanoid()

  try {
    await db.insert(users).values({
      id,
      email,
      password: hashedPassword,
    })

    return { id, email }
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

// Generate a JWT token
export async function generateJWT(payload: JWTPayload) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(getJwtSecret())
}

// Verify a JWT token
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  // Outside the try so a missing secret is a clear error, not a silent logout
  const secret = getJwtSecret()

  try {
    const { payload } = await jose.jwtVerify(token, secret)
    return payload as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Create a session using JWT
export async function createSession(userId: string) {
  // Create JWT with user data
  const token = await generateJWT({ userId })

  // Store JWT in a cookie
  const cookieStore = await cookies()
  cookieStore.set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
    sameSite: 'lax',
  })
}

// Get current session from JWT
export const getSession = cache(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null
  const payload = await verifyJWT(token)

  return payload ? { userId: payload.userId } : null
})

// Delete session by clearing the JWT cookie
export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
}
