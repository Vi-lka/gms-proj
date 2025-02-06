import React from 'react'
import { ModeToggle } from '../mode-toggle'
import UserNav from '../admin-panel/user-nav/user-nav.server'
import Link from 'next/link'
import { cn } from '~/lib/utils'

export default function Navbar({
  className
}: {
  className?: string
}) {
  return (
    <header className={cn(
      "sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary",
      className
    )}>
      <div className="mx-4 sm:mx-8 flex h-14 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <Link href="/">
            <h1 className="font-bold text-lg whitespace-nowrap">
              Brand
            </h1>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
