"use server"

import { restrictUser } from "~/lib/utils"
import { auth } from "../auth"
import type { FileT, PresignedUrlT } from "./types"
import { unstable_noStore as noStore } from "next/cache"
import { getErrorMessage } from "~/lib/handle-error"
import { v4 as uuidv4 } from 'uuid';
import { createPresignedUrlToDownload, createPresignedUrlToUpload, deleteFileFromBucket } from "./s3-file-management"
import { env } from "~/env"
import { db } from "../db"
import { files } from "../db/schema"
import { eq } from "drizzle-orm"
import { takeFirstOrThrow } from "../db/utils"

/**
 * Gets presigned urls for uploading files to S3
 * @param files original files names to upload
 * @returns Presigned Urls
 */
export const createPresignedUrls = async (files: FileT[]) => { 
  noStore()
  
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  if (!files?.length || files.length === 0) {
    const err = new Error("Нет файлов на загрузку")
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }
 
  try {
    const presignedUrls = [] as PresignedUrlT[]

    // use Promise.all to get all the presigned urls in parallel
    await Promise.all(
      // loop through the files
      files.map(async (file) => {
        const fileName = `${uuidv4()}-${file?.originalFileName}`
      
        // get presigned url using s3 sdk
        const url = await createPresignedUrlToUpload({
          bucketName: env.S3_BUCKET_NAME,
          fileName,
          expiry: 60 * 60, // 1 hour
        })
        // add presigned url to the list
        presignedUrls.push({
          fileNameInBucket: fileName,
          originalFileName: file.originalFileName,
          fileSize: file.fileSize,
          url,
        })
      })
    )

    return {
      data: presignedUrls,
      error: null
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

/**
 * Saves file info in DB
 * @param presignedUrls presigned urls for uploading
 * @returns files info form db
 */
export const saveFileInfoInDB = async (presignedUrls: PresignedUrlT[]) => {
  noStore()
  
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    const saveFilesInfo = await db
      .insert(files)
      .values(presignedUrls.map(file => ({
        bucket: env.S3_BUCKET_NAME,
        fileName: file.fileNameInBucket,
        originalName: file.originalFileName,
        size: file.fileSize,
      })))
      .returning()

    if (saveFilesInfo.length > 0) return {
      data: saveFilesInfo,
      error: null
    }
    else {
      throw new Error("Файлы не найдены", { cause: saveFilesInfo })
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function getPresignedUrl(id: string) {
  noStore()
  
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    const err = new Error("No access")
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    const file = await db.query.files.findFirst({
      where: (files, { eq }) => eq(files.id, id),
      columns: {
        fileName: true,
      }
    })

    if (!file) throw new Error("Файл не найден", { cause: file })
    else {
      // Get presigned url from s3 storage
      const presignedUrl = await createPresignedUrlToDownload({
        bucketName: env.S3_BUCKET_NAME,
        fileName: file.fileName,
        expiry: 60 * 60, // 1 hour
      })
  
      return {
        data: presignedUrl,
        error: null
      }
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function deleteFile(id: string) {
  noStore()
  
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    const file = await db.query.files.findFirst({
      where: eq(files.id, id),
      columns: {
        fileName: true,
      }
    })

    if (!file) throw new Error("Файл не найден", { cause: file })
    else {
      // Delete the file from the bucket
      await deleteFileFromBucket({
        bucketName: env.S3_BUCKET_NAME,
        fileName: file.fileName,
      })
      // Delete the file from the database
      await db
        .delete(files)
        .where(eq(files.id, id))
        .returning()
        .then(takeFirstOrThrow)
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }

}