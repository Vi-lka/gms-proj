"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { type MapItemT } from "~/lib/types";
import { auth } from "../auth";
import { getErrorMessage } from "~/lib/handle-error";
import { db } from "../db";
import { clusters, companies, mapItems } from "../db/schema";
import { eq, inArray } from "drizzle-orm";

export async function moveMapItem({
  id,
  xPos,
  yPos,
}: {
  id: string,
  xPos: number,
  yPos: number,
}) {
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
      .update(mapItems)
      .set({
        xPos,
        yPos
      })
      .where(eq(mapItems.id, id))

    revalidateTag("map_items")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    console.log(err)
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function deleteMapItem(
  item: MapItemT,
) {
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
    await db.transaction(async (tx) => {
      await tx
        .delete(companies)
        .where(inArray(companies.id, item.companies.map(company => company.id)))

      await tx
        .delete(mapItems)
        .where(eq(mapItems.id, item.id))

      if (item.cluster) {
        await tx
        .delete(clusters)
        .where(eq(clusters.id, item.cluster.id))
      }
    })

    revalidateTag("map_items")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    console.log(err)
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}