"use client"

import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react'
import { toast } from 'sonner';
import { usePolyStore, useTemporalStore } from '~/components/poly-annotation/store/poly-store-provider'
import { Button } from '~/components/ui/button';
import { errorToast } from '~/components/ui/special/error-toast';
import { createFieldMap } from '~/server/actions/fields-maps';
import { createPresignedUrls } from '~/server/s3-bucket/actions';
import { type FileT } from '~/server/s3-bucket/types';
import { handleUpload } from '~/server/s3-bucket/utils';

export default function SaveButton() {
  const fieldId = usePolyStore((state) => state.fieldId)
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
    if (polygons.length === 0 || (!imageFile && !selectedImage) || !fieldId) return;

    startTransition(async () => {

      let fileOriginalName = ""
      let fileId = ""

      if (imageFile !== null) {
        // validate file
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

        fileOriginalName = uploadedFiles.data[0].originalName
        fileId = uploadedFiles.data[0].id
      } else if (selectedImage !== null) {
        fileOriginalName = selectedImage.originalName
        fileId = selectedImage.id
      } else {
        errorToast("Нет Файла", {id: "data-error"})
        return
      };

      const validPolygons = polygons.map((polygon) => ({
        areaId: polygon.licensedArea?.id,
        points: polygon.flattenedPoints,
      })).filter((polygon) => polygon.areaId !== undefined) as {
        areaId: string;
        points: number[];
      }[]

      const { error } = await createFieldMap({
        fieldId,
        polygons: validPolygons,
        fileName: fileOriginalName,
        fileId: fileId,
      })

      if (error) {
        errorToast(error, {id: "data-error"})
        return;
      }

      resetState()
      clear()
  
      toast.success("Сохранено!")

      router.push(`/dashboard/fmaps`)
    })

  }, [polygons, imageFile, selectedImage, fieldId, resetState, clear, router])

  if (polygons.length === 0 || (!imageFile && !selectedImage)) return null;
  
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
