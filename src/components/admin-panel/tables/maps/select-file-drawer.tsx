import React from 'react'
import { Button } from '~/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '~/components/ui/drawer'
import { cn, formatBytes } from '~/lib/utils'
import SelectFileTable from '../../select-file/select-file-table'
import { type Dialog } from '~/components/ui/dialog'
import { type Row } from '@tanstack/react-table'
import { type FileDBWithUrl } from '~/server/db/schema'
import { MAX_SVG_SIZE } from '~/lib/static/max-file-size'

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
          <DrawerDescription className='text-center'>Max: {formatBytes(MAX_SVG_SIZE)}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 flex flex-col flex-grow">
          <SelectFileTable 
            handleOnSelect={(row) => {
              handleOnSelect(row)
              onOpenChange?.(false)
            }} 
            accept={["svg"]}
            maxSizeOfFile={MAX_SVG_SIZE}
            className="sm:max-h-[calc(100vh-350px)] max-h-[calc(100vh-440px)]"
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
