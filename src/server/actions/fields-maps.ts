"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { auth } from "../auth";
import { restrictUser } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";
import { fieldMapPolygons, fieldsMaps } from "../db/schema";
import { db } from "../db";
import { eq, inArray } from "drizzle-orm";
import { type UpdateFieldMapSchema, type CreateFieldMapSchema } from "~/lib/validations/forms";
import { takeFirstOrThrow } from "../db/utils";
import { deleteFile } from "../s3-bucket/actions";
import { type DefaultEditDataT } from "~/components/poly-annotation/types";

export async function createFieldMap(input: CreateFieldMapSchema) {
  noStore()
  
  const session = await auth();
  if (!session || restrictUser(session?.user.role, 'admin-panel')) {
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
        createUserId: session.user.id,
        name: `${fileName}`,
        ...rest
      })
      .returning()
      .then(takeFirstOrThrow)

    await db
      .insert(fieldMapPolygons)
      .values(polygons.map((polygon) => ({
        createUserId: session.user.id,
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

export async function updateFieldMap(input: UpdateFieldMapSchema, oldData: DefaultEditDataT) {
  noStore()
  
  const session = await auth();
  if (!session || restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    const polygonsToDelete = oldData.polygons.filter(oldPolygon => 
      !input.polygons.some(inputPolygon => inputPolygon.id === oldPolygon.id)
    )
    const polygonsToAdd = input.polygons.filter(inputPolygon => 
      !oldData.polygons.some(oldpolygon => oldpolygon.id === inputPolygon.id)
    )
    const polygonsToUpdate = input.polygons.filter(inputPolygon => 
      oldData.polygons.some(oldpolygon => oldpolygon.id === inputPolygon.id)
    )

    const isNewImage = input.fileId !== undefined && input.fileName !== undefined

    await db.transaction(async (tx) => {
      if (isNewImage) {
        await tx
          .update(fieldsMaps)
          .set({
            updateUserId: session.user.id,
            name: `${input.fileName}`,
            fileId: input.fileId,
          })
          .where(eq(fieldsMaps.id, input.id))
      }

      if (polygonsToDelete.length > 0) {
        await tx
          .delete(fieldMapPolygons)
          .where(inArray(fieldMapPolygons.id, polygonsToDelete.map((polygon) => polygon.id)))
      }

      if (polygonsToAdd.length > 0) {
        await tx
          .insert(fieldMapPolygons)
          .values(polygonsToAdd.map(({areaId, points}) => ({
            createUserId: session.user.id,
            fieldMapId: input.id,
            areaId,
            points
          })))
      }

      if (polygonsToUpdate.length > 0) {
        await Promise.all(
          polygonsToUpdate.map(async (polygon) => {
            await tx
              .update(fieldMapPolygons)
              .set({
                updateUserId: session.user.id,
                areaId: polygon.areaId,
                points: polygon.points
              })
              .where(eq(fieldMapPolygons.id, polygon.id))
          })
        )
      }
    })

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
    })
    .then((fieldsMaps) => fieldsMaps.map((fieldMap) => fieldMap.fileId))

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