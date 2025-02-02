"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { type MapItemT } from "~/lib/types";
import { auth } from "../auth";
import { getErrorMessage } from "~/lib/handle-error";
import { db } from "../db";
import { clusters, companies, companiesToMapItems, mapItems } from "../db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { type CompanyToClusterSchema, type UpdateCompanySchema, type CreateMapItemClusterSchema, type CreateMapItemSchema, UpdateClusterSchema, type UpdateMapItemClusterSchema } from "~/lib/validations/forms";
import { takeFirstOrThrow } from "../db/utils";
import { restrictUser } from "~/lib/utils";

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
  id: companyId,
  xPos,
  yPos
}: CreateMapItemT) {
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
}: CreateMapItemClusterT) {
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
    const result = await db.transaction(async (tx) => {
      const newCluster = await tx
        .insert(clusters)
        .values({
          name: name,
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

      const companiesIds = companiesInput.map(async compInput => {
        if (compInput.id && compInput.id.length > 0) {
          return compInput.id
        } else {
          const newCompany = await tx
            .insert(companies)
            .values({
              name: compInput.name!,
              description: compInput.description,
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
  if (restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    const deleteOldCompany = !input.companiesInput.some(inputCompany => 
      inputCompany.id === oldCompany.id
    )
    const newCompaniesInput = input.companiesInput.filter(inputCompany => 
      inputCompany.id !== oldCompany.id
    )

    const result = await db.transaction(async (tx) => {
      const newCluster = await tx
        .insert(clusters)
        .values({
          name: input.name,
          description: input.description,
        })
        .returning()
        .then(takeFirstOrThrow)

      // connect map item to cluster
      await tx
        .update(mapItems)
        .set({
          clusterId: newCluster.id
        })
        .where(eq(mapItems.id, input.mapItemId))

      // handle old company
      if (deleteOldCompany) {
        await tx
          .delete(companiesToMapItems)
          .where(and(
            eq(companiesToMapItems.companyId, oldCompany.id),
            eq(companiesToMapItems.mapItemId, input.mapItemId)
          ))
      }

      // handle new companies
      const companiesIds = newCompaniesInput.map(async company => {
        if (company.id) {
          return company.id
        } else {
          const newCompany = await tx
            .insert(companies)
            .values({
              name: company.name!,
              description: company.description,
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

export async function updateMapItemCluster(
  input: UpdateMapItemClusterSchema,
  oldCompanies: UpdateCompanySchema[]
) {
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
    const companiesToDelete = oldCompanies.filter(oldCompany => 
      !input.companiesInput.some(inputCompany => inputCompany.id === oldCompany.id)
    )

    const companiesWithId = input.companiesInput.filter(inputCompany => inputCompany.id) as UpdateCompanySchema[]
    const companiesToAdd = companiesWithId.filter(comp => !oldCompanies.some(oldCompany => oldCompany.id === comp.id))

    const companiesToCreate = input.companiesInput.filter(inputCompany => !inputCompany.id)

    await db.transaction(async (tx) => {
      await tx
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
          .delete(companiesToMapItems)
          .where(and(
            inArray(companiesToMapItems.companyId, companiesToDelete.map(company => company.id)),
            eq(companiesToMapItems.mapItemId, input.mapItemId)
          ))
      } 

      if (companiesToAdd.length > 0) {
        await tx
          .insert(companiesToMapItems)
          .values(companiesToAdd.map(comp => ({
            companyId: comp.id,
            mapItemId: input.mapItemId,
          })))
      }
      
      if (companiesToCreate.length > 0) {
        const newCompanies = await tx
          .insert(companies)
          .values(companiesToCreate.map(comp => ({
            name: comp.name!,
            description: comp.description,
          })))
          .returning()
        await tx
          .insert(companiesToMapItems)
          .values(newCompanies.map(comp => ({
            companyId: comp.id,
            mapItemId: input.mapItemId,
          })))
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
  if (restrictUser(session?.user.role, 'admin-panel')) {
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
  if (restrictUser(session?.user.role, 'admin-panel')) {
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
        .returning()
        .then(takeFirstOrThrow)

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