"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { auth } from "../auth";
import { restrictUser } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";
import { fieldMapPolygons, fieldsMaps } from "../db/schema";
import { db } from "../db";
import { inArray } from "drizzle-orm";
import { type CreateFieldMapSchema } from "~/lib/validations/forms";
import { takeFirstOrThrow } from "../db/utils";
import { deleteFile } from "../s3-bucket/actions";

export async function createFieldMap(input: CreateFieldMapSchema) {
  noStore()
  
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  const { polygons, fileName, ...rest } = input

  try {
    const fieldMap = await db
      .insert(fieldsMaps)
      .values({
        name: `${fileName}-${rest.fieldId}`,
        ...rest
      })
      .returning()
      .then(takeFirstOrThrow)

    await db
      .insert(fieldMapPolygons)
      .values(polygons.map((polygon) => ({
        fieldMapId: fieldMap.id,
        ...polygon
      })))

    revalidateTag("map_items")
    revalidateTag("fields")

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

export async function deleteFieldsMaps(ids: string[]) {
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

    const filesIds = await db.query.fieldsMaps.findMany({
      where: inArray(fieldsMaps.id, ids),
      columns: {
        fileId: true,
      }
    }).then((fieldsMaps) => fieldsMaps.map((fieldMap) => fieldMap.fileId))

    await db
      .delete(fieldsMaps)
      .where(inArray(fieldsMaps.id, ids))

    revalidateTag("map_items")
    revalidateTag("fields")

    await Promise.all(
      // loop through the files ids and delete them
      filesIds.map(async (fileId) => {
        const deletedFile = await deleteFile(fileId)
        if (deletedFile.error) throw new Error(deletedFile.error)
      })
    )

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