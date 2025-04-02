import { type Row } from '@tanstack/react-table'
import { Loader, Trash } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Credenza, CredenzaClose, CredenzaContent, CredenzaDescription, CredenzaFooter, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from '~/components/ui/credenza'
import { type Dialog } from '~/components/ui/dialog'
import { errorToast } from '~/components/ui/special/error-toast'
import { type FileDBWithUrl } from '~/server/db/schema'
import { deleteFiles } from '~/server/s3-bucket/actions'

interface DeleteFilesFialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  files: Row<FileDBWithUrl>["original"][]
  showTrigger?: boolean
  onSuccess?: () => void
}

export default function DeleteFilesFialog({
  files,
  showTrigger = true,
  onSuccess,
  ...props
}: DeleteFilesFialogProps) {
  const [isPending, startTransition] = React.useTransition()

  function onDelete() {
    startTransition(async () => {
      const { error } = await deleteFiles(files.map((file) => file.id))

      if (error) {
        errorToast(error, {id: "data-error"})
        return
      }

      props.onOpenChange?.(false)
      toast.success("Файлы удалены!")
      onSuccess?.()
    })
  }

  return (
    <Credenza {...props}>
      {showTrigger ? (
        <CredenzaTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash className="mr-2 size-4" />
            Удалить ({files.length})
          </Button>
        </CredenzaTrigger>
      ) : null}
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Вы абсолютно уверены?</CredenzaTitle>
          <CredenzaDescription>
            Это действие невозможно отменить. Это приведет к окончательному удалению{" "}
            <span className="font-medium">{files.length}</span>
            {files.length === 1 ? " Файла" : " Файлов"}.
            Все данные, которые были привязаны, также будут удалены (Карта России, Карты месторождений и их полигоны).
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaFooter className="gap-2 sm:space-x-0">
          <CredenzaClose asChild>
            <Button variant="outline">Отмена</Button>
          </CredenzaClose>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isPending}
          >
            {isPending && <Loader className="mr-2 size-4 animate-spin" />}
            Удалить
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
