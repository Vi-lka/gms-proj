"use server"

import { type UpdateFieldSchema, type CreateFieldSchema } from "~/lib/validations/forms";
import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { auth } from "../auth";
import { getErrorMessage } from "~/lib/handle-error";
import { db } from "../db";
import { fields } from "../db/schema";
import { takeFirstOrThrow } from "../db/utils";
import { eq, inArray } from "drizzle-orm";
import { restrictUser } from "~/lib/utils";
import * as Sentry from "@sentry/nextjs";

export async function createField(input: CreateFieldSchema) {
  noStore()
  
  const session = await auth();
  if (!session || restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    Sentry.captureException(new Error(`No access: createField, userId: ${session?.user.id}`));
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    await db
      .insert(fields)
      .values({
        createUserId: session.user.id,
        ...input
      })
      .returning()
      .then(takeFirstOrThrow)

    revalidateTag("fields")

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

export async function updateField(input: UpdateFieldSchema) {
  noStore()
  
  const session = await auth();
  if (!session || restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    Sentry.captureException(new Error(`No access: updateField, userId: ${session?.user.id}`));
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    const result = await db
      .update(fields)
      .set({
        updateUserId: session.user.id,
        name: input.name,
        description: input.description,
        companyId: input.companyId,
      })
      .where(eq(fields.id, input.id))
      .returning()
      .then(takeFirstOrThrow)

    revalidateTag("fields")

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

export async function deleteFields(ids: string[]) {
  noStore()
  
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    Sentry.captureException(new Error(`No access: deleteFields, userId: ${session?.user.id}`));
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    await db
      .delete(fields)
      .where(inArray(fields.id, ids))

    revalidateTag("fields")

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