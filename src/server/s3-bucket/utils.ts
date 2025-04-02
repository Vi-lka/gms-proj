"use client"

import { getErrorMessage } from "~/lib/handle-error"
import { saveFileInfoInDB } from "./actions"
import type { PresignedUrlT } from "./types"
import { env } from "~/env"
import * as Sentry from "@sentry/nextjs";

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
      'Origin': env.NEXT_PUBLIC_URL,
      'Access-Control-Allow-Origin': env.NEXT_PUBLIC_URL,
    },
    cache: 'no-store'
  })
  return response
}

/**
 * Uploads files to S3 and saves file info in DB
 * @param files files to upload
 * @param presignedUrls  presigned urls for uploading
 * @returns
 */
export const handleUpload = async (files: File[], presignedUrls: PresignedUrlT[]) => {
  try {
    await Promise.all(
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
   
    const { data, error } = await saveFileInfoInDB(presignedUrls)

    if (error) return {
      data: null,
      error: getErrorMessage(error),
    }

    return {
      data,
      error: null
    }
  } catch (err) {
    Sentry.captureException(err);
    console.error(err);
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}