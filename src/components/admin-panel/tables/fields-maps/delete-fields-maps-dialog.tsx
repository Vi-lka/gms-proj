import { type Row } from '@tanstack/react-table'
import { Loader, Trash } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Credenza, CredenzaClose, CredenzaContent, CredenzaDescription, CredenzaFooter, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from '~/components/ui/credenza'
import { type Dialog } from '~/components/ui/dialog'
import { deleteFieldsMaps } from '~/server/actions/fields-maps'
import { type FieldMapExtend } from '~/server/db/schema'

interface DeleteFieldsMapsDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  fieldsMaps: Row<FieldMapExtend>["original"][]
  showTrigger?: boolean
  onSuccess?: () => void
}

export default function DeleteFieldsMapsDialog({
  fieldsMaps,
  showTrigger = true,
  onSuccess,
  ...props
}: DeleteFieldsMapsDialogProps) {
  const [isPending, startTransition] = React.useTransition()

  function onDelete() {
    startTransition(async () => {
      const { error } = await deleteFieldsMaps(fieldsMaps.map((fieldMap) => fieldMap.id))

      if (error) {
        toast.error(error)
        return
      }

      props.onOpenChange?.(false)
      toast.success("Карты месторождений удалены!")
      onSuccess?.()
    })
  }

  return (
    <Credenza {...props}>
      {showTrigger ? (
        <CredenzaTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash className="mr-2 size-4" />
            Удалить ({fieldsMaps.length})
          </Button>
        </CredenzaTrigger>
      ) : null}
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Вы абсолютно уверены?</CredenzaTitle>
          <CredenzaDescription>
            Это действие невозможно отменить. Это приведет к окончательному удалению{" "}
            <span className="font-medium">{fieldsMaps.length}</span>
            {fieldsMaps.length === 1 ? " Карты месторождения" : " Карт месторождений"}.
            Все полигоны и фото также будут удалены.
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
