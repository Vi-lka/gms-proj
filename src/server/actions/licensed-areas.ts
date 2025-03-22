"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { auth } from "../auth";
import { getErrorMessage } from "~/lib/handle-error";
import { db } from "../db";
import { licensedAreas } from "../db/schema";
import { eq, inArray } from "drizzle-orm";
import { type UpdateLicensedAreaSchema, type CreateLicensedAreaSchema } from "~/lib/validations/forms";
import { takeFirstOrThrow } from "../db/utils";
import { restrictUser } from "~/lib/utils";

export async function createLicensedArea(input: CreateLicensedAreaSchema) {
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
    await db
      .insert(licensedAreas)
      .values({
        createUserId: session.user.id,
        ...input
      })
      .returning()
      .then(takeFirstOrThrow)

    revalidateTag("licensed_areas")

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

export async function updateLicensedArea(input: UpdateLicensedAreaSchema) {
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
    const result = await db
      .update(licensedAreas)
      .set({
        updateUserId: session.user.id,
        name: input.name,
        description: input.description,
        fieldId: input.fieldId,
      })
      .where(eq(licensedAreas.id, input.id))
      .returning()
      .then(takeFirstOrThrow)

    revalidateTag("licensed_areas")

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

export async function deleteLicensedAreas(ids: string[]) {
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
    await db
      .delete(licensedAreas)
      .where(inArray(licensedAreas.id, ids))

    revalidateTag("licensed_areas")

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