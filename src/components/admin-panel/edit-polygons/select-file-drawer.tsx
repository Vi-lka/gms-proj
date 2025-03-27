"use client"

import React from 'react'
import { Button } from '~/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '~/components/ui/drawer'
import { cn, formatBytes } from '~/lib/utils'
import SelectFileTable from '../select-file/select-file-table'
import { usePolyStore } from '~/components/poly-annotation/store/poly-store-provider'
import { MAX_FILE_SIZE } from '~/lib/static/max-file-size'

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

  const setSelectedImage = usePolyStore((state) => state.setSelectedImage)
  const setImageUrl = usePolyStore((state) => state.setImageUrl)
  const setImageFile = usePolyStore((state) => state.setImageFile)
  
  return (
    <Drawer modal={false} open={openSelectImage} onOpenChange={setOpenSelectImage}>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent 
        className={cn('w-full flex flex-col flex-grow h-[calc(100vh-60px)]', className)}
        style={{ userSelect: "auto" }}
      >
        <DrawerHeader>
          <DrawerTitle className='text-center'>{title}</DrawerTitle>
          <DrawerDescription className='text-center'>Max: {formatBytes(MAX_FILE_SIZE)}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 flex flex-col flex-grow">
          <SelectFileTable 
            handleOnSelect={(row) => {
              setSelectedImage({
                id: row.original.id,
                originalName: row.original.originalName,
                url: row.original.fileUrl
              })
              setImageUrl(row.original.fileUrl)
              setImageFile(null)
              setOpenSelectImage(false)
            }} 
            maxSizeOfFile={MAX_FILE_SIZE}
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
