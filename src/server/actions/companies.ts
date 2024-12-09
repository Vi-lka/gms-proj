"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { type CreateMapItemSchema, type CreateCompanySchema, type CreateClusterSchema } from "~/lib/validations/forms"
import { db } from "../db"
import { auth } from "../auth";
import { getErrorMessage } from "~/lib/handle-error";
import { clusters, companies, mapItems } from "../db/schema";
import { takeFirstOrThrow } from "../db/utils";

export async function createCompany({ 
  input,
  mapItem,
}: {
  input: CreateCompanySchema, 
  mapItem: CreateMapItemSchema
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
    const result = await db.transaction(async (tx) => {
      const newMapItem = await tx
        .insert(mapItems)
        .values({
          description: mapItem.description,
          xPos: mapItem.xPos,
          yPos: mapItem.yPos
        })
        .returning()
        .then(takeFirstOrThrow)

      await tx
        .insert(companies)
        .values({
          name: input.name,
          description: input.description,
          clusterId: (input.clusterId && input.clusterId.length > 0) ? input.clusterId : undefined,
          mapItemId: newMapItem.id,
        })

      revalidateTag("map_items")

      return {
        data: null,
        error: null,
      }
    })

    return result
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function createCluster({
  input,
  mapItem
}: {
  input: CreateClusterSchema,
  mapItem: CreateMapItemSchema
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
    const result = await db.transaction(async (tx) => {
      const newMapItem = await tx
        .insert(mapItems)
        .values({
          description: mapItem.description,
          xPos: mapItem.xPos,
          yPos: mapItem.yPos
        })
        .returning()
        .then(takeFirstOrThrow)

      const clusterRes = await tx
        .insert(clusters)
        .values({
          name: input.name,
          description: input.description,
        })
        .returning()
        .then(takeFirstOrThrow)

      const companiesInput = input.companies.map(company => ({
        ...company,
        clusterId: clusterRes.id,
        mapItemId: newMapItem.id,
      }))

      await tx
        .insert(companies)
        .values(companiesInput)

      revalidateTag("map_items")

      return {
        data: null,
        error: null,
      }
    })

    return result
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}