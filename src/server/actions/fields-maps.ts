"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { auth } from "../auth";
import { restrictUser } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";
import { fieldsMaps } from "../db/schema";
import { db } from "../db";
import { inArray } from "drizzle-orm";

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
    await db
      .delete(fieldsMaps)
      .where(inArray(fieldsMaps.id, ids))

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