"use server"

import "server-only"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { auth } from "../auth";
import { restrictUser } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";
import { mapData } from "../db/schema";
import { db } from "../db";
import { takeFirstOrThrow } from "../db/utils";
import { eq } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";

export async function createMap(fileId: string) {
  noStore()

  const session = await auth();
  if (!session || restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    Sentry.captureException(new Error(`No access: createMap, userId: ${session?.user.id}`));
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    await db
      .insert(mapData)
      .values({
        createUserId: session.user.id,
        selected: true,
        fileId
      })
      .returning()
      .then(takeFirstOrThrow)

    revalidateTag("map-data")

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

export async function updateMap(id: string, fileId: string) {
    noStore()
  
    const session = await auth();
    if (!session || restrictUser(session?.user.role, 'admin-panel')) {
      const err = new Error("No access")
      Sentry.captureException(new Error(`No access: updateMap, userId: ${session?.user.id}`));
      return {
        data: null,
        error: getErrorMessage(err)
      }
    }
  
    try {
      await db
        .update(mapData)
        .set({
          updateUserId: session.user.id,
          selected: true,
          fileId
        })
        .where(eq(mapData.id, id))
        .returning()
        .then(takeFirstOrThrow)
  
      revalidateTag("map-data")
  
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