"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { type CreateCompanySchema, type UpdateCompanySchema } from "~/lib/validations/forms"
import { db } from "../db"
import { auth } from "../auth";
import { getErrorMessage } from "~/lib/handle-error";
import { companies, companiesToMapItems, mapItems } from "../db/schema";
import { takeFirstOrThrow } from "../db/utils";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { restrictUser } from "~/lib/utils";

export async function createCompany(input: CreateCompanySchema) {
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
      .insert(companies)
      .values({
        createUserId: session.user.id,
        ...input
      })
      .returning()
      .then(takeFirstOrThrow)

    revalidateTag("companies")

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

export async function updateCompany(input: UpdateCompanySchema) {
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
    const result = await db
      .update(companies)
      .set({
        updateUserId: session.user.id,
        name: input.name,
        description: input.description,
      })
      .where(eq(companies.id, input.id))
      .returning()
      .then(takeFirstOrThrow)

    revalidateTag("companies")

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

export async function deleteCompanies(ids: string[]) {
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
      .delete(mapItems)
      .where(and(
        isNull(mapItems.clusterId),
        inArray(
          mapItems.id,
          db
            .select({mapItemId: companiesToMapItems.mapItemId})
            .from(companiesToMapItems)
            .where(inArray(companiesToMapItems.companyId, ids))
        )
      ))

    revalidateTag("map_items")

    await db
      .delete(companies)
      .where(inArray(companies.id, ids))

    // await db
      // .delete(companiesToMapItems)
      // .where(inArray(companiesToMapItems.companyId, ids))

    revalidateTag("companies")

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