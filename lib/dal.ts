import { db } from '@/db'
import { getSession } from './auth'
import { eq } from 'drizzle-orm'
import { cache } from 'react'
import { issues, users } from '@/db/schema'
import { cacheTag } from 'next/cache'
import { redirect } from 'next/navigation'

// Current user (never includes the password hash)
export const getCurrentUser = cache(async () => {
  const session = await getSession()
  if (!session) {
    return null
  }

  try {
    const results = await db
      .select({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.userId))

    return results[0] || null
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return null
  }
})

// Current user, or redirect to sign in. Call this in every protected page.
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/signin')
  }
  return user
}

// Get user by email, including the password hash. Only for verifying sign-in.
export const getUserByEmail = async (email: string) => {
  try {
    const result = await db.select().from(users).where(eq(users.email, email))
    return result[0] || null
  } catch (error) {
    console.error('Error getting user by email:', error)
    return null
  }
}

export async function getIssues() {
  'use cache'
  cacheTag('issues')
  try {
    const result = await db.query.issues.findMany({
      with: {
        user: { columns: { id: true, email: true } },
      },
      orderBy: (issues, { desc }) => [desc(issues.createdAt)],
    })
    return result
  } catch (error) {
    console.error('Error fetching issues:', error)
    throw new Error('Failed to fetch issues')
  }
}

export const getIssue = async (id: number) => {
  try {
    const issue = await db.query.issues.findFirst({
      where: eq(issues.id, id),
      with: {
        user: { columns: { id: true, email: true } },
      },
    })
    return issue
  } catch (error) {
    console.error(error)
    return null
  }
}
