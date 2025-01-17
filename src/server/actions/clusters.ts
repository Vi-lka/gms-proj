"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { type UpdateClusterSchema, type CreateClusterSchema, type MapItemSchema, type CompanySchema, type UpdateCompanySchema } from "~/lib/validations/forms";
import { auth } from "../auth";
import { getErrorMessage } from "~/lib/handle-error";
import { db } from "../db";
import { clusters, companies, mapItems } from "../db/schema";
import { takeFirstOrThrow, updateInManySql } from "../db/utils";
import { eq, inArray } from "drizzle-orm";

export async function createCluster({
  input,
  mapItem
}: {
  input: CreateClusterSchema,
  mapItem: MapItemSchema
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
      const clusterRes = await tx
        .insert(clusters)
        .values({
          name: input.name,
          description: input.description,
        })
        .returning()
        .then(takeFirstOrThrow)

      const newMapItem = await tx
        .insert(mapItems)
        .values({
          clusterId: clusterRes.id,
          description: mapItem.description,
          xPos: mapItem.xPos,
          yPos: mapItem.yPos
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

export async function updateCluster(
  input: UpdateClusterSchema,
  oldCompanies: CompanySchema[]
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
    const companiesToDelete = oldCompanies.filter(oldCompany => 
      !input.companies.some(inputCompany => inputCompany.id === oldCompany.id)
    ) as UpdateCompanySchema[]
    const companiesToUpdate = input.companies.filter(inputCompany => inputCompany.id) as UpdateCompanySchema[]
    const companiesToAdd = input.companies.filter(inputCompany => !inputCompany.id)

    await db.transaction(async (tx) => {
      const mapItem = await tx.query.mapItems.findFirst({
        where: (data, { eq }) => eq(data.clusterId, input.id),
      })
      .then(data => takeFirstOrThrow([data]))

      const updatedCluster = await tx
        .update(clusters)
        .set({
          name: input.name,
          description: input.description,
        })
        .where(eq(clusters.id, input.id))
        .returning()
        .then(takeFirstOrThrow)

      if (companiesToDelete.length > 0) {
        await tx
          .delete(companies)
          .where(inArray(companies.id, companiesToDelete.map(company => company.id)))
      } 

      if (companiesToUpdate.length > 0) {
        await tx
          .update(companies)
          .set(
            updateInManySql({
              id: companies.id,
              inputs: companiesToUpdate,
              inputKeys: ["name", "description"]
            })
          )
          .where(inArray(companies.id, companiesToUpdate.map(company => company.id)))
      }
      
      const newCompanies = companiesToAdd.map(company => (
        {
          name: company.name,
          description: company.description,
          clusterId: updatedCluster.id,
          mapItemId: mapItem.id,
        }
      ))
      if (newCompanies.length > 0) {
        await tx
          .insert(companies)
          .values(newCompanies)
      }
    })

    revalidateTag("map_items")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}