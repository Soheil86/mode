import { getIssue, requireUser } from '@/lib/dal'
import { displayName, formatRelativeTime } from '@/lib/utils'
import { ISSUE_PRIORITY, ISSUE_STATUS } from '@/lib/constants'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Badge from '@/app/components/ui/Badge'
import { buttonStyles } from '@/app/components/ui/Button'
import { ArrowLeftIcon, Edit2Icon } from 'lucide-react'
import DeleteIssueButton from '../../components/DeleteIssueButton'

export default async function IssuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const currentUser = await requireUser()
  const { id } = await params
  const issue = await getIssue(parseInt(id))

  if (!issue) {
    notFound()
  }

  const {
    title,
    description,
    status,
    priority,
    createdAt,
    updatedAt,
    user,
    assignee,
  } = issue

  const statusLabel = ISSUE_STATUS[status].label
  const priorityLabel = ISSUE_PRIORITY[priority].label
  const wasUpdated =
    new Date(updatedAt).getTime() !== new Date(createdAt).getTime()

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeftIcon size={16} className="mr-1" aria-hidden="true" />
          Back to Issues
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">{title}</h1>
          {issue.userId === currentUser.id && (
            <div className="flex items-center space-x-2">
              <Link
                href={`/issues/${id}/edit`}
                className={buttonStyles({ variant: 'outline', size: 'sm' })}
              >
                <Edit2Icon size={16} className="mr-1" aria-hidden="true" />
                Edit
              </Link>
              <DeleteIssueButton id={parseInt(id)} />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border-default rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-wrap gap-3 mb-6">
          <Badge status={status}>{statusLabel}</Badge>
          <Badge priority={priority}>{priorityLabel}</Badge>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Created {formatRelativeTime(new Date(createdAt))}
          </div>
          {wasUpdated && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Updated {formatRelativeTime(new Date(updatedAt))}
            </div>
          )}
        </div>

        {description ? (
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-line">{description}</p>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">
            No description provided.
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border-default rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-2">Details</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Detail label="Assigned to">
            {assignee ? displayName(assignee.email) : 'Unassigned'}
          </Detail>
          <Detail label="Created by">{displayName(user.email)}</Detail>
          <Detail label="Status">
            <Badge status={status}>{statusLabel}</Badge>
          </Detail>
          <Detail label="Priority">
            <Badge priority={priority}>{priorityLabel}</Badge>
          </Detail>
        </dl>
      </div>
    </main>
  )
}

function Detail({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  )
}
