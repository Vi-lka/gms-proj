import { Folder, Loader, XIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { toast } from 'sonner'
import { Separator } from '~/components/ui/separator'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import UploadFileCard from '~/components/ui/special/upload-file-card'
import { updateMap } from '~/server/actions/map-svg'
import { type MapDataExtend } from '~/server/db/schema'
import { createPresignedUrls } from '~/server/s3-bucket/actions'
import { type FileT } from '~/server/s3-bucket/types'
import { handleUpload } from '~/server/s3-bucket/utils'
import SelectFileDrawer from './select-file-drawer'
import { Button } from '~/components/ui/button'
import { MAX_SVG_SIZE } from '~/lib/static/max-file-size'

interface UpdateMapSheetProps extends React.ComponentPropsWithRef<typeof Sheet> {
  map: MapDataExtend | null
}

export default function UpdateMapSheet({
  map,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  onOpenChange,
  ...props
}: UpdateMapSheetProps) {
  const [image, setImage] = React.useState<{id: string, url: string} | null>(null)
  const [imageFile, setImageFile] = React.useState<File | null>(null)

  const [openDrawer, setOpenDrawer] = React.useState(false)

  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    if (map?.svgUrl) {
      setImage({
        id: map.fileId,
        url: map.svgUrl
      })
    }
  }, [map])

  const isSameImage = image?.id === map?.fileId

  const onSave = React.useCallback(() => {
    startTransition(async () => {
      if (!map) return;
      if (isSameImage) return;

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
          toast.error(presignedUrls.error)
          return;
        }
      
        // upload files to s3 endpoint directly and save file info to db
        const uploadedFiles = await handleUpload([imageFile], presignedUrls.data)

        if (uploadedFiles.error) {
          toast.error(uploadedFiles.error)
          return;
        }
        if (uploadedFiles.data === null || uploadedFiles.data.length === 0 || uploadedFiles.data[0] === undefined) {
          toast.error("Файлы не найдены")
          return;
        }

        fileId = uploadedFiles.data[0].id
      }

      const { error } = await updateMap(map.id, fileId)

      if (error) {
        toast.error(error)
        return;
      }
  
      toast.success("Сохранено!")

      onOpenChange?.(false)
    })
  }, [image, imageFile, isSameImage, map, onOpenChange])

  return (
    <Sheet onOpenChange={onOpenChange} {...props}>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Изменить Карту России</SheetTitle>
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
          {(image !== null && !isSameImage) && (
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
