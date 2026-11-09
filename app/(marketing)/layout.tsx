import Link from 'next/link'
import { Timestamp } from '../components/Timestamp'
import { buttonStyles } from '../components/ui/Button'
import ThemeToggle from '../components/ThemeToggle'

const REPOSITORY_URL = 'https://github.com/Soheil86/mode'

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 dark:border-dark-border-subtle bg-white dark:bg-dark-base">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              Mode
            </Link>
            <nav aria-label="Main" className="hidden md:flex gap-6">
              <Link
                href="/features"
                className="text-sm font-medium hover:text-purple-600"
              >
                Features
              </Link>
              <Link
                href="/faq"
                className="text-sm font-medium hover:text-purple-600"
              >
                FAQ
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link
              href="/signin"
              className={buttonStyles({ variant: 'outline' })}
            >
              Sign in
            </Link>
            <Link href="/signup" className={buttonStyles()}>
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-200 dark:border-dark-border-subtle bg-white dark:bg-dark-base">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-6 text-sm text-gray-600 dark:text-gray-400">
          <p>
            &copy; <Timestamp /> Mode
          </p>
          <a
            href={REPOSITORY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-600"
          >
            Source on GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
