import { z } from 'zod'
import { PRIORITY_VALUES, STATUS_VALUES } from './constants'

export const IssueStatusSchema = z.enum(STATUS_VALUES, {
  error: 'Please select a valid status',
})

export const IssueSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),

  description: z.string().optional().nullable(),

  status: IssueStatusSchema,

  priority: z.enum(PRIORITY_VALUES, {
    error: 'Please select a valid priority',
  }),

  assigneeId: z.string().min(1).optional().nullable(),
})

export type IssueData = z.infer<typeof IssueSchema>

// Issue ids are Postgres integers, so anything outside that range can't exist
export const IssueIdSchema = z.coerce
  .number()
  .int()
  .positive()
  .max(2147483647)

// Anyone can edit the URL, so invalid values fall back instead of throwing
export const IssueFiltersSchema = z.object({
  q: z.string().trim().max(100).optional().catch(undefined),
  status: z.enum(STATUS_VALUES).optional().catch(undefined),
  priority: z.enum(PRIORITY_VALUES).optional().catch(undefined),
  assignee: z.string().min(1).max(64).optional().catch(undefined),
  page: z.coerce.number().int().positive().max(100000).catch(1),
  view: z.enum(['list', 'board']).catch('list'),
})

export type IssueFilters = z.infer<typeof IssueFiltersSchema>
