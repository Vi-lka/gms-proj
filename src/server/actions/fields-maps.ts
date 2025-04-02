"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { auth } from "../auth";
import { restrictUser, splitIntoPairs } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";
import { fieldMapPolygons, fieldsMaps } from "../db/schema";
import { db } from "../db";
import { eq, inArray } from "drizzle-orm";
import { type UpdateFieldMapSchema, type CreateFieldMapSchema } from "~/lib/validations/forms";
import { takeFirstOrThrow } from "../db/utils";
import { type DefaultEditDataT } from "~/components/poly-annotation/types";
import * as Sentry from "@sentry/nextjs";

export async function createFieldMap(input: CreateFieldMapSchema) {
  noStore()
  
  const session = await auth();
  if (!session || restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    Sentry.captureException(new Error(`No access: createFieldMap, userId: ${session?.user.id}`));
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    const { polygons, fileName, ...rest } = input

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

    revalidateTag("fields_maps")
    revalidateTag("polygons")

    return {
      data: null,
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

export async function updateFieldMap(input: UpdateFieldMapSchema, oldData: DefaultEditDataT) {
  noStore()
  
  const session = await auth();
  if (!session || restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    Sentry.captureException(new Error(`No access: updateFieldMap, userId: ${session?.user.id}`));
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
      oldData.polygons.some(oldpolygon => {
        if (oldpolygon.id === inputPolygon.id) {
          const isSamePoints = JSON.stringify(oldpolygon.points) === JSON.stringify(splitIntoPairs(inputPolygon.points))
          if (oldpolygon.licensedArea.id !== inputPolygon.areaId || !isSamePoints) return true
        } else return false
      })
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

    revalidateTag("fields_maps")
    revalidateTag("polygons")

    return {
      data: null,
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

export async function deleteFieldsMaps(ids: string[]) {
  noStore()
  
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    Sentry.captureException(new Error(`No access: deleteFieldsMaps, userId: ${session?.user.id}`));
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    await db
      .delete(fieldsMaps)
      .where(inArray(fieldsMaps.id, ids))

    revalidateTag("fields_maps")
    revalidateTag("polygons")

    return {
      data: null,
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