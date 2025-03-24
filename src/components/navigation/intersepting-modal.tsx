"use client"

import { useRouter } from 'next/navigation'
import React from 'react'
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '../ui/drawer'
import { Button } from '../ui/button'
import { cn } from '~/lib/utils'

export default function InterseptingModal({
  title,
  children,
  modal = false,
  backUrl,
  className,
  userSelect = "auto"
}: {
  title: React.ReactNode
  children: React.ReactNode
  modal?: boolean
  backUrl?: string
  className?: string
  userSelect?: "auto" | "text" | "none" | "contain" | "all"
}) {
  const router = useRouter()

  const handleOpenChange = () => {
    if (backUrl) router.push(backUrl)
    else router.back()
  }

  return (
    <Drawer modal={modal} open={true} onOpenChange={handleOpenChange}>
      <DrawerContent 
        className={cn('w-full flex flex-col flex-grow', className)}
        style={{ userSelect }}
      >
        <DrawerHeader>
          <DrawerTitle className='text-center'>{title}</DrawerTitle>
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
