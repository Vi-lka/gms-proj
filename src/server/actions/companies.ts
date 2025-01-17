"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { type MapItemSchema, type CreateCompanySchema, type UpdateCompanySchema, type CompanyToClusterSchema } from "~/lib/validations/forms"
import { db } from "../db"
import { auth } from "../auth";
import { getErrorMessage } from "~/lib/handle-error";
import { clusters, companies, companiesToMapItems, mapItems, type Company } from "../db/schema";
import { takeFirstOrThrow } from "../db/utils";
import { eq } from "drizzle-orm";

export async function createCompany({ 
  input,
  mapItem,
}: {
  input: CreateCompanySchema, 
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
      const newMapItem = await tx
        .insert(mapItems)
        .values({
          description: mapItem.description,
          xPos: mapItem.xPos,
          yPos: mapItem.yPos
        })
        .returning()
        .then(takeFirstOrThrow)

      const newCompany = await tx
        .insert(companies)
        .values({
          name: input.name,
          description: input.description,
          clusterId: (input.clusterId && input.clusterId.length > 0) ? input.clusterId : undefined,
        })
        .returning()
        .then(takeFirstOrThrow)

      await tx
        .insert(companiesToMapItems)
        .values({
          companyId: newCompany.id,
          mapItemId: newMapItem.id
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

export async function updateCompany(input: UpdateCompanySchema) {
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
    const result = await db
      .update(companies)
      .set({
        name: input.name,
        description: input.description,
      })
      .where(eq(companies.id, input.id))
      .returning()
      .then(takeFirstOrThrow)

    revalidateTag("map_items")

    return {
      data: result,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

// export async function companyToCluster(
//   input: CompanyToClusterSchema,
//   oldCompany: UpdateCompanySchema
// ) {
//   noStore()

//   const session = await auth();
//   if (session?.user.role !== "admin") {
//     const err = new Error("No access")
//     return {
//       data: null,
//       error: getErrorMessage(err)
//     }
//   }

//   try {
//     const deleteOldCompany = !input.companies.some(inputCompany => 
//       inputCompany.id === oldCompany.id
//     )
//     const newCompaniesInput = input.companies.filter(inputCompany => 
//       !inputCompany.id
//     )

//     const result = await db.transaction(async (tx) => {
//       const newCluster = await tx
//         .insert(clusters)
//         .values({
//           name: input.name,
//           description: input.description,
//         })
//         .returning()
//         .then(takeFirstOrThrow)

//       let updatedCompany: Company

//       if (deleteOldCompany) {
//         updatedCompany = await tx
//           .delete(companies)
//           .where(eq(companies.id, oldCompany.id))
//           .returning()
//           .then(takeFirstOrThrow)
//       } else {
//         const oldCompanyData = input.companies.find(company => company.id === oldCompany.id) as UpdateCompanySchema
//         updatedCompany = await tx
//           .update(companies)
//           .set({
//             name: oldCompanyData.name,
//             description: oldCompanyData.description,
//             clusterId: newCluster.id,
//           })
//           .where(eq(companies.id, oldCompanyData.id))
//           .returning()
//           .then(takeFirstOrThrow)
//       }

//       const updatedMapItem = await tx
//         .update(mapItems)
//         .set({
//           clusterId: newCluster.id
//         })
//         .where(eq(mapItems.id, updatedCompany.mapItemId!))
//         .returning()
//         .then(takeFirstOrThrow)

//       const newCompanies = newCompaniesInput.map(company => (
//         {
//           name: company.name,
//           description: company.description,
//           clusterId: newCluster.id,
//           mapItemId: updatedMapItem.id,
//         }
//       ))
//       if (newCompanies.length > 0) {
//         await tx
//           .insert(companies)
//           .values(newCompanies)
//       }

//       revalidateTag("map_items")

//       return {
//         data: null,
//         error: null,
//       }
//     })

//     return result
//   } catch (err) {
//     return {
//       data: null,
//       error: getErrorMessage(err),
//     }
//   }
// }