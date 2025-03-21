import React from 'react'
import { usePolyStore } from '~/components/poly-annotation/store/poly-store-provider'
import UploadFileCard from '~/components/ui/special/upload-file-card'

export default function UploadFile() {
  const imageFile = usePolyStore((state) => state.imageFile)
  const setImageFile = usePolyStore((state) => state.setImageFile)
  const setImageUrl = usePolyStore((state) => state.setImageUrl)

  return (
    <UploadFileCard
      imageFile={imageFile}
      setImageUrl={setImageUrl}
      setImageFile={setImageFile}
      canUploadTest
    />
  )
}
