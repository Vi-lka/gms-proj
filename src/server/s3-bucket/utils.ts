"use client"

import { getErrorMessage } from "~/lib/handle-error"
import { saveFileInfoInDB } from "./actions"
import type { PresignedUrlT } from "./types"

/**
 * Uploads file to S3 directly using presigned url
 * @param presignedUrl presigned url for uploading
 * @param file  file to upload
 * @returns response from S3
 */
export const uploadToS3 = async (presignedUrl: PresignedUrlT, file: File) => {
  const response = await fetch(presignedUrl.url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
      'Access-Control-Allow-Origin': '*',
    },
  })
  return response
}

/**
 * Uploads files to S3 and saves file info in DB
 * @param files files to upload
 * @param presignedUrls  presigned urls for uploading
 * @param onUploadSuccess callback to execute after successful upload
 * @returns
 */
export const handleUpload = async (files: File[], presignedUrls: PresignedUrlT[], onUploadSuccess: () => void) => {
  try {
    const uploadToS3Response = await Promise.allSettled(
      presignedUrls.map((presignedUrl) => {
        const file = files.find(
          (file) => file.name === presignedUrl.originalFileName && file.size === presignedUrl.fileSize
        )
        if (!file) {
          throw new Error('Файл не найден')
        }
        return uploadToS3(presignedUrl, file)
      })
    )
  
    if (uploadToS3Response.some((res) => res.status === 'rejected')) {
      throw new Error('Загрузка не удалась')
    }
   
    await saveFileInfoInDB(presignedUrls)
    onUploadSuccess()

    return {
      data: null,
      error: null
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}