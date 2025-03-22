"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { type MapItemT } from "~/lib/types";
import { auth } from "../auth";
import { getErrorMessage } from "~/lib/handle-error";
import { db } from "../db";
import { clusters, companiesToMapItems, fields, mapItems } from "../db/schema";
import { and, eq, inArray } from "drizzle-orm";
import type { 
  CompanyToClusterSchema,
  CreateMapItemClusterSchema,
  CreateMapItemSchema,
  UpdateMapItemClusterSchema,
  UpdateMapItemCompanySchema
} from "~/lib/validations/forms";
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

export async function createMapItem(input: CreateMapItemT) {
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
    const result = await db.transaction(async (tx) => {
      const newMapItem = await tx
        .insert(mapItems)
        .values({
          createUserId: session.user.id,
          xPos: input.xPos,
          yPos: input.yPos
        })
        .returning()
        .then(takeFirstOrThrow)

      await tx
        .update(fields)
        .set({
          updateUserId: session.user.id,
          mapItemId: newMapItem.id,
        })
        .where(inArray(fields.id, input.fields))

      await tx
        .insert(companiesToMapItems)
        .values({
          createUserId: session.user.id,
          companyId: input.id,
          mapItemId: newMapItem.id
        })
    
      revalidateTag("map_items")
      revalidateTag("fields")
      revalidateTag("companies")

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

export async function createMapItemCluster(input: CreateMapItemClusterT) {
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
    const result = await db.transaction(async (tx) => {
      const newCluster = await tx
        .insert(clusters)
        .values({
          createUserId: session.user.id,
          name: input.name,
          description: input.description,
        })
        .returning()
        .then(takeFirstOrThrow)

      const newMapItem = await tx
        .insert(mapItems)
        .values({
          createUserId: session.user.id,
          clusterId: newCluster.id,
          xPos: input.xPos,
          yPos: input.yPos,
        })
        .returning()
        .then(takeFirstOrThrow)

      await tx
        .insert(companiesToMapItems)
        .values(input.companiesInput.map(comp => ({
          createUserId: session.user.id,
          companyId: comp.id,
          mapItemId: newMapItem.id
        })))

      const fieldsIds = input.companiesInput.map(compInput => compInput.fields).join().split(",");

      await tx
        .update(fields)
        .set({
          updateUserId: session.user.id,
          mapItemId: newMapItem.id,
        })
        .where(inArray(fields.id, fieldsIds))

      revalidateTag("clusters")
      revalidateTag("map_items")
      revalidateTag("companies")
      revalidateTag("fields")

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
  oldCompany: UpdateMapItemCompanySchema
) {
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
    const newCompaniesInput = input.companiesInput.filter(inputCompany => 
      inputCompany.id !== oldCompany.id
    )
    const oldCompanyInInput = input.companiesInput.find(inputCompany => 
      inputCompany.id === oldCompany.id
    )

    const fieldsToDelete = oldCompanyInInput
      ? oldCompany.fields.filter(oldField => 
          !oldCompanyInInput.fields.some(inputField => inputField === oldField)
        )
      : oldCompany.fields

    const fieldsIds = input.companiesInput.map(compInput => compInput.fields).join().split(",");

    const result = await db.transaction(async (tx) => {
      const newCluster = await tx
        .insert(clusters)
        .values({
          createUserId: session.user.id,
          name: input.name,
          description: input.description,
        })
        .returning()
        .then(takeFirstOrThrow)

      // connect map item to cluster
      await tx
        .update(mapItems)
        .set({
          updateUserId: session.user.id,
          clusterId: newCluster.id
        })
        .where(eq(mapItems.id, input.mapItemId))

      // handle old company
      if (oldCompanyInInput === undefined) {
        await tx
          .delete(companiesToMapItems)
          .where(and(
            eq(companiesToMapItems.companyId, oldCompany.id),
            eq(companiesToMapItems.mapItemId, input.mapItemId)
          ))
      }

      // connect companies to map item
      await tx
        .insert(companiesToMapItems)
        .values(newCompaniesInput.map(company => ({
          createUserId: session.user.id,
          companyId: company.id,
          mapItemId: input.mapItemId
        })))

      if (fieldsToDelete.length > 0) {
        await tx
          .update(fields)
          .set({
            updateUserId: session.user.id,
            mapItemId: null
          })
          .where(inArray(fields.id, fieldsToDelete))
      }

      if (fieldsIds.length > 0) {
        await tx
          .update(fields)
          .set({
            updateUserId: session.user.id,
            mapItemId: input.mapItemId
          })
          .where(inArray(fields.id, fieldsIds))
      }

      revalidateTag("clusters")
      revalidateTag("map_items")
      revalidateTag("companies")
      revalidateTag("fields")

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

export async function updateMapItemCompany(
  input: UpdateMapItemCompanySchema,
  oldData: UpdateMapItemCompanySchema
) {
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
    const fieldsToDelete = oldData.fields.filter(oldField => 
      !input.fields.some(inputField => inputField === oldField)
    )
    const fieldsToAdd = input.fields.filter(inputField => 
      !oldData.fields.some(oldField => oldField === inputField)
    )

    await db.transaction(async (tx) => {
      if (fieldsToDelete.length > 0) {
        await tx
          .update(fields)
          .set({
            updateUserId: session.user.id,
            mapItemId: null
          })
          .where(inArray(fields.id, fieldsToDelete))
      }

      if (fieldsToAdd.length > 0) {
        await tx
          .update(fields)
          .set({
            updateUserId: session.user.id,
            mapItemId: input.mapItemId
          })
          .where(inArray(fields.id, fieldsToAdd))
      }

      if (input.id !== oldData.id) {
        await tx
          .delete(companiesToMapItems)
          .where(and(
            eq(companiesToMapItems.companyId, oldData.id),
            eq(companiesToMapItems.mapItemId, oldData.mapItemId)
          ))
  
        await tx
          .insert(companiesToMapItems)
          .values({
            createUserId: session.user.id,
            companyId: input.id,
            mapItemId: input.mapItemId
          })
      }
    })

    revalidateTag("map_items")
    revalidateTag("companies")
    revalidateTag("fields")

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

export async function updateMapItemCluster(
  input: UpdateMapItemClusterSchema,
  oldCompanies: CreateMapItemSchema[]
) {
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
    const companiesToDelete = oldCompanies.filter(oldCompany => 
      !input.companiesInput.some(inputCompany => inputCompany.id === oldCompany.id)
    )
    const companiesToAdd = input.companiesInput.filter(comp => 
      !oldCompanies.some(oldCompany => oldCompany.id === comp.id)
    )

    const inputFieldsIds = input.companiesInput.map(compInput => compInput.fields).join().split(",");
    const oldFieldsIds = oldCompanies.map(company => company.fields).join().split(",");

    const fieldsToDelete = oldFieldsIds.filter(oldField => 
      !inputFieldsIds.some(inputField => inputField === oldField)
    )
    const fieldsToAdd = inputFieldsIds.filter(inputField => 
      !oldFieldsIds.some(oldField => oldField === inputField)
    )

    await db.transaction(async (tx) => {
      await tx
        .update(clusters)
        .set({
          updateUserId: session.user.id,
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
            createUserId: session.user.id,
            companyId: comp.id,
            mapItemId: input.mapItemId,
          })))
      }

      if (fieldsToDelete.length > 0) {
        await tx
          .update(fields)
          .set({
            updateUserId: session.user.id,
            mapItemId: null
          })
          .where(inArray(fields.id, fieldsToDelete))
      }

      if (fieldsToAdd.length > 0) {
        await tx
          .update(fields)
          .set({
            updateUserId: session.user.id,
            mapItemId: input.mapItemId
          })
          .where(inArray(fields.id, fieldsToAdd))
      }
    })

    revalidateTag("map_items")
    revalidateTag("clusters")
    revalidateTag("companies")
    revalidateTag("fields")

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
  if (!session || restrictUser(session?.user.role, 'admin-panel')) {
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
        updateUserId: session.user.id,
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
  if (!session || restrictUser(session?.user.role, 'admin-panel')) {
    const err = new Error("No access")
    return {
      data: null,
      error: getErrorMessage(err)
    }
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(fields)
        .set({
          updateUserId: session.user.id,
          mapItemId: null
        })
        .where(eq(fields.mapItemId, item.id))

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
    revalidateTag("clusters")
    revalidateTag("companies")
    revalidateTag("fields")

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