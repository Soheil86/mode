import { InferSelectModel, relations } from 'drizzle-orm'
import { pgTable, serial, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { PRIORITY_VALUES, STATUS_VALUES } from '../lib/constants'

// Enums for issue status and priority
export const statusEnum = pgEnum('status', STATUS_VALUES)
export const priorityEnum = pgEnum('priority', PRIORITY_VALUES)

// Issues table
export const issues = pgTable('issues', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: statusEnum('status').default('backlog').notNull(),
  priority: priorityEnum('priority').default('medium').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // The person who created the issue, and who controls it
  userId: text('user_id').notNull(),
  // The person working on it, if anyone
  assigneeId: text('assignee_id').references(() => users.id, {
    onDelete: 'set null',
  }),
})

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations between tables
export const issuesRelations = relations(issues, ({ one }) => ({
  user: one(users, {
    fields: [issues.userId],
    references: [users.id],
    relationName: 'creator',
  }),
  assignee: one(users, {
    fields: [issues.assigneeId],
    references: [users.id],
    relationName: 'assignee',
  }),
}))

export const usersRelations = relations(users, ({ many }) => ({
  issues: many(issues, { relationName: 'creator' }),
  assignedIssues: many(issues, { relationName: 'assignee' }),
}))

// Types
export type Issue = InferSelectModel<typeof issues>
export type User = InferSelectModel<typeof users>
