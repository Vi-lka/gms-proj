import { type Row } from '@tanstack/react-table'
import { Loader, Trash } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Credenza, CredenzaClose, CredenzaContent, CredenzaDescription, CredenzaFooter, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from '~/components/ui/credenza'
import { type Dialog } from '~/components/ui/dialog'
import { errorToast } from '~/components/ui/special/error-toast'
import { deleteLicensedAreas } from '~/server/actions/licensed-areas'
import { type LicensedAreaExtend } from '~/server/db/schema'

interface DeleteLicensedAreasDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  licensedAreas: Row<LicensedAreaExtend>["original"][]
  showTrigger?: boolean
  onSuccess?: () => void
}

export default function DeleteLicensedAreasDialog({
  licensedAreas,
  showTrigger = true,
  onSuccess,
  ...props
}: DeleteLicensedAreasDialogProps) {
  const [isPending, startTransition] = React.useTransition()

  function onDelete() {
    startTransition(async () => {
      const { error } = await deleteLicensedAreas(licensedAreas.map((licensedArea) => licensedArea.id))

      if (error) {
        errorToast(error, {id: "data-error"})
        return
      }

      props.onOpenChange?.(false)
      toast.success("Лицензионные участки удалены!")
      onSuccess?.()
    })
  }
  
  return (
    <Credenza {...props}>
      {showTrigger ? (
        <CredenzaTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash className="mr-2 size-4" />
            Удалить ({licensedAreas.length})
          </Button>
        </CredenzaTrigger>
      ) : null}
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Вы абсолютно уверены?</CredenzaTitle>
          <CredenzaDescription>
            Это действие невозможно отменить. Это приведет к окончательному удалению{" "}
            <span className="font-medium">{licensedAreas.length}</span>
            {licensedAreas.length === 1 ? " Лицензионного участка" : " Лицензионных участков"}.
            Все данные, которые были привязаны, также будут удалены.
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
