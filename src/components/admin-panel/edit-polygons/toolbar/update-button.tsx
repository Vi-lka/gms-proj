"use client"

import { Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'
import { usePolyStore, useTemporalStore } from '~/components/poly-annotation/store/poly-store-provider'
import { type DefaultEditDataT } from '~/components/poly-annotation/types'
import { Button } from '~/components/ui/button'
import { updateFieldMap } from '~/server/actions/fields-maps'
import { type FileDB } from '~/server/db/schema'
import { createPresignedUrls } from '~/server/s3-bucket/actions'
import { type FileT } from '~/server/s3-bucket/types'
import { handleUpload } from '~/server/s3-bucket/utils'

export default function UpdateButton({
  defaultData
}: {
  defaultData: DefaultEditDataT | undefined
}) {
  const imageUrl = usePolyStore((state) => state.imageUrl)
  const imageFile = usePolyStore((state) => state.imageFile)
  const polygons = usePolyStore((state) => state.polygons)
  const editPolygonIndex = usePolyStore((state) => state.editPolygonIndex)
  const isAddible = usePolyStore((state) => state.isAddible)
  const resetState = usePolyStore((state) => state.resetState)
  
  const { clear } = useTemporalStore((state) => state)

  const router = useRouter();

  const [isPending, startTransition] = React.useTransition()

  const onSave = React.useCallback(() => {
    if (polygons.length === 0 || !defaultData || !imageUrl) return;

    let newFile: FileDB | null = null

    startTransition(async () => {
      if (imageFile) {
        // validate files
        const fileInfo: FileT = {
          originalFileName: imageFile.name,
          fileSize: imageFile.size,
        }
      
        const presignedUrls = await createPresignedUrls([fileInfo])

        if (presignedUrls.error || !presignedUrls.data) {
          toast.error(presignedUrls.error)
          return;
        }
      
        // upload files to s3 endpoint directly and save file info to db
        const uploadedFiles = await handleUpload([imageFile], presignedUrls.data)

        if (uploadedFiles.error) {
          toast.error(uploadedFiles.error)
          return;
        }
        if (uploadedFiles.data === null || uploadedFiles.data.length === 0 || uploadedFiles.data[0] === undefined) {
          toast.error("Файлы не найдены")
          return;
        }
        newFile = uploadedFiles.data[0]
      }
      
      const validPolygons = polygons.map((polygon) => ({
        id: polygon.id,
        areaId: polygon.licensedArea?.id,
        points: polygon.flattenedPoints,
      })).filter((polygon) => polygon.areaId !== undefined) as {
        id: string,
        areaId: string;
        points: number[];
      }[]

      const { error } = await updateFieldMap({
        id: defaultData.id,
        fieldId: defaultData.fieldId,
        polygons: validPolygons,
        fileName: newFile?.originalName,
        fileId: newFile?.id,
      }, defaultData)

      if (error) {
        console.log(error)
        toast.error(error)
        return;
      }

      resetState()
      clear()
  
      toast.success("Сохранено!")

      router.push(`/dashboard/fmaps`)
    })

  }, [defaultData, polygons, imageUrl, imageFile, resetState, clear, router])

  if (polygons.length === 0 || !defaultData || !imageUrl) return null;

  return (
    <Button
      disabled={isAddible || editPolygonIndex !== null || isPending}
      onClick={onSave}
    >
      {isPending && <Loader className="flex-none mr-2 size-4 animate-spin" />}
      Сохранить
    </Button>
  )
}
