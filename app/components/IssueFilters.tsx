'use client'

import { useEffect, useOptimistic, useRef, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { KanbanIcon, ListIcon, SearchIcon } from 'lucide-react'
import { ISSUE_PRIORITY, ISSUE_STATUS } from '@/lib/constants'
import { UserOption } from '@/lib/types'
import { cn, displayName, issuesHref } from '@/lib/utils'
import { IssueFilters as Filters } from '@/lib/validation'
import { FormInput, FormLabel, FormSelect } from './ui/Form'
import { useHotkeys } from './useHotkeys'

const SEARCH_DELAY_MS = 300

type FilterValues = Omit<Filters, 'page'>

export default function IssueFilters({
  filters,
  users,
}: {
  filters: FilterValues
  users: UserOption[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  // Controls show the new value at once, before the server has responded
  const [current, setCurrent] = useOptimistic<FilterValues>(filters)
  const searchRef = useRef<HTMLInputElement>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(searchTimer.current), [])

  // Catches URL changes from elsewhere, like "Clear" or the back button,
  // without overwriting what someone is in the middle of typing
  useEffect(() => {
    if (searchRef.current && document.activeElement !== searchRef.current) {
      searchRef.current.value = filters.q ?? ''
    }
  }, [filters.q])

  function update(changes: Partial<FilterValues>) {
    const next = { ...current, ...changes }

    // Any change can shrink the results, so always go back to the first page
    startTransition(() => {
      setCurrent(next)
      router.replace(issuesHref(next), { scroll: false })
    })
  }

  function handleSearch(value: string) {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(
      () => update({ q: value || undefined }),
      SEARCH_DELAY_MS,
    )
  }

  useHotkeys({
    l: () => update({ view: 'list' }),
    b: () => update({ view: 'board' }),
  })

  const isBoard = current.view === 'board'
  const hasFilters = Boolean(
    current.q || current.status || current.priority || current.assignee,
  )

  const viewLinkClass = (active: boolean) =>
    cn(
      'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
      active
        ? 'bg-white text-gray-900 shadow-sm dark:bg-dark-border-default dark:text-white'
        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
    )

  return (
    <section aria-label="Filter issues" aria-busy={isPending} className="mb-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px] space-y-1">
          <FormLabel htmlFor="issue-search">Search</FormLabel>
          <div className="relative">
            <SearchIcon
              size={16}
              aria-hidden="true"
              className="absolute left-3 top-3 text-gray-400"
            />
            <FormInput
              ref={searchRef}
              id="issue-search"
              type="search"
              placeholder="Search title or description"
              defaultValue={filters.q ?? ''}
              onChange={(event) => handleSearch(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {!isBoard && (
          <div className="w-36 space-y-1">
            <FormLabel htmlFor="filter-status">Status</FormLabel>
            <FormSelect
              id="filter-status"
              value={current.status ?? ''}
              onChange={(event) =>
                update({
                  status: (event.target.value ||
                    undefined) as FilterValues['status'],
                })
              }
              options={[
                { label: 'All', value: '' },
                ...Object.values(ISSUE_STATUS),
              ]}
            />
          </div>
        )}

        <div className="w-36 space-y-1">
          <FormLabel htmlFor="filter-priority">Priority</FormLabel>
          <FormSelect
            id="filter-priority"
            value={current.priority ?? ''}
            onChange={(event) =>
              update({
                priority: (event.target.value ||
                  undefined) as FilterValues['priority'],
              })
            }
            options={[
              { label: 'All', value: '' },
              ...Object.values(ISSUE_PRIORITY),
            ]}
          />
        </div>

        <div className="w-44 space-y-1">
          <FormLabel htmlFor="filter-assignee">Assignee</FormLabel>
          <FormSelect
            id="filter-assignee"
            value={current.assignee ?? ''}
            onChange={(event) =>
              update({ assignee: event.target.value || undefined })
            }
            options={[
              { label: 'Everyone', value: '' },
              { label: 'Assigned to me', value: 'me' },
              { label: 'Unassigned', value: 'unassigned' },
              ...users.map((user) => ({
                label: displayName(user.email),
                value: user.id,
              })),
            ]}
          />
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              clearTimeout(searchTimer.current)
              if (searchRef.current) searchRef.current.value = ''
              update({
                q: undefined,
                status: undefined,
                priority: undefined,
                assignee: undefined,
              })
            }}
            className="h-10 px-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Clear
          </button>
        )}

        <div className="ml-auto flex rounded-lg bg-gray-100 p-1 dark:bg-dark-elevated">
          <Link
            href={issuesHref({ ...current, view: 'list' })}
            aria-current={!isBoard ? 'page' : undefined}
            className={viewLinkClass(!isBoard)}
          >
            <ListIcon size={16} aria-hidden="true" />
            List
          </Link>
          <Link
            href={issuesHref({ ...current, view: 'board' })}
            aria-current={isBoard ? 'page' : undefined}
            className={viewLinkClass(isBoard)}
          >
            <KanbanIcon size={16} aria-hidden="true" />
            Board
          </Link>
        </div>
      </div>
    </section>
  )
}
