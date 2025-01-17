"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { type UpdateAreasDataSchema, type CreateAreasDataSchema } from "~/lib/validations/forms";
import { auth } from "../auth";
import { getErrorMessage } from "~/lib/handle-error";
import { db } from "../db";
import { areasData } from "../db/schema";
import { takeFirstOrThrow } from "../db/utils";
import { eq, inArray } from "drizzle-orm";

export async function createAreasData(input: CreateAreasDataSchema) {
  noStore()
  
  const session = await auth();
  if (session?.user.role !== "admin") {
    const err = new Error("No access")
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  const {analysisDate, samplingDate, ...otherData} = input

  const analysisDateGMT = analysisDate ? new Date(analysisDate) : null
  const samplingDateGMT = samplingDate ? new Date(samplingDate) : null

  try {
    await db
      .insert(areasData)
      .values({
        analysisDate: analysisDateGMT,
        samplingDate: samplingDateGMT,
        ...otherData,
      })
      .returning()
      .then(takeFirstOrThrow)

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

export async function updateAreasData(input: UpdateAreasDataSchema) {
  noStore()
  
  const session = await auth();
  if (session?.user.role !== "admin") {
    const err = new Error("No access")
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  const {id: areaDataId, analysisDate, samplingDate, ...otherData} = input
  
  const analysisDateGMT = analysisDate ? new Date(analysisDate) : null
  const samplingDateGMT = samplingDate ? new Date(samplingDate) : null

  try {
    const result = await db
      .update(areasData)
      .set({
        analysisDate: analysisDateGMT,
        samplingDate: samplingDateGMT,
        ...otherData
      })
      .where(eq(areasData.id, areaDataId))
      .returning()
      .then(takeFirstOrThrow)

    revalidateTag("map_items")
    revalidateTag("fields")

    return {
      data: result,
      error: null
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function deleteAreasData(ids: string[]) {
  noStore()
  
  const session = await auth();
  if (session?.user.role !== "admin") {
    const err = new Error("No access")
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    await db
      .delete(areasData)
      .where(inArray(areasData.id, ids))

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