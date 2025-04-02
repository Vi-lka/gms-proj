"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { type UpdateAreasDataSchema, type CreateAreasDataSchema } from "~/lib/validations/forms";
import { auth } from "../auth";
import { getErrorMessage } from "~/lib/handle-error";
import { db } from "../db";
import { areasData } from "../db/schema";
import { takeFirstOrThrow } from "../db/utils";
import { eq, inArray } from "drizzle-orm";
import { restrictUser } from "~/lib/utils";
import * as Sentry from "@sentry/nextjs";

export async function createAreasData(input: CreateAreasDataSchema) {
  noStore()
  
  const session = await auth();
  if (!session || restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    Sentry.captureException(new Error(`No access: createAreasData, userId: ${session?.user.id}`));
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    const {analysisDate, samplingDate, ...otherData} = input

    const analysisDateGMT = analysisDate ? new Date(analysisDate) : null
    const samplingDateGMT = samplingDate ? new Date(samplingDate) : null

    await db
      .insert(areasData)
      .values({
        createUserId: session.user.id,
        analysisDate: analysisDateGMT,
        samplingDate: samplingDateGMT,
        ...otherData,
      })
      .returning()
      .then(takeFirstOrThrow)

    revalidateTag("areas_data")

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

export async function updateAreasData(input: UpdateAreasDataSchema) {
  noStore()
  
  const session = await auth();
  if (!session || restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    Sentry.captureException(new Error(`No access: updateAreasData, userId: ${session?.user.id}`));
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    const {id: areaDataId, analysisDate, samplingDate, ...otherData} = input
  
    const analysisDateGMT = analysisDate ? new Date(analysisDate) : null
    const samplingDateGMT = samplingDate ? new Date(samplingDate) : null

    const result = await db
      .update(areasData)
      .set({
        updateUserId: session.user.id,
        analysisDate: analysisDateGMT,
        samplingDate: samplingDateGMT,
        ...otherData
      })
      .where(eq(areasData.id, areaDataId))
      .returning()
      .then(takeFirstOrThrow)

    revalidateTag("areas_data")

    return {
      data: result,
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

export async function deleteAreasData(ids: string[]) {
  noStore()
  
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    Sentry.captureException(new Error(`No access: deleteAreasData, userId: ${session?.user.id}`));
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    await db
      .delete(areasData)
      .where(inArray(areasData.id, ids))

    revalidateTag("areas_data")

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