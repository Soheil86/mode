import 'dotenv/config'
import { hash } from 'bcrypt'
import { nanoid } from 'nanoid'
import { eq, inArray } from 'drizzle-orm'
import { db } from '../db'
import { issues, users } from '../db/schema'
import { Priority, Status } from '../lib/types'

// Safe to run on a real database: it never deletes anything, and adds the
// sample issues only the first time.
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'mode-demo-2026'
const DEMO_EMAILS = ['demo@mode.dev', 'teammate@mode.dev']

type DemoIssue = {
  title: string
  description: string
  status: Status
  priority: Priority
  owner: 'demo' | 'teammate'
  assignee?: 'demo' | 'teammate'
}

const demoIssues: DemoIssue[] = [
  {
    title: 'Ship the Kanban board',
    description: 'Drag issues between columns with optimistic updates.',
    status: 'done',
    priority: 'high',
    owner: 'demo',
    assignee: 'demo',
  },
  {
    title: 'Add search and URL filters',
    description: 'Filters live in the URL so a view can be shared by link.',
    status: 'done',
    priority: 'medium',
    owner: 'demo',
    assignee: 'teammate',
  },
  {
    title: 'Write end-to-end tests for permissions',
    description: 'Cover owner-only edit and delete with two real sessions.',
    status: 'in_progress',
    priority: 'high',
    owner: 'teammate',
    assignee: 'demo',
  },
  {
    title: 'Improve keyboard navigation',
    description: 'Add shortcuts for creating, searching and switching views.',
    status: 'in_progress',
    priority: 'medium',
    owner: 'demo',
    assignee: 'teammate',
  },
  {
    title: 'Audit color contrast in dark mode',
    description: 'Check badges and secondary text against WCAG AA.',
    status: 'todo',
    priority: 'medium',
    owner: 'teammate',
    assignee: 'teammate',
  },
  {
    title: 'Fix focus ring on the sidebar',
    description: 'The ring is clipped when the sidebar is collapsed.',
    status: 'todo',
    priority: 'low',
    owner: 'demo',
  },
  {
    title: 'Add rate limiting to sign-in',
    description: 'Slow down repeated password attempts.',
    status: 'backlog',
    priority: 'high',
    owner: 'demo',
  },
  {
    title: 'Comments on issues',
    description: 'Let teammates discuss an issue without leaving the app.',
    status: 'backlog',
    priority: 'low',
    owner: 'teammate',
  },
]

async function main() {
  const password = await hash(DEMO_PASSWORD, 10)

  await db
    .insert(users)
    .values(DEMO_EMAILS.map((email) => ({ id: nanoid(), email, password })))
    .onConflictDoNothing({ target: users.email })

  const accounts = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(inArray(users.email, DEMO_EMAILS))

  const idOf = (name: 'demo' | 'teammate') =>
    accounts.find((account) => account.email.startsWith(name))!.id

  const existing = await db
    .select({ id: issues.id })
    .from(issues)
    .where(eq(issues.userId, idOf('demo')))
    .limit(1)

  if (existing.length > 0) {
    console.log('Demo issues already exist, nothing to add')
    return
  }

  await db.insert(issues).values(
    demoIssues.map(({ owner, assignee, ...issue }) => ({
      ...issue,
      userId: idOf(owner),
      assigneeId: assignee ? idOf(assignee) : null,
    })),
  )

  console.log(`Added ${demoIssues.length} demo issues`)
  console.log(`Sign in as ${DEMO_EMAILS[0]} with the demo password`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
