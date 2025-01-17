import { type Row } from '@tanstack/react-table'
import { Loader, Trash } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Credenza, CredenzaClose, CredenzaContent, CredenzaDescription, CredenzaFooter, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from '~/components/ui/credenza'
import { type Dialog } from '~/components/ui/dialog'
import { deleteAreasData } from '~/server/actions/areas-data'
import { type AreasDataExtend } from '~/server/db/schema'

interface DeleteAreasDataDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  areasData: Row<AreasDataExtend>["original"][]
  showTrigger?: boolean
  onSuccess?: () => void
}

export default function DeleteAreasDataDialog({
  areasData,
  showTrigger = true,
  onSuccess,
  ...props
}: DeleteAreasDataDialogProps) {
  const [isPending, startTransition] = React.useTransition()

  function onDelete() {
    startTransition(async () => {
      const { error } = await deleteAreasData(areasData.map((item) => item.id))

      if (error) {
        toast.error(error)
        return
      }

      props.onOpenChange?.(false)
      toast.success("Данные удалены!")
      onSuccess?.()
    })
  }

  return (
    <Credenza {...props}>
      {showTrigger ? (
        <CredenzaTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash className="mr-2 size-4" aria-hidden="true" />
            Удалить ({areasData.length})
          </Button>
        </CredenzaTrigger>
      ) : null}
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Вы абсолютно уверены?</CredenzaTitle>
          <CredenzaDescription>
            Это действие невозможно отменить. Это приведет к окончательному удалению{" "}
            <span className="font-medium">{areasData.length}</span>
            {" Данных ЛУ"}.
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
            {isPending && (
              <Loader
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Удалить
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
