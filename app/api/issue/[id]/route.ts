import { NextResponse } from 'next/server'
import { db } from '@/db'
import { issues } from '@/db/schema'
import { getCurrentUser } from '@/lib/dal'
import { IssueIdSchema } from '@/lib/validation'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsedId = IssueIdSchema.safeParse((await params).id)
  if (!parsedId.success) {
    return NextResponse.json({ error: 'Invalid issue id' }, { status: 400 })
  }

  try {
    const issue = await db.query.issues.findFirst({
      where: eq(issues.id, parsedId.data),
    })

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    return NextResponse.json(issue)
  } catch (error) {
    console.error('Error fetching issue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issue' },
      { status: 500 },
    )
  }
}
