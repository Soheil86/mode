'use server'

import { db } from '@/db'
import { issues } from '@/db/schema'
import { and, eq, or } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/dal'
import { Status } from '@/lib/types'
import {
  IssueSchema,
  IssueStatusSchema,
  type IssueData,
} from '@/lib/validation'
import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  error?: string
}

const UNAUTHORIZED_RESPONSE: ActionResponse = {
  success: false,
  message: 'Unauthorized access',
  error: 'Unauthorized',
}

const NOT_ALLOWED_RESPONSE: ActionResponse = {
  success: false,
  message: 'Issue not found, or you do not have permission to change it',
  error: 'Forbidden',
}

export async function createIssue(data: IssueData): Promise<ActionResponse> {
  try {
    // Security check - ensure user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return UNAUTHORIZED_RESPONSE
    }
    // Validate with Zod
    const validationResult = IssueSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }
    // The owner always comes from the session, never from the browser
    await db.insert(issues).values({
      ...validationResult.data,
      userId: user.id,
    })

    updateTag('issues')
  } catch (error) {
    console.error('Error creating issue:', error)
    return {
      success: false,
      message: 'An error occurred while creating the issue',
      error: 'Failed to create issue',
    }
  }

  // Outside the try: redirect() works by throwing, so catch would swallow it
  redirect('/dashboard')
}

export async function updateIssue(
  id: number,
  data: Partial<IssueData>,
): Promise<ActionResponse> {
  try {
    // Security check - ensure user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return UNAUTHORIZED_RESPONSE
    }

    // Allow partial validation for updates
    const validationResult = IssueSchema.partial().safeParse(data)

    if (!validationResult.success) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    // Only matches when the signed-in user owns this issue
    const updated = await db
      .update(issues)
      .set({ ...validationResult.data, updatedAt: new Date() })
      .where(and(eq(issues.id, id), eq(issues.userId, user.id)))
      .returning()

    if (updated.length === 0) {
      return NOT_ALLOWED_RESPONSE
    }

    updateTag('issues')
  } catch (error) {
    console.error('Error updating issue:', error)
    return {
      success: false,
      message: 'An error occurred while updating the issue',
      error: 'Failed to update issue',
    }
  }

  // Outside the try: redirect() works by throwing, so catch would swallow it
  redirect('/dashboard')
}

// Used by the board. The assignee can move an issue, but only the owner can
// edit its details or delete it.
export async function moveIssue(
  id: number,
  status: Status,
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return UNAUTHORIZED_RESPONSE
    }

    const validationResult = IssueStatusSchema.safeParse(status)
    if (!validationResult.success) {
      return { success: false, message: 'Please select a valid status' }
    }

    const updated = await db
      .update(issues)
      .set({ status: validationResult.data, updatedAt: new Date() })
      .where(
        and(
          eq(issues.id, id),
          or(eq(issues.userId, user.id), eq(issues.assigneeId, user.id)),
        ),
      )
      .returning()

    if (updated.length === 0) {
      return NOT_ALLOWED_RESPONSE
    }

    updateTag('issues')
    return { success: true, message: 'Issue moved' }
  } catch (error) {
    console.error('Error moving issue:', error)
    return {
      success: false,
      message: 'An error occurred while moving the issue',
      error: 'Failed to move issue',
    }
  }
}

export async function deleteIssue(id: number): Promise<ActionResponse> {
  try {
    // Security check - ensure user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return UNAUTHORIZED_RESPONSE
    }

    // Only matches when the signed-in user owns this issue
    const deleted = await db
      .delete(issues)
      .where(and(eq(issues.id, id), eq(issues.userId, user.id)))
      .returning()

    if (deleted.length === 0) {
      return NOT_ALLOWED_RESPONSE
    }

    updateTag('issues')
    return { success: true, message: 'Issue deleted successfully' }
  } catch (error) {
    console.error('Error deleting issue:', error)
    return {
      success: false,
      message: 'An error occurred while deleting the issue',
      error: 'Failed to delete issue',
    }
  }
}
