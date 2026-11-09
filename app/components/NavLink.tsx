'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  icon: React.ReactNode
  label: string
}

export default function NavLink({ href, icon, label }: NavLinkProps) {
  const isActive = usePathname() === href

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center px-2 py-2 text-sm font-medium rounded-md group',
        isActive
          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
      )}
    >
      <span className="text-gray-500 dark:text-gray-400 md:mr-3">{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </Link>
  )
}
