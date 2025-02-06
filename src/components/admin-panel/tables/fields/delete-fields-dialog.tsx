import { type Row } from '@tanstack/react-table'
import React from 'react'
import { toast } from 'sonner'
import { type Dialog } from '~/components/ui/dialog'
import { type FieldExtend } from '~/server/db/schema'
import { deleteFields } from '~/server/actions/fields'
import { Credenza, CredenzaClose, CredenzaContent, CredenzaDescription, CredenzaFooter, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from '~/components/ui/credenza'
import { Button } from '~/components/ui/button'
import { Loader, Trash } from 'lucide-react'

interface DeleteFieldsDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  fields: Row<FieldExtend>["original"][]
  showTrigger?: boolean
  onSuccess?: () => void
}

export default function DeleteFieldsDialog({
  fields,
  showTrigger = true,
  onSuccess,
  ...props
}: DeleteFieldsDialogProps) {
  const [isPending, startTransition] = React.useTransition()

  function onDelete() {
    startTransition(async () => {
      const { error } = await deleteFields(fields.map((field) => field.id))

      if (error) {
        toast.error(error)
        return
      }

      props.onOpenChange?.(false)
      toast.success("Месторождения удалены!")
      onSuccess?.()
    })
  }

  return (
    <Credenza {...props}>
      {showTrigger ? (
        <CredenzaTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash className="mr-2 size-4" aria-hidden="true" />
            Удалить ({fields.length})
          </Button>
        </CredenzaTrigger>
      ) : null}
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Вы абсолютно уверены?</CredenzaTitle>
          <CredenzaDescription>
            Это действие невозможно отменить. Это приведет к окончательному удалению{" "}
            <span className="font-medium">{fields.length}</span>
            {fields.length === 1 ? " Месторождения" : " Месторождений"}.
            Все Лицензионные участки и их данные, которые были привязаны, также будут удалены.
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
