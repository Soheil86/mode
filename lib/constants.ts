// Kept free of database imports so Client Components can use them

export const STATUS_VALUES = ['backlog', 'todo', 'in_progress', 'done'] as const
export const PRIORITY_VALUES = ['low', 'medium', 'high'] as const

export const ISSUE_STATUS = {
  backlog: { label: 'Backlog', value: 'backlog' },
  todo: { label: 'Todo', value: 'todo' },
  in_progress: { label: 'In Progress', value: 'in_progress' },
  done: { label: 'Done', value: 'done' },
} as const

export const ISSUE_PRIORITY = {
  low: { label: 'Low', value: 'low' },
  medium: { label: 'Medium', value: 'medium' },
  high: { label: 'High', value: 'high' },
} as const

export const PAGE_SIZE = 20
export const BOARD_LIMIT = 200
