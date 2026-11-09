import { db } from '@/db'
import { issues } from '@/db/schema'
import { getCurrentUser } from '@/lib/dal'
import { IssueSchema } from '@/lib/validation'
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const allIssues = await db.query.issues.findMany()
    return NextResponse.json(allIssues)
  } catch (error) {
    console.error('Error fetching issues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => null)
    const validationResult = IssueSchema.safeParse({
      status: 'backlog',
      priority: 'medium',
      ...body,
    })

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      )
    }

    // The owner always comes from the session, never from the request body
    const newIssue = await db
      .insert(issues)
      .values({ ...validationResult.data, userId: user.id })
      .returning()

    revalidateTag('issues', { expire: 0 })

    return NextResponse.json(
      { message: 'Issue created successfully', issue: newIssue[0] },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error creating issue:', error)
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 },
    )
  }
}
