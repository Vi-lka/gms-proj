"use client"

import { Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'
import { usePolyStore, useTemporalStore } from '~/components/poly-annotation/store/poly-store-provider'
import { type DefaultEditDataT } from '~/components/poly-annotation/types'
import { Button } from '~/components/ui/button'
import { errorToast } from '~/components/ui/special/error-toast'
import { updateFieldMap } from '~/server/actions/fields-maps'
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
  const selectedImage = usePolyStore((state) => state.selectedImage)
  const polygons = usePolyStore((state) => state.polygons)
  const editPolygonIndex = usePolyStore((state) => state.editPolygonIndex)
  const isAddible = usePolyStore((state) => state.isAddible)
  const resetState = usePolyStore((state) => state.resetState)
  
  const { clear } = useTemporalStore((state) => state)

  const router = useRouter();

  const [isPending, startTransition] = React.useTransition()

  const onSave = React.useCallback(() => {
    if (polygons.length === 0 || !defaultData || (!imageUrl && !selectedImage)) return;

    let fileOriginalName: string | undefined
    let fileId: string | undefined

    startTransition(async () => {
      if (imageFile !== null) {
        // validate files
        const fileInfo: FileT = {
          originalFileName: imageFile.name,
          fileSize: imageFile.size,
        }
      
        const presignedUrls = await createPresignedUrls([fileInfo])

        if (presignedUrls.error || !presignedUrls.data) {
          errorToast(presignedUrls.error, {id: "data-error"})
          return;
        }
      
        // upload files to s3 endpoint directly and save file info to db
        const uploadedFiles = await handleUpload([imageFile], presignedUrls.data)

        if (uploadedFiles.error) {
          errorToast(uploadedFiles.error, {id: "data-error"})
          return;
        }
        if (uploadedFiles.data === null || uploadedFiles.data.length === 0 || uploadedFiles.data[0] === undefined) {
          errorToast("Файлы не найдены", {id: "data-error"})
          return;
        }
        const newFile = uploadedFiles.data[0]
        fileOriginalName = newFile.originalName
        fileId = newFile.id
      } else if (selectedImage !== null) {
        fileOriginalName = selectedImage.originalName
        fileId = selectedImage.id
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
        fileName: fileOriginalName,
        fileId: fileId,
      }, defaultData)

      if (error) {
        errorToast(error, {id: "data-error"})
        return;
      }

      resetState()
      clear()
  
      toast.success("Сохранено!")

      router.push(`/dashboard/fmaps`)
    })

  }, [polygons, defaultData, imageUrl, selectedImage, imageFile, resetState, clear, router])

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
