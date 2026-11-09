'use client'

import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react'
import Link from 'next/link'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { GripVerticalIcon, LockIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { moveIssue } from '@/app/actions/issues'
import {
  BOARD_LIMIT,
  ISSUE_PRIORITY,
  ISSUE_STATUS,
  STATUS_VALUES,
} from '@/lib/constants'
import { Priority, Status } from '@/lib/types'
import { cn, displayName } from '@/lib/utils'
import Badge from './ui/Badge'

export type BoardIssue = {
  id: number
  title: string
  status: Status
  priority: Priority
  userId: string
  assigneeId: string | null
  assigneeEmail: string | null
}

type MoveHandler = (issue: BoardIssue, status: Status) => void

export default function IssueBoard({
  issues,
  currentUserId,
  truncated,
}: {
  issues: BoardIssue[]
  currentUserId: string
  truncated: boolean
}) {
  // Cards move as soon as they're dropped. If the server rejects the move, this
  // falls back to the server's data and the card returns to its column.
  const [optimisticIssues, applyMove] = useOptimistic(
    issues,
    (state, { id, status }: { id: number; status: Status }) =>
      state.map((issue) => (issue.id === id ? { ...issue, status } : issue)),
  )
  const [, startTransition] = useTransition()
  const [activeId, setActiveId] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const refocusId = useRef<number | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    // The delay leaves a normal swipe free to scroll the page
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  )

  // A moved card is re-created in its new column, so focus has to be restored
  useEffect(() => {
    if (refocusId.current === null) return

    document
      .querySelector<HTMLElement>(`[data-move-handle="${refocusId.current}"]`)
      ?.focus()
    refocusId.current = null
  }, [optimisticIssues])

  const move: MoveHandler = (issue, status) => {
    setAnnouncement(`Moved ${issue.title} to ${ISSUE_STATUS[status].label}`)

    startTransition(async () => {
      applyMove({ id: issue.id, status })

      // A network failure rejects, while a refused move returns a message
      const result = await moveIssue(issue.id, status).catch(() => null)

      if (!result?.success) {
        toast.error(result?.message ?? 'Could not reach the server')
        setAnnouncement(`Could not move ${issue.title}`)
      }
    })
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)

    const issue = optimisticIssues.find(({ id }) => id === active.id)
    const status = over?.id as Status | undefined

    if (issue && status && issue.status !== status) {
      move(issue, status)
    }
  }

  function handleKeyboardMove(issue: BoardIssue, direction: -1 | 1) {
    const status =
      STATUS_VALUES[STATUS_VALUES.indexOf(issue.status) + direction]

    if (status) {
      refocusId.current = issue.id
      move(issue, status)
    }
  }

  const canMove = (issue: BoardIssue) =>
    issue.userId === currentUserId || issue.assigneeId === currentUserId
  const activeIssue = optimisticIssues.find(({ id }) => id === activeId)

  return (
    <DndContext
      // A fixed id keeps server and browser markup identical
      id="issue-board"
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={({ active }) => setActiveId(Number(active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {truncated && (
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Showing the {BOARD_LIMIT} most recent issues. Use search or filters to
          narrow them down.
        </p>
      )}

      <div className="grid grid-flow-col auto-cols-[minmax(240px,1fr)] gap-4 overflow-x-auto scrollbar-thin pb-2">
        {STATUS_VALUES.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            issues={optimisticIssues.filter(
              (issue) => issue.status === status,
            )}
            canMove={canMove}
            onKeyboardMove={handleKeyboardMove}
          />
        ))}
      </div>

      <DragOverlay>
        {activeIssue && (
          <div className="rotate-2 rounded-lg border border-purple-400 bg-white p-3 shadow-lg dark:bg-dark-high">
            <span className="text-sm font-medium">{activeIssue.title}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

function BoardColumn({
  status,
  issues,
  canMove,
  onKeyboardMove,
}: {
  status: Status
  issues: BoardIssue[]
  canMove: (issue: BoardIssue) => boolean
  onKeyboardMove: (issue: BoardIssue, direction: -1 | 1) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const { label } = ISSUE_STATUS[status]

  return (
    <section
      ref={setNodeRef}
      aria-label={label}
      className={cn(
        'flex min-h-96 flex-col rounded-lg bg-gray-100 p-3 transition-colors dark:bg-dark-elevated',
        isOver && 'ring-2 ring-purple-400',
      )}
    >
      <h2 className="mb-3 flex items-center justify-between text-sm font-semibold">
        {label}
        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
          {issues.length}
        </span>
      </h2>
      <ul className="flex-1 space-y-2">
        {issues.map((issue) => (
          <BoardCard
            key={issue.id}
            issue={issue}
            movable={canMove(issue)}
            onKeyboardMove={onKeyboardMove}
          />
        ))}
      </ul>
    </section>
  )
}

function BoardCard({
  issue,
  movable,
  onKeyboardMove,
}: {
  issue: BoardIssue
  movable: boolean
  onKeyboardMove: (issue: BoardIssue, direction: -1 | 1) => void
}) {
  const { setNodeRef, listeners, isDragging } = useDraggable({
    id: issue.id,
    disabled: !movable,
  })

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-dark-border-default dark:bg-dark-high',
        movable && 'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/issues/${issue.id}`}
          draggable={false}
          className="text-sm font-medium hover:underline"
        >
          {issue.title}
        </Link>

        {movable ? (
          <button
            type="button"
            data-move-handle={issue.id}
            aria-label={`Move ${issue.title}. Use the left and right arrow keys to change its status.`}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault()
                onKeyboardMove(issue, event.key === 'ArrowLeft' ? -1 : 1)
              }
            }}
            className="shrink-0 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <GripVerticalIcon size={16} aria-hidden="true" />
          </button>
        ) : (
          <span title="Only the owner or assignee can move this issue">
            <LockIcon
              size={14}
              className="shrink-0 text-gray-400"
              aria-label="Locked"
            />
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <Badge priority={issue.priority}>
          {ISSUE_PRIORITY[issue.priority].label}
        </Badge>
        <span className="truncate text-xs text-gray-500 dark:text-gray-400">
          {issue.assigneeEmail
            ? displayName(issue.assigneeEmail)
            : 'Unassigned'}
        </span>
      </div>
    </li>
  )
}
