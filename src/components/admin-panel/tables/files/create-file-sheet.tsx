"use client"

import { Plus } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet'
import { errorToast } from '~/components/ui/special/error-toast'
import UploadFileCard from '~/components/ui/special/upload-file-card'
import { MAX_SVG_SIZE } from '~/lib/static/max-file-size'
import { createPresignedUrls } from '~/server/s3-bucket/actions'
import type { FileT } from '~/server/s3-bucket/types'
import { handleUpload } from '~/server/s3-bucket/utils'

type CreateCompanySheetProps = React.ComponentPropsWithRef<typeof Sheet>

export default function CreateFileSheet({
  // eslint-disable-next-line @typescript-eslint/unbound-method
  onOpenChange,
  ...props
}: CreateCompanySheetProps) {
  const [imageFile, setImageFile] = React.useState<File | null>(null)

  const [isPending, startTransition] = React.useTransition()

  const onSave = React.useCallback(() => {
    if (!imageFile) return;

    startTransition(async () => {
      // validate files
      const fileInfo: FileT = {
        originalFileName: imageFile.name,
        fileSize: imageFile.size,
      }
  
      const presignedUrls = await createPresignedUrls([fileInfo])

      if (presignedUrls.error || !presignedUrls.data) {
        errorToast(presignedUrls.error, {id: "data-error"})
        return;
      }
  
      // upload files to s3 endpoint directly and save file info to db
      const uploadedFiles = await handleUpload([imageFile], presignedUrls.data)

      if (uploadedFiles.error) {
        errorToast(uploadedFiles.error, {id: "data-error"})
        return;
      }
      if (uploadedFiles.data === null || uploadedFiles.data.length === 0 || uploadedFiles.data[0] === undefined) {
        errorToast("Файлы не найдены", {id: "data-error"})
        return;
      }
  
      toast.success("Загрузка завершена!")

      onOpenChange?.(false)
    })
  }, [imageFile, onOpenChange])

  return (
    <Sheet 
      onOpenChange={(open) => {
        if (!isPending) onOpenChange?.(open)
      }}
      {...props}
    >
      <SheetTrigger disabled={isPending} asChild>
        <Button 
          size="sm"
          disabled={isPending}
          className="gap-2 h-7"
        >
          Добавить <Plus size={16} className='flex-none' />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Добавить файл</SheetTitle>
        </SheetHeader>
          <UploadFileCard
            imageFile={imageFile}
            isPending={isPending}
            maxSize={MAX_SVG_SIZE}
            setImageFile={setImageFile}
            handleSave={onSave}
          />
        <SheetFooter className="gap-2 pt-2 sm:space-x-0">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Отмена
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
