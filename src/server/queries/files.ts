"use server"

import "server-only"

import { type GetFilesSchema } from "~/lib/validations/files";
import { auth } from "../auth";
import { restrictUser } from "~/lib/utils";
import { and, count, eq, getTableColumns, ilike, isNotNull, isNull, lte, or, type SQL } from "drizzle-orm";
import { fieldsMaps, type FileDBWithUrl, files, users } from "../db/schema";
import { db } from "../db";
import { getOrderBy } from "../db/utils";
import { getPresignedUrl } from "../s3-bucket/queries";
import { getErrorMessage } from "~/lib/handle-error";
import { unstable_cache } from "~/lib/unstable-cache";
import { alias } from "drizzle-orm/pg-core";
import * as Sentry from "@sentry/nextjs";

export async function getFiles(
  input: GetFilesSchema,
) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const usersUpdated = alias(users, 'users_updated');

      const offset = (input.page - 1) * input.perPage

      const whereConditions: (SQL | undefined)[] = [];
      const formatConditions: (SQL | undefined)[] = [];

      if (input.id) {
        whereConditions.push(or(
          eq(files.id, input.id),
        ));
      }
      if (input.fileName) {
        whereConditions.push(or(
          ilike(files.id, `%${input.fileName}%`),
          ilike(files.fileName, `%${input.fileName}%`),
          ilike(files.originalName, `%${input.fileName}%`),
          ilike(fieldsMaps.id, `%${input.fileName}%`),
          ilike(fieldsMaps.name, `%${input.fileName}%`),
          ilike(users.id, `%${input.fileName}%`),
          ilike(users.name, `%${input.fileName}%`),
          ilike(usersUpdated.id, `%${input.fileName}%`),
          ilike(usersUpdated.name, `%${input.fileName}%`)
        ));
      }
      if (input.hasConnected === "true") {
        whereConditions.push(isNotNull(fieldsMaps.fileId))
      }
      if (input.hasConnected === "false") {
        whereConditions.push(isNull(fieldsMaps.fileId))
      }
      if (input.format.length > 0) {
        input.format.forEach((format) => {
          formatConditions.push(ilike(files.originalName, `%.${format}`))
        })
        whereConditions.push(or(...formatConditions))
      }
      if (input.maxSize !== null) {
        whereConditions.push(lte(files.size, input.maxSize))
      }

      const orderBy = getOrderBy({
        config: [
          { key: 'createUserName', column: users.name },
          { key: 'updateUserName', column: usersUpdated.name },
          { key: 'fieldMapId', column: fieldsMaps.id },
          { key: 'fieldMapName', column: fieldsMaps.name },
        ], 
        sortInput: input.sort, 
        defaultColumn: files.originalName,
        table: files
      });

      const { data, pageCount } = await db.transaction(async (tx) => {
        const data = await tx
          .select({
            ...getTableColumns(files),
            fieldMapId: fieldsMaps.id,
            fieldMapName: fieldsMaps.name,
            createUserName: users.name,
            updateUserName: usersUpdated.name,
          })
          .from(files)
          .limit(input.perPage)
          .offset(offset)
          .leftJoin(users, eq(files.createUserId, users.id))
          .leftJoin(usersUpdated, eq(files.updateUserId, usersUpdated.id))
          .leftJoin(fieldsMaps, eq(files.id, fieldsMaps.fileId))
          .where(and(...whereConditions))
          .orderBy(...orderBy)
  
        const total = await tx
          .select({ 
            count: count() 
          })
          .from(files)
          .leftJoin(users, eq(files.createUserId, users.id))
          .leftJoin(usersUpdated, eq(files.updateUserId, usersUpdated.id))
          .leftJoin(fieldsMaps, eq(files.id, fieldsMaps.fileId))
          .where(and(...whereConditions))
          .execute()
          .then((res) => res[0]?.count ?? 0)
    
        const pageCount = Math.ceil(total / input.perPage);

        return {
          data,
          pageCount,
        }
      })

      return { data, pageCount, error: null }
    } catch (err) {
      Sentry.captureException(err);
      console.error(err)
      return { data: [], pageCount: 0, error: getErrorMessage(err) }
    }
  }

  const result = await unstable_cache(
    fetchData,
    [JSON.stringify(input)],
    { revalidate: false, tags: ["files", "fields_maps"] }
  )()

  const dataWithUrls: FileDBWithUrl[] = await Promise.all(
    result.data.map(async (file) => {
      const fileUrl = await getPresignedUrl(file.id)
      if (fileUrl.error !== null) throw new Error(fileUrl.error)
      return {
        ...file,
        fileUrl: fileUrl.data,
      }
    })
  )

  return {
    data: dataWithUrls,
    pageCount: result.pageCount,
    error: result.error
  }
}