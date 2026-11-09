import { db } from '@/db'
import { getSession } from './auth'
import { and, count, desc, eq, ilike, isNull, or } from 'drizzle-orm'
import { cache } from 'react'
import { issues, users } from '@/db/schema'
import { cacheTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { Priority, Status } from './types'

const publicUserColumns = { id: true, email: true } as const

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

// Everyone an issue can be assigned to
export async function getUsers() {
  'use cache'
  cacheTag('users')

  return db.query.users.findMany({
    columns: publicUserColumns,
    orderBy: (users, { asc }) => [asc(users.email)],
  })
}

type IssueQuery = {
  q?: string
  status?: Status
  priority?: Priority
  // A user id, or 'unassigned'
  assignee?: string
  limit: number
  offset: number
}

function buildIssueFilter({ q, status, priority, assignee }: IssueQuery) {
  // % and _ are wildcards in ILIKE, so a search for "100%" must escape them
  const pattern = q ? `%${q.replace(/[\\%_]/g, '\\$&')}%` : undefined

  return and(
    pattern
      ? or(ilike(issues.title, pattern), ilike(issues.description, pattern))
      : undefined,
    status ? eq(issues.status, status) : undefined,
    priority ? eq(issues.priority, priority) : undefined,
    assignee === 'unassigned'
      ? isNull(issues.assigneeId)
      : assignee
        ? eq(issues.assigneeId, assignee)
        : undefined,
  )
}

export async function getIssues(query: IssueQuery) {
  'use cache'
  cacheTag('issues')

  try {
    const where = buildIssueFilter(query)

    const [rows, [{ total }]] = await Promise.all([
      db.query.issues.findMany({
        where,
        with: { assignee: { columns: publicUserColumns } },
        // id breaks ties, so paging stays stable for issues created together
        orderBy: [desc(issues.createdAt), desc(issues.id)],
        limit: query.limit,
        offset: query.offset,
      }),
      db.select({ total: count() }).from(issues).where(where),
    ])

    return { issues: rows, total }
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
        user: { columns: publicUserColumns },
        assignee: { columns: publicUserColumns },
      },
    })
    return issue
  } catch (error) {
    console.error(error)
    return null
  }
}
