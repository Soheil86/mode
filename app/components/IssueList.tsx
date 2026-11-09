import Link from 'next/link'
import Badge from './ui/Badge'
import { ISSUE_PRIORITY, ISSUE_STATUS } from '@/lib/constants'
import { displayName, formatRelativeTime } from '@/lib/utils'
import { Issue } from '@/db/schema'

type IssueRow = Issue & { assignee: { email: string } | null }

export default function IssueList({ issues }: { issues: IssueRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-dark-border-default bg-white dark:bg-dark-high shadow-sm">
      <div
        aria-hidden="true"
        className="grid grid-cols-8 md:grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-elevated border-b border-gray-200 dark:border-dark-border-default"
      >
        <div className="col-span-4">Title</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Priority</div>
        <div className="hidden md:block col-span-2">Assignee</div>
        <div className="hidden md:block col-span-2">Created</div>
      </div>

      <ul className="divide-y divide-gray-200 dark:divide-dark-border-default">
        {issues.map((issue) => (
          <li key={issue.id}>
            <Link
              href={`/issues/${issue.id}`}
              className="block hover:bg-gray-50 dark:hover:bg-dark-elevated transition-colors"
            >
              <div className="grid grid-cols-8 md:grid-cols-12 gap-4 px-6 py-4 items-center">
                <div className="col-span-4 font-medium truncate">
                  {issue.title}
                </div>
                <div className="col-span-2">
                  <Badge status={issue.status}>
                    {ISSUE_STATUS[issue.status].label}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Badge priority={issue.priority}>
                    {ISSUE_PRIORITY[issue.priority].label}
                  </Badge>
                </div>
                <div className="hidden md:block col-span-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                  {issue.assignee
                    ? displayName(issue.assignee.email)
                    : 'Unassigned'}
                </div>
                <div className="hidden md:block col-span-2 text-sm text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(new Date(issue.createdAt))}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
