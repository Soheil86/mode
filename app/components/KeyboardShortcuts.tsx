'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { KeyboardIcon } from 'lucide-react'
import { toggleTheme } from '@/lib/theme'
import Button from './ui/Button'
import { useHotkeys } from './useHotkeys'

const SHORTCUTS = [
  { key: 'c', description: 'Create a new issue' },
  { key: '/', description: 'Search issues' },
  { key: 'l', description: 'Switch to list view' },
  { key: 'b', description: 'Switch to board view' },
  { key: 't', description: 'Toggle dark mode' },
  { key: '?', description: 'Show this help' },
]

export default function KeyboardShortcuts() {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openHelp = () => dialogRef.current?.showModal()

  useHotkeys({
    c: () => router.push('/issues/new'),
    '/': () => document.getElementById('issue-search')?.focus(),
    t: toggleTheme,
    '?': openHelp,
  })

  return (
    <>
      <button
        type="button"
        onClick={openHelp}
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts"
        className="flex items-center w-full px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
      >
        <KeyboardIcon size={20} />
        <span className="hidden md:inline ml-3">Shortcuts</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="shortcuts-title"
        className="m-auto w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 text-gray-900 shadow-lg backdrop:bg-black/50 dark:border-dark-border-default dark:bg-dark-high dark:text-gray-100"
      >
        <h2 id="shortcuts-title" className="text-lg font-semibold mb-4">
          Keyboard shortcuts
        </h2>
        <dl className="space-y-3">
          {SHORTCUTS.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between">
              <dt className="text-sm text-gray-600 dark:text-gray-300">
                {description}
              </dt>
              <dd>
                <kbd className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-xs dark:border-dark-border-medium dark:bg-dark-elevated">
                  {key}
                </kbd>
              </dd>
            </div>
          ))}
        </dl>
        <form method="dialog" className="mt-6 flex justify-end">
          <Button variant="outline" size="sm">
            Close
          </Button>
        </form>
      </dialog>
    </>
  )
}
