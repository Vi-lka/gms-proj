"use server"

import { restrictUser } from "~/lib/utils";
import { auth } from "../auth";
import { db } from "../db";
import { createPresignedUrlToDownload } from "./s3-file-management";
import { env } from "~/env";
import { getErrorMessage } from "~/lib/handle-error";
import { unstable_cache } from "~/lib/unstable-cache";

export async function getPresignedUrl(id: string) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchDB = async () => {
    try {
      const file = await db.query.files.findFirst({
        where: (files, { eq }) => eq(files.id, id),
        columns: {
          fileName: true,
        }
      })
    
      if (!file) throw new Error("Not found", { cause: file })

      return { name: file.fileName, error: null }
    } catch (err) {
      console.log(err)
      const error = getErrorMessage(err)
      return {
        name: null,
        error
      };
    }
  }
  
  const fetchData = async () => {
    try {
      const file = await unstable_cache(
        fetchDB,
        [id],
        { revalidate: 60, tags: ["files"] }
      )()
    
      if (file.error !== null) throw new Error(file.error)
      else {
        // Get presigned url from s3 storage
        const presignedUrl = await createPresignedUrlToDownload({
          bucketName: env.S3_BUCKET_NAME,
          fileName: file.name,
          expiry: 24 * 60 * 60, // 24 hours
        })
      
        return {
          data: presignedUrl,
          error: null
        }
      }
    } catch (err) {
      console.log(err)
      const error = getErrorMessage(err)
      return {
        data: null,
        error
      };
    }
  }

  const result = await fetchData()

  return result
}