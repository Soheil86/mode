const THEME_CHANGE_EVENT = 'themechange'

// Runs before the page paints, so a dark mode user never sees a white flash
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`

export function subscribeToTheme(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange)
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange)
}

export function isDarkTheme() {
  return document.documentElement.classList.contains('dark')
}

export function toggleTheme() {
  const dark = document.documentElement.classList.toggle('dark')

  try {
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  } catch {
    // Storage can be blocked. The theme still applies until the next page load.
  }

  window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
}
