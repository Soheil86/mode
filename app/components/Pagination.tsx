import Link from 'next/link'
import { PAGE_SIZE } from '@/lib/constants'
import { issuesHref } from '@/lib/utils'
import { IssueFilters } from '@/lib/validation'
import { buttonStyles } from './ui/Button'

export default function Pagination({
  filters,
  total,
}: {
  filters: IssueFilters
  total: number
}) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  if (totalPages <= 1) return null

  const { page } = filters
  const linkClass = buttonStyles({ variant: 'outline', size: 'sm' })

  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex items-center justify-between"
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {page > 1 && (
          <Link
            href={issuesHref({ ...filters, page: page - 1 })}
            className={linkClass}
          >
            Previous
          </Link>
        )}
        {page < totalPages && (
          <Link
            href={issuesHref({ ...filters, page: page + 1 })}
            className={linkClass}
          >
            Next
          </Link>
        )}
      </div>
    </nav>
  )
}
