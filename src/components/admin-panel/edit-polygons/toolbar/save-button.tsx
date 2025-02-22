"use client"

import { Loader } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';
import { usePolyStore, useTemporalStore } from '~/components/poly-annotation/store/poly-store-provider'
import { Button } from '~/components/ui/button';
import { createPresignedUrls } from '~/server/s3-bucket/actions';
import { type FileT } from '~/server/s3-bucket/types';
import { handleUpload } from '~/server/s3-bucket/utils';

export default function SaveButton() {
  const imageFile = usePolyStore((state) => state.imageFile)
  const polygons = usePolyStore((state) => state.polygons)
  const editPolygonIndex = usePolyStore((state) => state.editPolygonIndex)
  const isAddible = usePolyStore((state) => state.isAddible)
  const resetState = usePolyStore((state) => state.resetState)
  
  const { clear } = useTemporalStore((state) => state)

  const [isPending, startTransition] = React.useTransition()

  const onSave = React.useCallback(() => {
    if (polygons.length === 0 || !imageFile) return;

    startTransition(async () => {
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
      if (!uploadedFiles.data || uploadedFiles.data.length === 0) {
        toast.error("Файлы не найдены")
        return;
      }

      resetState()
      clear()

      // add field map polygons
      // const { error } = await addFieldMap()
      toast.success("Сохранено!")
    })

  }, [polygons, imageFile, resetState, clear])

  if (polygons.length === 0 || !imageFile) return null;
  
  return (
    <Button
      disabled={isAddible || editPolygonIndex !== null || isPending}
      onClick={onSave}
    >
      {isPending && (
        <Loader
          className="flex-none mr-2 size-4 animate-spin"
          aria-hidden="true"
        />
      )}
      Сохранить
    </Button>
  )
}
