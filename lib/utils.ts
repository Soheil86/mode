import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow } from 'date-fns'

// Utility function for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to relative time (e.g., "2 days ago")
export function formatRelativeTime(date: Date | string) {
  const parsedDate = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(parsedDate, { addSuffix: true })
}

type IssuesHrefOptions = {
  q?: string
  status?: string
  priority?: string
  assignee?: string
  view?: string
  page?: number
}

// The dashboard's state lives in the URL, leaving out anything at its default
export function issuesHref({ view, page, ...filters }: IssuesHrefOptions) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value)
  }
  if (view && view !== 'list') params.set('view', view)
  if (page && page > 1) params.set('page', String(page))

  const query = params.toString()
  return query ? `/dashboard?${query}` : '/dashboard'
}

// Users only have an email, so its first part stands in for a name
export function displayName(email: string) {
  return email.split('@')[0]
}
