"use server"

import { restrictUser } from "~/lib/utils";
import { auth } from "../auth";
import { db } from "../db";
import { createPresignedUrlToDownload } from "./s3-file-management";
import { env } from "~/env";
import { unstable_cache } from "~/lib/unstable-cache";
import { getErrorMessage } from "~/lib/handle-error";

export async function getPresignedUrl(id: string) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }
  
  const fetchData = async () => {
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
      console.log(err)
      const error = getErrorMessage(err)
      return {
        data: null,
        error
      };
    }
  }
    
  const result = await unstable_cache(
    fetchData,
    [id],
    { revalidate: 1200, tags: ["fields", "map_items"] }
  )()

  return result
}