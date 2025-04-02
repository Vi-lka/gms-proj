import { Folder, Loader, Plus, XIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet'
import UploadFileCard from '~/components/ui/special/upload-file-card'
import { createMap } from '~/server/actions/map-svg'
import { createPresignedUrls } from '~/server/s3-bucket/actions'
import { type FileT } from '~/server/s3-bucket/types'
import { handleUpload } from '~/server/s3-bucket/utils'
import SelectFileDrawer from './select-file-drawer'
import Image from 'next/image'
import { MAX_SVG_SIZE } from '~/lib/static/max-file-size'
import { errorToast } from '~/components/ui/special/error-toast'

type CreateMapSheetProps = React.ComponentPropsWithRef<typeof Sheet>

export default function CreateMapSheet({
  // eslint-disable-next-line @typescript-eslint/unbound-method
  onOpenChange,
  ...props
}: CreateMapSheetProps) {
  const [image, setImage] = React.useState<{id: string, url: string} | null>(null)
  const [imageFile, setImageFile] = React.useState<File | null>(null)

  const [openDrawer, setOpenDrawer] = React.useState(false)

  const [isPending, startTransition] = React.useTransition()

  const onSave = React.useCallback(() => {
    startTransition(async () => {
      let fileId: string | null = null

      if (image !== null) {
        fileId = image.id
      } else {
        if (!imageFile) return;
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

        fileId = uploadedFiles.data[0].id
      }

      const { error } = await createMap(fileId)

      if (error) {
        errorToast(error, {id: "data-error"})
        return;
      }
  
      toast.success("Сохранено!")

      onOpenChange?.(false)
    })
  }, [image, imageFile, onOpenChange])

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
          Создать <Plus size={16} className='flex-none' />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Создать Карту России</SheetTitle>
        </SheetHeader>
        {image !== null 
          ? (
            <div className=''>
              <span
                className="text-muted-foreground hover:text-foreground mx-auto my-1 flex w-fit cursor-pointer items-center justify-center text-xs transition-all hover:scale-110"
                onClick={() => setImage(null)}
              >
                <XIcon className="h-5 w-5" /> Удалить
              </span>
              <Image
                src={image?.url}
                width={180}
                height={180}
                alt={image.id}
                className="bg-muted mx-auto object-cover rounded-md"
              />
            </div>
          )
          : (
            <div className='flex flex-col gap-6 items-center justify-center'>
              <UploadFileCard
                imageFile={imageFile}
                isPending={isPending}
                setImageFile={setImageFile}
                handleSave={onSave}
                accept={{
                  'image/svg+xml': []
                }}
                maxSize={MAX_SVG_SIZE}
              />
              <div className='flex items-center gap-2'>
                <Separator className='w-20 h-0.5 bg-muted-foreground rounded-full'/>
                <span className='text-muted-foreground text-sm'>или</span>
                <Separator className='w-20 h-0.5 bg-muted-foreground rounded-full'/>
              </div>
              <SelectFileDrawer 
                title='Выберите файл' 
                open={openDrawer}
                onOpenChange={setOpenDrawer}
                handleOnSelect={(row) => setImage({
                  id: row.original.id,
                  url: row.original.fileUrl
                })}
              >
                <Button className='item-center gap-1'>
                  <Folder size={16} className='flex-none'/> Выбрать файл
                </Button>
              </SelectFileDrawer>
            </div>
          )
        }
        <SheetFooter className="gap-2 pt-2 sm:space-x-0">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Отмена
            </Button>
          </SheetClose>
          {image !== null && (
            <Button disabled={isPending} onClick={onSave}>
              {isPending && <Loader className="mr-2 size-4 animate-spin" />}
              Сохранить
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
