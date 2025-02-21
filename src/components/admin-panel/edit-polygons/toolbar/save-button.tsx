import React from 'react'
import { toast } from 'sonner';
import { usePolyStore, useTemporalStore } from '~/components/poly-annotation/store/poly-store-provider'
import { Button } from '~/components/ui/button';

export default function SaveButton() {
  const polygons = usePolyStore((state) => state.polygons)
  const editPolygonIndex = usePolyStore((state) => state.editPolygonIndex)
  const isAddible = usePolyStore((state) => state.isAddible)
  const resetState = usePolyStore((state) => state.resetState)
  
  const { clear } = useTemporalStore((state) => state)

  const [isPending, startTransition] = React.useTransition()

  const onSave = React.useCallback(() => {
    if (polygons.length === 0) return;

    resetState()
    clear()

    startTransition(async () => {
      // const { error } = await deleteMapItem(item)
      // if (error) {
      //   toast.error(error)
      //   return
      // }
      toast.success("Сохранено!")
    })
  }, [polygons.length, clear, resetState])

  if (polygons.length === 0) return null;
  
  return (
    <Button
      disabled={isAddible || editPolygonIndex !== null || isPending}
      onClick={onSave}
    >
      Сохранить
    </Button>
  )
}
