"use server"

import * as Minio from 'minio'
import type internal from 'stream'
import { env } from '~/env.js'
import * as Sentry from "@sentry/nextjs";
 
// Create a new Minio client with the S3 endpoint, access key, and secret key
const s3Client = new Minio.Client({
  endPoint: env.S3_ENDPOINT,
  port: env.S3_PORT ? Number(env.S3_PORT) : undefined,
  accessKey: env.S3_ACCESS_KEY,
  secretKey: env.S3_SECRET_KEY,
  useSSL: env.S3_USE_SSL === "true",
})
 
export async function createBucketIfNotExists(bucketName: string) {
  const bucketExists = await s3Client.bucketExists(bucketName)
  if (!bucketExists) {
    await s3Client.makeBucket(bucketName)
  }
}

/**
 * Check if file exists in bucket
 * @param bucketName name of the bucket
 * @param fileName name of the file
 * @returns true if file exists, false if not
 */
export async function checkFileExistsInBucket({ bucketName, fileName }: { bucketName: string; fileName: string }) {
  try {
    await s3Client.statObject(bucketName, fileName)
  } catch (err) {
    Sentry.captureException(err);
    console.error(err)
    return false
  }
  return true
}

/**
 * Save file in S3 bucket
 * @param bucketName name of the bucket
 * @param fileName name of the file
 * @param file file to save
 */
export async function saveFileInBucket({
  bucketName,
  fileName,
  file,
}: {
  bucketName: string
  fileName: string
  file: Buffer | internal.Readable
}) {
  // Create bucket if it doesn't exist
  await createBucketIfNotExists(bucketName)
 
  // check if file exists - optional.
  // Without this check, the file will be overwritten if it exists
  const fileExists = await checkFileExistsInBucket({
    bucketName,
    fileName,
  })
 
  if (fileExists) {
    throw new Error('Файл уже существует')
  }
 
  // Upload image to S3 bucket
  await s3Client.putObject(bucketName, fileName, file)
}

/**
 * Generate presigned urls for uploading files to S3
 * @param bucketName name of the bucket
 * @param files files to upload
 * @param expiry expiration time in seconds
 * @returns promise with array of presigned urls
 */
export async function createPresignedUrlToUpload({
  bucketName,
  fileName,
  expiry = 60 * 60, // 1 hour
}: {
  bucketName: string
  fileName: string
  expiry?: number
}) {
  // Create bucket if it doesn't exist
  await createBucketIfNotExists(bucketName)
 
  return await s3Client.presignedPutObject(bucketName, fileName, expiry)
}

/**
 * Generate presigned urls for downloading file from S3
 * @param bucketName name of the bucket
 * @param fileName file name to download
 * @param expiry expiration time in seconds
 * @returns promise with array of presigned urls
 */
export async function createPresignedUrlToDownload({
  bucketName,
  fileName,
  expiry = 60 * 60, // 1 hour
}: {
  bucketName: string
  fileName: string
  expiry?: number
}) {
  return await s3Client.presignedGetObject(bucketName, fileName, expiry)
}

/**
 * Delete file from S3 bucket
 * @param bucketName name of the bucket
 * @param fileName name of the file
 * @returns true if file was deleted, false if not
 */
export async function deleteFileFromBucket({ 
  bucketName, 
  fileName 
}: { 
  bucketName: string; 
  fileName: string 
}) {
  try {
    await s3Client.removeObject(bucketName, fileName)
  } catch (err) {
    Sentry.captureException(err);
    console.error(err)
    return false
  }
  return true
}

/**
 * Delete file from S3 bucket
 * @param bucketName name of the bucket
 * @param fileName name of the file
 * @returns true if file was deleted, false if not
 */
export async function deleteFilesFromBucket({ 
  bucketName, 
  filesNames 
}: { 
  bucketName: string; 
  filesNames: string[]
}) {
  try {
    await s3Client.removeObjects(bucketName, filesNames)
  } catch (err) {
    Sentry.captureException(err);
    console.error(err)
    return false
  }
  return true
}

// /**
//  * Get file from S3 bucket
//  * @param bucketName name of the bucket
//  * @param fileName name of the file
//  * @returns file from S3
//  */
// export async function getFileFromBucket({ bucketName, fileName }: { bucketName: string; fileName: string }) {
//   try {
//     await s3Client.statObject(bucketName, fileName)
//   } catch (error) {
//     console.error(error)
//     return null
//   }
//   return await s3Client.getObject(bucketName, fileName)
// }