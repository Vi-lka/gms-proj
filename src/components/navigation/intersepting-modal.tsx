"use client"

import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '../ui/drawer'
import { Button } from '../ui/button'
import { cn } from '~/lib/utils'

export default function InterseptingModal({
  title,
  children,
  backUrl,
  className
}: {
  title: React.ReactNode,
  children: React.ReactNode,
  backUrl?: string
  className?: string
}) {
  const pathname = usePathname();
  const router = useRouter()

  console.log(pathname)

  const handleOpenChange = () => {
    if (backUrl) router.push(backUrl)
    else router.back()
  }

  return (
    <Drawer open={true} onOpenChange={handleOpenChange}>
      <DrawerContent 
        className={cn('w-full flex flex-col flex-grow', className)}
      >
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 flex flex-col flex-grow">
          {children}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Закрыть</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
