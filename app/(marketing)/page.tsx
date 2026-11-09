import Link from 'next/link'
import { buttonStyles } from '../components/ui/Button'

export default function LandingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Issue tracking <br className="hidden sm:block" />
        <span className="text-purple-600 dark:text-purple-400">simplified</span>
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300">
        A fast, keyboard-friendly issue tracker. Plan on a drag-and-drop board,
        find anything with search and filters, and keep ownership clear.
      </p>
      <div className="mt-10 flex justify-center gap-4">
        <Link href="/signup" className={buttonStyles({ size: 'lg' })}>
          Get Started
        </Link>
        <Link
          href="/features"
          className={buttonStyles({ variant: 'outline', size: 'lg' })}
        >
          See features
        </Link>
      </div>
    </div>
  )
}
