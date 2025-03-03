import { Loader } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { usePolyStore, useTemporalStore } from '~/components/poly-annotation/store/poly-store-provider'
import { Button } from '~/components/ui/button'
import { Credenza, CredenzaClose, CredenzaContent, CredenzaDescription, CredenzaFooter, CredenzaHeader, CredenzaTitle } from '~/components/ui/credenza'
import { type Dialog } from '~/components/ui/dialog'

interface DeletePolygonDialogProps extends React.ComponentPropsWithRef<typeof Dialog> {
  saveToBackEnd: boolean;
  onSubmit?:() => void
}

export default function DeletePolygonDialog({ saveToBackEnd, onSubmit, ...props }: DeletePolygonDialogProps) {
  const [isPending, startTransition] = React.useTransition()

  const editPolygonIndex = usePolyStore((state) => state.editPolygonIndex)
  const setGlobalState = usePolyStore((state) => state.setGlobalState)
  const deletePolygon = usePolyStore((state) => state.deletePolygon)

  const { pause, resume } = useTemporalStore((state) => state)

  function onDelete() {
    if (editPolygonIndex === null) return;

    pause()
    deletePolygon(editPolygonIndex)
    setGlobalState((prev) => ({
      ...prev,
      editPolygonIndex: null,
      editPolygonAction: null,
    }))
    resume()
    
    if (saveToBackEnd) {
      startTransition(async () => {
        // const { error } = await deleteMapItem(item)

        // if (error) {
        //   toast.error(error)
        //   return
        // }

        onSubmit?.()
        toast.success("Полигон удален!")
      })
    }
  }

  return (
    <Credenza {...props}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Вы абсолютно уверены?</CredenzaTitle>
          <CredenzaDescription>
            Это действие невозможно отменить. Это приведет к удалению полигона из карты.
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
            {isPending && <Loader className="mr-2 size-4 animate-spin" />}
            Удалить
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  )
}
