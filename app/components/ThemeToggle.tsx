'use client'

import { useSyncExternalStore } from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'
import { isDarkTheme, subscribeToTheme, toggleTheme } from '@/lib/theme'

export default function ThemeToggle({ showLabel = false }) {
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    isDarkTheme,
    () => false,
  )
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="flex items-center px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
    >
      {isDark ? <SunIcon size={20} /> : <MoonIcon size={20} />}
      {showLabel && (
        <span className="hidden md:inline ml-3">
          {isDark ? 'Light mode' : 'Dark mode'}
        </span>
      )}
    </button>
  )
}
