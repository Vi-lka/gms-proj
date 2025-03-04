"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { type UpdateProfitabilitySchema, type CreateProfitabilitySchema } from "~/lib/validations/forms";
import { auth } from "../auth";
import { restrictUser } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";
import { db } from "../db";
import { profitability } from "../db/schema";
import { takeFirstOrThrow } from "../db/utils";
import { eq } from "drizzle-orm";

export async function createProfitability(input: CreateProfitabilitySchema) {
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
      .insert(profitability)
      .values(input)
      .returning()
      .then(takeFirstOrThrow)

    revalidateTag("profitability")

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

export async function updateProfitability(input: UpdateProfitabilitySchema) {
  noStore()
  
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  const {id: profitabilityId, ...otherData} = input
  try {
    const result = await db
      .update(profitability)
      .set(otherData)
      .where(eq(profitability.id, profitabilityId))
      .returning()
      .then(takeFirstOrThrow)

    revalidateTag("profitability")

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