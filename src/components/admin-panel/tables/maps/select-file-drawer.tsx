import React from 'react'
import { Button } from '~/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '~/components/ui/drawer'
import { cn } from '~/lib/utils'
import SelectFileTable from '../../select-file/select-file-table'
import { type Dialog } from '~/components/ui/dialog'
import { type Row } from '@tanstack/react-table'
import { type FileDBWithUrl } from '~/server/db/schema'

interface SelectFileDrawerProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  children: React.ReactNode,
  handleOnSelect: (row: Row<FileDBWithUrl>) => void
  title?: string,
  className?: string,
}

export default function SelectFileDrawer({
  children,
  handleOnSelect,
  title,
  className,
  open,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  onOpenChange
}: SelectFileDrawerProps) {
  return (
    <Drawer modal={false} open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent 
        className={cn('w-full flex flex-col flex-grow h-[calc(100vh-60px)]', className)}
        style={{ userSelect: "auto" }}
      >
        <DrawerHeader>
          <DrawerTitle className='text-center'>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 flex flex-col flex-grow">
          <SelectFileTable 
            handleOnSelect={(row) => {
              handleOnSelect(row)
              onOpenChange?.(false)
            }} 
            accept={["svg"]}
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
