'use client'

import { useSyncExternalStore } from 'react'

// The year never changes while the page is open, so there's nothing to subscribe to
const subscribe = () => () => {}

export function Timestamp() {
  // Renders nothing on the server, then the current year in the browser
  return useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => null,
  )
}
