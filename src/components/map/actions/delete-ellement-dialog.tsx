import { Loader } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Credenza, CredenzaClose, CredenzaContent, CredenzaDescription, CredenzaFooter, CredenzaHeader, CredenzaTitle } from '~/components/ui/credenza'
import { type Dialog } from '~/components/ui/dialog'
import { type MapItemT } from '~/lib/types'
import { deleteMapItem } from '~/server/actions/mapItems'


interface DeleteEllemenDialogProps extends React.ComponentPropsWithRef<typeof Dialog> {
  item: MapItemT,
  onFormSubmit: (() => void) | undefined
}

export default function DeleteEllementDialog({ item, onFormSubmit, ...props }: DeleteEllemenDialogProps) {
  const [isPending, startTransition] = React.useTransition()

  function onDelete() {
    startTransition(async () => {
      const { error } = await deleteMapItem(item)

      if (error) {
        toast.error(error)
        return
      }

      onFormSubmit?.()
      toast.success("Элемент удален!")
    })
  }

  return (
    <Credenza {...props}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Вы абсолютно уверены?</CredenzaTitle>
          <CredenzaDescription>
            Это действие невозможно отменить. Это приведет к удалению элемента из карты.
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaFooter>
          <CredenzaClose asChild>
            <Button type="button" variant="outline">
              Отмена
            </Button>
          </CredenzaClose>
          <Button 
            type="submit"
            variant="destructive"
            onClick={onDelete}
          >
            {isPending && <Loader className="mr-2 size-4 flex-none animate-spin" />}
            Удалить
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
