'use client'

import { useEffect } from 'react'

function shouldIgnore(event: KeyboardEvent) {
  const target = event.target as HTMLElement

  return (
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    document.querySelector('dialog[open]') !== null
  )
}

// Single-key shortcuts that stay out of the way while the user is typing
export function useHotkeys(hotkeys: Record<string, () => void>) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const action = hotkeys[event.key]
      if (!action || shouldIgnore(event)) return

      event.preventDefault()
      action()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [hotkeys])
}
