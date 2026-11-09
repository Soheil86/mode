import { z } from 'zod'

export const IssueSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),

  description: z.string().optional().nullable(),

  status: z.enum(['backlog', 'todo', 'in_progress', 'done'], {
    error: 'Please select a valid status',
  }),

  priority: z.enum(['low', 'medium', 'high'], {
    error: 'Please select a valid priority',
  }),
})

export type IssueData = z.infer<typeof IssueSchema>

// Issue ids are Postgres integers, so anything outside that range can't exist
export const IssueIdSchema = z.coerce
  .number()
  .int()
  .positive()
  .max(2147483647)
