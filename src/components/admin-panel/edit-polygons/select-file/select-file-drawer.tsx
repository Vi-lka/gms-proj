import React from 'react'
import { Button } from '~/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '~/components/ui/drawer'
import { cn } from '~/lib/utils'
import SelectFileTable from './select-file-table'
import { usePolyStore } from '~/components/poly-annotation/store/poly-store-provider'

type SelectFileDrawerProps = {
  children: React.ReactNode,
  title?: string,
  className?: string,
}

export default function SelectFileDrawer({
  children,
  title,
  className,
}: SelectFileDrawerProps) {
  const openSelectImage = usePolyStore((state) => state.openSelectImage)
  const setOpenSelectImage = usePolyStore((state) => state.setOpenSelectImage)
  
  return (
    <Drawer modal={false} open={openSelectImage} onOpenChange={setOpenSelectImage}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent 
        className={cn('w-full flex flex-col flex-grow h-[calc(100vh-60px)]', className)}
      >
        <DrawerHeader>
          <DrawerTitle className='text-center'>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 flex flex-col flex-grow">
          <SelectFileTable 
            afterSelect={() => setOpenSelectImage(false)} 
            className="sm:max-h-[calc(100vh-320px)] max-h-[calc(100vh-410px)]"
          />
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
