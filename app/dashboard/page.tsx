import { getIssues, getUsers, requireUser } from '@/lib/dal'
import Link from 'next/link'
import { buttonStyles } from '../components/ui/Button'
import { PlusIcon } from 'lucide-react'
import { BOARD_LIMIT, PAGE_SIZE } from '@/lib/constants'
import { IssueFiltersSchema } from '@/lib/validation'
import IssueFilters from '../components/IssueFilters'
import IssueList from '../components/IssueList'
import IssueBoard from '../components/IssueBoard'
import Pagination from '../components/Pagination'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const currentUser = await requireUser()
  const filters = IssueFiltersSchema.parse(await searchParams)
  const isBoard = filters.view === 'board'

  const [{ issues, total }, users] = await Promise.all([
    getIssues({
      q: filters.q,
      // The board's columns are the statuses, so it always shows all of them
      status: isBoard ? undefined : filters.status,
      priority: filters.priority,
      assignee: filters.assignee === 'me' ? currentUser.id : filters.assignee,
      limit: isBoard ? BOARD_LIMIT : PAGE_SIZE,
      offset: isBoard ? 0 : (filters.page - 1) * PAGE_SIZE,
    }),
    getUsers(),
  ])

  const hasFilters = Boolean(
    filters.q || filters.status || filters.priority || filters.assignee,
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Issues</h1>
        <Link href="/issues/new" className={buttonStyles()}>
          <PlusIcon size={18} className="mr-2" aria-hidden="true" />
          New Issue
        </Link>
      </div>

      <IssueFilters filters={filters} users={users} />

      {isBoard ? (
        <IssueBoard
          currentUserId={currentUser.id}
          truncated={total > issues.length}
          issues={issues.map((issue) => ({
            id: issue.id,
            title: issue.title,
            status: issue.status,
            priority: issue.priority,
            userId: issue.userId,
            assigneeId: issue.assigneeId,
            assigneeEmail: issue.assignee?.email ?? null,
          }))}
        />
      ) : issues.length > 0 ? (
        <>
          <IssueList issues={issues} />
          <Pagination filters={filters} total={total} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-gray-200 dark:border-dark-border-default rounded-lg bg-white dark:bg-dark-high p-8">
          <h2 className="text-lg font-medium mb-2">
            {hasFilters ? 'No matching issues' : 'No issues found'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {hasFilters
              ? 'Try a different search or clear your filters.'
              : 'Get started by creating your first issue.'}
          </p>
          <Link
            href={hasFilters ? '/dashboard' : '/issues/new'}
            className={buttonStyles()}
          >
            {hasFilters ? 'Clear filters' : 'Create Issue'}
          </Link>
        </div>
      )}
    </div>
  )
}
