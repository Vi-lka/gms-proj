"use client"

import React from 'react'
import { toast } from 'sonner'
import EditPolygons from '~/components/admin-panel/edit-polygons/edit-polygons'
import { usePolyStore, useTemporalStore } from '~/components/poly-annotation/store/poly-store-provider'
import { type DefaultEditDataT } from '~/components/poly-annotation/types'
import { splitIntoPairs } from '~/lib/utils'
import { type getFieldMapWithImage } from '~/server/queries/fields-maps'

interface EditFieldMapContentProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getFieldMapWithImage>>,
    ]
  >
}

export default function Content({ promises }: EditFieldMapContentProps) {
  const [result] = React.use(promises)

  const [defaultData, setDefaultData] = React.useState<DefaultEditDataT>()

  const openSelectImage = usePolyStore((state) => state.openSelectImage)
  const selectedImage = usePolyStore((state) => state.selectedImage)
  const setGlobalState = usePolyStore((state) => state.setGlobalState)

  const { pause, resume } = useTemporalStore((state) => state)

  React.useEffect(() => {
    if (result.error !== null) {
      toast.error(result.error)
      return;
    }

    if (openSelectImage || selectedImage !== null) return;

    const dataForState = {
      fieldId: result.data.fieldId,
      imageUrl: result.data.fileUrl,
      polygons: result.data.polygons.map((polygon) => {
        const points = splitIntoPairs(polygon.points)
        return {
          id: polygon.id,
          points,
          flattenedPoints: polygon.points,
          isFinished: true,
          licensedArea: {
            id: polygon.area.id,
            name: polygon.area.name,
          }
        }
      })
    }

    setDefaultData({
      id: result.data.id, 
      fieldName: result.data.field.name,
      companyName: result.data.field.company.name,
      ...dataForState
    })
    
    pause();
    setGlobalState((prev) => ({
      ...prev,
      ...dataForState
    }));
    resume();
  }, [result, pause, resume, setGlobalState, openSelectImage, selectedImage])

  if (result.error !== null) throw new Error(result.error)

  return (
    <EditPolygons type='update' defaultData={defaultData} />
  )
}
