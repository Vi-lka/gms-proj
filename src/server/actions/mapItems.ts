"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { type MapItemT } from "~/lib/types";
import { auth } from "../auth";
import { getErrorMessage } from "~/lib/handle-error";
import { db } from "../db";
import { clusters, companies, companiesToMapItems, mapItems } from "../db/schema";
import { eq } from "drizzle-orm";
import { CompanyToClusterSchema, UpdateCompanySchema, type CreateMapItemClusterSchema, type CreateMapItemSchema } from "~/lib/validations/forms";
import { takeFirstOrThrow } from "../db/utils";

type CreateMapItemT = {
  xPos: number,
  yPos: number,
} & CreateMapItemSchema

type CreateMapItemClusterT = {
  xPos: number,
  yPos: number,
} & CreateMapItemClusterSchema

export async function createMapItem({
  name,
  description,
  companyId,
  xPos,
  yPos
}: CreateMapItemT) {
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
          xPos,
          yPos
        })
        .returning()
        .then(takeFirstOrThrow)

      if (companyId && companyId.length > 0) {
        await tx
          .insert(companiesToMapItems)
          .values({
            companyId,
            mapItemId: newMapItem.id
          })
      } else {
        const newCompany = await tx
          .insert(companies)
          .values({
            name: name!,
            description: description,
          })
          .returning()
          .then(takeFirstOrThrow)

        await tx
          .insert(companiesToMapItems)
          .values({
            companyId: newCompany.id,
            mapItemId: newMapItem.id
          })
      }
    
      revalidateTag("map_items")

      return {
        data: null,
        error: null,
      }
    })

    return result
  } catch (err) {
    console.log(err)
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function createMapItemCluster({
  xPos,
  yPos,
  name,
  companiesInput,
  description,
  clusterId,
}: CreateMapItemClusterT) {
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
      if (clusterId && clusterId.length > 0) {
        const newMapItem = await tx
          .insert(mapItems)
          .values({
            clusterId,
            xPos,
            yPos,
          })
          .returning()
          .then(takeFirstOrThrow)

        const companiesInCluster = await tx
          .select({ id: companies.id })
          .from(companies)
          .where(eq(companies.clusterId, clusterId))

        await tx
          .insert(companiesToMapItems)
          .values(companiesInCluster.map(comp => ({
            companyId: comp.id,
            mapItemId: newMapItem.id
          })))
      } else {
        const newCluster = await tx
          .insert(clusters)
          .values({
            name: name!,
            description: description,
          })
          .returning()
          .then(takeFirstOrThrow)

        const newMapItem = await tx
          .insert(mapItems)
          .values({
            clusterId: newCluster.id,
            xPos,
            yPos,
          })
          .returning()
          .then(takeFirstOrThrow)

        const companiesIds = companiesInput!.map(async input => {
          if (input.companyId && input.companyId.length > 0) {
            await tx
              .update(companies)
              .set({
                clusterId: newCluster.id,
              })
              .where(eq(companies.id, input.companyId))
            return input.companyId
          } else {
            const newCompany = await tx
              .insert(companies)
              .values({
                name: input.name!,
                description: input.description,
                clusterId: newCluster.id
              })
              .returning()
              .then(takeFirstOrThrow)

            return newCompany.id
          }
        })
        const companiesIdsRes = await Promise.all(companiesIds)

        await tx
          .insert(companiesToMapItems)
          .values(companiesIdsRes.map(compId => ({
            companyId: compId,
            mapItemId: newMapItem.id
          })))
      }

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

export async function companyToCluster(
  input: CompanyToClusterSchema,
  oldCompany: UpdateCompanySchema
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
    const deleteOldCompany = !input.companiesInput.some(inputCompany => 
      inputCompany.companyId === oldCompany.id
    )
    const newCompaniesInput = input.companiesInput.filter(inputCompany => 
      inputCompany.companyId !== oldCompany.id
    )

    const result = await db.transaction(async (tx) => {
      let clusterId = ""

      // if cluster selected
      if (input.clusterId && input.clusterId.length > 0) {
        clusterId = input.clusterId

        // connect companies in cluster to map item
        const companiesInCluster = await tx
          .select({ id: companies.id })
          .from(companies)
          .where(eq(companies.clusterId, input.clusterId))
        await tx
          .insert(companiesToMapItems)
          .values(companiesInCluster.map(comp => ({
            companyId: comp.id,
            mapItemId: input.mapItemId
          })))
      } else {
        // create new cluster
        const newCluster = await tx
          .insert(clusters)
          .values({
            name: input.name!,
            description: input.description,
          })
          .returning()
          .then(takeFirstOrThrow)

        clusterId = newCluster.id
      }

      // connect map item to cluster
      await tx
        .update(mapItems)
        .set({
          clusterId
        })

      // handle old company
      if (deleteOldCompany) {
        await tx
          .delete(companiesToMapItems)
          .where(eq(companiesToMapItems.companyId, oldCompany.id))
      } else {
        const oldCompanyData = input.companiesInput.find(company => company.companyId === oldCompany.id) as UpdateCompanySchema
        await tx
          .update(companies)
          .set({
            name: oldCompanyData.name,
            description: oldCompanyData.description,
            clusterId,
          })
          .where(eq(companies.id, oldCompanyData.id))
          .returning()
          .then(takeFirstOrThrow)
      }

      // handle new companies
      const companiesIds = newCompaniesInput.map(async company => {
        if (company.companyId) {
          // connect company to cluster
          await tx
            .update(companies)
            .set({
              clusterId
            })
            .where(eq(companies.id, company.companyId))
          return company.companyId
        } else {
          // create new company
          const newCompany = await tx
            .insert(companies)
            .values({
              name: company.name!,
              description: company.description,
              clusterId
            })
            .returning()
            .then(takeFirstOrThrow)
          return newCompany.id
        }
      })

      // connect companies to map item
      const companiesIdsRes = await Promise.all(companiesIds)
      await tx
        .insert(companiesToMapItems)
        .values(companiesIdsRes.map(compId => ({
          companyId: compId,
          mapItemId: input.mapItemId
        })))

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
        .delete(companiesToMapItems)
        .where(eq(companiesToMapItems.mapItemId, item.id))

      await tx
        .delete(mapItems)
        .where(eq(mapItems.id, item.id))
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