import React from 'react'
import { usePolyStore } from '~/components/poly-annotation/store/poly-store-provider'
import { Button } from '~/components/ui/button';

export default function SaveButton() {
  const polygons = usePolyStore((state) => state.polygons)
  const editPolygonIndex = usePolyStore((state) => state.editPolygonIndex)
  const isAddible = usePolyStore((state) => state.isAddible)

  if (polygons.length === 0) return null;
  
  return (
    <Button
      disabled={isAddible || editPolygonIndex !== null}
    >
      Сохранить
    </Button>
  )
}
